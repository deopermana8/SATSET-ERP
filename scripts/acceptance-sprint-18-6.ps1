$ErrorActionPreference = "Stop"

$baseUrl = "http://127.0.0.1:3026/api"
$results = New-Object System.Collections.Generic.List[string]
$hasFailure = $false

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body = $null
  )

  try {
    $params = @{
      Method = $Method
      Uri = ($baseUrl + $Path)
      UseBasicParsing = $true
    }

    if ($null -ne $Body) {
      $params["ContentType"] = "application/json"
      $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }

    $response = Invoke-WebRequest @params
    $statusCode = [int]$response.StatusCode
    $parsedBody = $null
    if ($response.Content) {
      try {
        $parsedBody = $response.Content | ConvertFrom-Json
      } catch {
        $parsedBody = $response.Content
      }
    }

    return [pscustomobject]@{
      Ok = $true
      StatusCode = [int]$statusCode
      Body = $parsedBody
      Error = $null
    }
  } catch {
    $status = 0
    $errBody = ""

    if ($_.Exception.Response) {
      $status = [int]$_.Exception.Response.StatusCode
      try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errBody = $reader.ReadToEnd()
        if ($errBody -and $errBody.Trim().StartsWith("{")) {
          try {
            $errJson = $errBody | ConvertFrom-Json
            if ($errJson.error) {
              $errBody = [string]$errJson.error
            }
          } catch {
          }
        }
      } catch {
        $errBody = $_.Exception.Message
      }
    } else {
      $errBody = $_.Exception.Message
    }

    return [pscustomobject]@{
      Ok = $false
      StatusCode = $status
      Body = $null
      Error = $errBody
    }
  }
}

function Assert-True {
  param(
    [string]$Name,
    [bool]$Condition,
    [string]$Detail
  )

  if ($Condition) {
    $results.Add("PASS | $Name | $Detail") | Out-Null
  } else {
    $script:hasFailure = $true
    $results.Add("FAIL | $Name | $Detail") | Out-Null
  }
}

# 1) transaksi tanpa shift OPEN ditolak
$noShiftOrder = Invoke-Api -Method "POST" -Path "/cafe-order" -Body @{
  customerName = "Walk In"
  tableNumber = "A1"
  orderType = "DINE_IN"
  paymentMethod = "CASH"
  discount = 0
  tax = 0
  items = @(
    @{
      menuItemId = "missing-menu"
      menuName = "Missing"
      qty = 1
      price = 0
      total = 0
    }
  )
}
Assert-True -Name "No Open Shift Rejected" -Condition (($noShiftOrder.Ok -eq $false) -and ($noShiftOrder.StatusCode -eq 409) -and ($noShiftOrder.Error -match "No open shift")) -Detail ("status={0};error={1}" -f $noShiftOrder.StatusCode, $noShiftOrder.Error)

# 2) open shift
$openShift = Invoke-Api -Method "POST" -Path "/cashier-shift/open" -Body @{
  cashierId = "cashier-1"
  cashierName = "Kasir Cafe"
  openingCash = 100000
}
Assert-True -Name "Open Shift" -Condition ($openShift.Ok -and $openShift.StatusCode -eq 201 -and $openShift.Body.status -eq "OPEN") -Detail ("status={0};shift={1}" -f $openShift.StatusCode, $openShift.Body.shiftNumber)

# 3) create category
$createdCategory = Invoke-Api -Method "POST" -Path "/menu-category" -Body @{
  code = "FNB"
  name = "Food and Beverage"
  active = $true
}
Assert-True -Name "Create Category" -Condition ($createdCategory.Ok -and $createdCategory.StatusCode -eq 201 -and $createdCategory.Body.code -eq "FNB") -Detail ("status={0};id={1}" -f $createdCategory.StatusCode, $createdCategory.Body.id)

# 4) create menu
$createdMenu = Invoke-Api -Method "POST" -Path "/menu-item" -Body @{
  categoryId = $createdCategory.Body.id
  code = "NASGOR"
  name = "Nasi Goreng"
  price = 25000
  stock = 10
  active = $true
}
Assert-True -Name "Create Menu" -Condition ($createdMenu.Ok -and $createdMenu.StatusCode -eq 201 -and $createdMenu.Body.code -eq "NASGOR") -Detail ("status={0};id={1}" -f $createdMenu.StatusCode, $createdMenu.Body.id)

