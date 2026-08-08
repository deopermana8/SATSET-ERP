$ErrorActionPreference = "Stop"

$apiBaseUrl = "http://127.0.0.1:3026/api"
$customerBaseUrl = "http://127.0.0.1:3226"
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
      Uri = ($apiBaseUrl + $Path)
      UseBasicParsing = $true
    }

    if ($null -ne $Body) {
      $params["ContentType"] = "application/json"
      $params["Body"] = ($Body | ConvertTo-Json -Depth 20)
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
      StatusCode = $statusCode
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
            if ($errJson.error) { $errBody = [string]$errJson.error }
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

function Assert-Page200 {
  param([string]$Path)
  try {
    $response = Invoke-WebRequest -Method "GET" -Uri ($customerBaseUrl + $Path) -UseBasicParsing
    Assert-True -Name ("Page " + $Path) -Condition ([int]$response.StatusCode -eq 200) -Detail ("status=" + [string]$response.StatusCode)
  } catch {
    Assert-True -Name ("Page " + $Path) -Condition $false -Detail $_.Exception.Message
  }
}

$openShift = Invoke-Api -Method "POST" -Path "/cashier-shift/open" -Body @{
  cashierId = "cashier-18-7"
  cashierName = "Kasir Sprint 18.7"
  openingCash = 100000
}
Assert-True -Name "Open Shift" -Condition ($openShift.Ok -and $openShift.StatusCode -eq 201) -Detail ("status=" + [string]$openShift.StatusCode)

$category = Invoke-Api -Method "POST" -Path "/menu-category" -Body @{
  code = "SPR18"
  name = "Sprint 18.7"
  active = $true
}
Assert-True -Name "Create Menu Category" -Condition ($category.Ok -and $category.StatusCode -eq 201) -Detail ("id=" + [string]$category.Body.id)

$menu = Invoke-Api -Method "POST" -Path "/menu-item" -Body @{
  categoryId = $category.Body.id
  code = "MNU-187"
  name = "Menu Sprint 18.7"
  price = 15000
  stock = 30
  active = $true
}
Assert-True -Name "Create Menu" -Condition ($menu.Ok -and $menu.StatusCode -eq 201) -Detail ("id=" + [string]$menu.Body.id)

$supplier = Invoke-Api -Method "POST" -Path "/supplier" -Body @{
  code = "SUP-187"
  name = "Supplier Sprint"
  phone = "081234567890"
  email = "supplier187@satset.local"
  address = "Jl. Sprint 18.7"
  active = $true
}
Assert-True -Name "Create Supplier" -Condition ($supplier.Ok -and $supplier.StatusCode -eq 201) -Detail ("id=" + [string]$supplier.Body.id)

$inventory = Invoke-Api -Method "POST" -Path "/inventory" -Body @{
  code = "INV-187"
  name = "Bahan Sprint"
  unit = "GRAM"
  category = "RAW"
  minimumStock = 10
  currentStock = 100
  averageCost = 1000
  active = $true
}
Assert-True -Name "Create Inventory" -Condition ($inventory.Ok -and $inventory.StatusCode -eq 201) -Detail ("id=" + [string]$inventory.Body.id)

$po = Invoke-Api -Method "POST" -Path "/purchase-order" -Body @{
  supplierId = $supplier.Body.id
  supplierName = $supplier.Body.name
  items = @(
    @{
      inventoryId = $inventory.Body.id
      inventoryName = $inventory.Body.name
      qty = 20
      unitCost = 800
      total = 16000
    }
  )
}
Assert-True -Name "Create Purchase Order" -Condition ($po.Ok -and $po.StatusCode -eq 201 -and $po.Body.status -eq "DRAFT") -Detail ("po=" + [string]$po.Body.poNumber)

$poApproved = Invoke-Api -Method "POST" -Path ("/purchase-order/" + $po.Body.id + "/approve")
Assert-True -Name "Approve Purchase Order" -Condition ($poApproved.Ok -and $poApproved.StatusCode -eq 200 -and $poApproved.Body.status -eq "APPROVED") -Detail ("status=" + [string]$poApproved.Body.status)

$poReceived = Invoke-Api -Method "POST" -Path ("/purchase-order/" + $po.Body.id + "/receive")
Assert-True -Name "Receive Purchase Order" -Condition ($poReceived.Ok -and $poReceived.StatusCode -eq 200 -and $poReceived.Body.status -eq "RECEIVED") -Detail ("status=" + [string]$poReceived.Body.status)

$inventoryAfterReceive = Invoke-Api -Method "GET" -Path ("/inventory/" + $inventory.Body.id)
Assert-True -Name "Inventory Increased" -Condition ($inventoryAfterReceive.Ok -and [int]$inventoryAfterReceive.Body.currentStock -eq 120) -Detail ("stock=" + [string]$inventoryAfterReceive.Body.currentStock)

$recipe = Invoke-Api -Method "POST" -Path ("/recipe/menu/" + $menu.Body.id) -Body @{
  menuId = $menu.Body.id
  ingredients = @(
    @{
      inventoryId = $inventory.Body.id
      qty = 2
    }
  )
}
Assert-True -Name "Create Recipe" -Condition ($recipe.Ok -and $recipe.StatusCode -eq 200) -Detail ("menuId=" + [string]$recipe.Body.menuId)

$order = Invoke-Api -Method "POST" -Path "/cafe-order" -Body @{
  customerName = "Cafe Sprint"
  tableNumber = "T-187"
  orderType = "DINE_IN"
  paymentMethod = "CASH"
  discount = 0
  tax = 0
  items = @(
    @{
      menuItemId = $menu.Body.id
      menuName = $menu.Body.name
      qty = 3
      price = 0
      total = 0
    }
  )
}
Assert-True -Name "Create Cafe Order" -Condition ($order.Ok -and $order.StatusCode -eq 201) -Detail ("order=" + [string]$order.Body.orderNumber)

$paid = Invoke-Api -Method "POST" -Path ("/cafe-order/" + $order.Body.id + "/pay") -Body @{ paymentMethod = "CASH" }
Assert-True -Name "Pay Cafe Order" -Condition ($paid.Ok -and $paid.StatusCode -eq 200 -and $paid.Body.paymentStatus -eq "PAID") -Detail ("status=" + [string]$paid.Body.paymentStatus)

$inventoryAfterPay = Invoke-Api -Method "GET" -Path ("/inventory/" + $inventory.Body.id)
Assert-True -Name "Inventory Consumed By Recipe" -Condition ($inventoryAfterPay.Ok -and [int]$inventoryAfterPay.Body.currentStock -eq 114) -Detail ("stock=" + [string]$inventoryAfterPay.Body.currentStock)

$voided = Invoke-Api -Method "POST" -Path ("/cafe-order/" + $order.Body.id + "/void")
Assert-True -Name "Void Cafe Order" -Condition ($voided.Ok -and $voided.StatusCode -eq 200 -and $voided.Body.status -eq "VOID") -Detail ("status=" + [string]$voided.Body.status)

$inventoryAfterVoid = Invoke-Api -Method "GET" -Path ("/inventory/" + $inventory.Body.id)
Assert-True -Name "Inventory Restored On Void" -Condition ($inventoryAfterVoid.Ok -and [int]$inventoryAfterVoid.Body.currentStock -eq 120) -Detail ("stock=" + [string]$inventoryAfterVoid.Body.currentStock)

$adjusted = Invoke-Api -Method "POST" -Path "/inventory/stock-adjustment" -Body @{
  inventoryId = $inventory.Body.id
  qty = -5
  reason = "waste"
}
Assert-True -Name "Stock Adjustment" -Condition ($adjusted.Ok -and $adjusted.StatusCode -eq 200 -and [int]$adjusted.Body.currentStock -eq 115) -Detail ("stock=" + [string]$adjusted.Body.currentStock)

$inventoryReport = Invoke-Api -Method "GET" -Path "/inventory/report"
$reportItem = $inventoryReport.Body | Where-Object { $_.id -eq $inventory.Body.id } | Select-Object -First 1
Assert-True -Name "Inventory Report" -Condition ($inventoryReport.Ok -and $null -ne $reportItem -and [int]$reportItem.currentStock -eq 115) -Detail ("stock=" + [string]$reportItem.currentStock)

$dashboard = Invoke-Api -Method "GET" -Path "/inventory/dashboard"
Assert-True -Name "Inventory Dashboard" -Condition ($dashboard.Ok -and $null -ne $dashboard.Body.inventoryValue -and $null -ne $dashboard.Body.purchaseToday -and $null -ne $dashboard.Body.consumptionToday -and $null -ne $dashboard.Body.wasteToday) -Detail ("value=" + [string]$dashboard.Body.inventoryValue)

Assert-Page200 -Path "/inventory"
Assert-Page200 -Path "/supplier"
Assert-Page200 -Path "/purchase"
Assert-Page200 -Path "/recipe"
Assert-Page200 -Path "/stock-adjustment"

$results | ForEach-Object { Write-Output $_ }

if ($hasFailure) {
  Write-Output "EXIT_CODE=1"
  exit 1
}

Write-Output "EXIT_CODE=0"
exit 0