# 5) create order
$createdOrder = Invoke-Api -Method "POST" -Path "/cafe-order" -Body @{
  customerName = "Budi"
  tableNumber = "A1"
  orderType = "DINE_IN"
  paymentMethod = "CASH"
  discount = 1000
  tax = 500
  items = @(
    @{
      menuItemId = $createdMenu.Body.id
      menuName = "Nasi Goreng"
      qty = 2
      price = 0
      total = 0
    }
  )
}
Assert-True -Name "Create Order" -Condition ($createdOrder.Ok -and $createdOrder.StatusCode -eq 201 -and $createdOrder.Body.total -eq 49500) -Detail ("status={0};order={1};total={2}" -f $createdOrder.StatusCode, $createdOrder.Body.orderNumber, $createdOrder.Body.total)

# 6) stock berkurang
$menusAfterOrder = Invoke-Api -Method "GET" -Path "/menu-item"
$menuAfterOrder = $menusAfterOrder.Body | Where-Object { $_.id -eq $createdMenu.Body.id } | Select-Object -First 1
Assert-True -Name "Stock Decreased" -Condition ($menusAfterOrder.Ok -and $menuAfterOrder.stock -eq 8) -Detail ("stock={0}" -f $menuAfterOrder.stock)

# 7) payment berhasil
$paidOrder = Invoke-Api -Method "POST" -Path ("/cafe-order/{0}/pay" -f $createdOrder.Body.id) -Body @{
  paymentMethod = "CASH"
}
Assert-True -Name "Pay Order" -Condition ($paidOrder.Ok -and $paidOrder.StatusCode -eq 200 -and $paidOrder.Body.paymentStatus -eq "PAID") -Detail ("status={0};paymentStatus={1}" -f $paidOrder.StatusCode, $paidOrder.Body.paymentStatus)

# 8) print receipt
$printedOrder = Invoke-Api -Method "POST" -Path ("/cafe-order/{0}/print" -f $createdOrder.Body.id)
Assert-True -Name "Print Receipt" -Condition ($printedOrder.Ok -and $printedOrder.StatusCode -eq 200 -and $printedOrder.Body.receipt -match "SATSET CAFE") -Detail ("status={0};containsReceiptHeader={1}" -f $printedOrder.StatusCode, ($printedOrder.Body.receipt -match "SATSET CAFE"))

# 9) summary valid
$summary = Invoke-Api -Method "GET" -Path "/cafe-order/summary"
Assert-True -Name "Summary Valid" -Condition ($summary.Ok -and $summary.Body.ordersToday -ge 1 -and $summary.Body.cafeSalesToday -ge 49500) -Detail ("ordersToday={0};salesToday={1}" -f $summary.Body.ordersToday, $summary.Body.cafeSalesToday)

# 10) report valid + top selling valid
$report = Invoke-Api -Method "GET" -Path "/cafe-order/report"
$topSelling = $report.Body.topSellingMenu | Select-Object -First 1
Assert-True -Name "Report Valid" -Condition ($report.Ok -and $report.Body.totalOrder -ge 1 -and $report.Body.paidOrder -ge 1 -and $report.Body.totalSales -ge 49500) -Detail ("totalOrder={0};paidOrder={1};totalSales={2}" -f $report.Body.totalOrder, $report.Body.paidOrder, $report.Body.totalSales)
Assert-True -Name "Top Selling Valid" -Condition (($null -ne $topSelling) -and ($topSelling.menuItemId -eq $createdMenu.Body.id) -and ($topSelling.qty -ge 2)) -Detail ("menuItemId={0};qty={1}" -f $topSelling.menuItemId, $topSelling.qty)

# 11) void restore stock
$voidedOrder = Invoke-Api -Method "POST" -Path ("/cafe-order/{0}/void" -f $createdOrder.Body.id)
$menusAfterVoid = Invoke-Api -Method "GET" -Path "/menu-item"
$menuAfterVoid = $menusAfterVoid.Body | Where-Object { $_.id -eq $createdMenu.Body.id } | Select-Object -First 1
Assert-True -Name "Void Order" -Condition ($voidedOrder.Ok -and $voidedOrder.Body.status -eq "VOID") -Detail ("status={0};orderStatus={1}" -f $voidedOrder.StatusCode, $voidedOrder.Body.status)
Assert-True -Name "Stock Restored" -Condition ($menusAfterVoid.Ok -and $menuAfterVoid.stock -eq 10) -Detail ("stock={0}" -f $menuAfterVoid.stock)

$results | ForEach-Object { Write-Output $_ }

if ($hasFailure) {
  Write-Output "EXIT_CODE=1"
  exit 1
}

Write-Output "EXIT_CODE=0"
exit 0
