Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$root = "D:\SATSET FACTORY\SATSET ERP"
$api = "http://127.0.0.1:3010"
$customer = "http://127.0.0.1:3210"
$headers = @{ "content-type" = "application/json" }
$results = New-Object System.Collections.Generic.List[Object]
$apiProc = $null
$customerProc = $null

$PSDefaultParameterValues["Invoke-WebRequest:TimeoutSec"] = 12
$PSDefaultParameterValues["Invoke-RestMethod:TimeoutSec"] = 12

function Add-Result {
  param([string]$Name, [string]$Status, [string]$Value)
  $results.Add([pscustomobject]@{ name = $Name; status = $Status; value = $Value })
}

function Wait-Ready {
  param([string]$Url, [int]$MaxRetry = 40)
  for ($i = 0; $i -lt $MaxRetry; $i++) {
    try {
      $res = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 2
      if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 500) { return $true }
    } catch {
      # keep polling until startup completed
    }
    Start-Sleep -Milliseconds 300
  }
  return $false
}

function Check-Get {
  param([string]$Name, [string]$Url)
  try {
    $res = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing
    Add-Result -Name $Name -Status "PASS" -Value ("status=" + [string]$res.StatusCode)
  } catch {
    Add-Result -Name $Name -Status "FAIL" -Value $_.Exception.Message
  }
}

try {
  # Clean possible old processes occupying required ports
  foreach ($port in @(3010, 3210)) {
    $conn = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
      $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
      foreach ($procId in $pids) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      }
    }
  }

  $apiCmd = '/c set API_PORT=3010&& node apps/api/dist/index.js'
  $apiProc = Start-Process -FilePath "cmd.exe" -ArgumentList $apiCmd -WorkingDirectory $root -PassThru -WindowStyle Hidden

  $customerCmd = '/c set CUSTOMER_PORT=3210&& set API_URL=http://127.0.0.1:3010&& node apps/customer/dist/index.js'
  $customerProc = Start-Process -FilePath "cmd.exe" -ArgumentList $customerCmd -WorkingDirectory $root -PassThru -WindowStyle Hidden

  $apiReady = Wait-Ready -Url ($api + "/api/ticket")
  if ($apiReady) {
    Add-Result -Name "run_api" -Status "PASS" -Value "http://127.0.0.1:3010"
  } else {
    Add-Result -Name "run_api" -Status "FAIL" -Value "API did not become ready"
    throw "API startup failed"
  }

  $customerReady = Wait-Ready -Url ($customer + "/customer")
  if ($customerReady) {
    Add-Result -Name "run_customer" -Status "PASS" -Value "http://127.0.0.1:3210/customer"
  } else {
    Add-Result -Name "run_customer" -Status "FAIL" -Value "Customer did not become ready"
    throw "Customer startup failed"
  }

  # Non-regression key checks
  Check-Get -Name "ticket_list" -Url ($api + "/api/ticket")
  Check-Get -Name "ticket_sale_summary" -Url ($api + "/api/ticket-sale/summary")
  Check-Get -Name "cashier_shift_summary" -Url ($api + "/api/cashier-shift/summary")
  Check-Get -Name "reservation_report" -Url ($api + "/api/reservation/report")
  Check-Get -Name "activity_list" -Url ($api + "/api/activity")
  Check-Get -Name "activity_schedule_list" -Url ($api + "/api/activity-schedule")
  Check-Get -Name "activity_booking_list" -Url ($api + "/api/activity-booking")

  # Sprint flow checks
  $supplier = $null
  $inventory = $null
  $po = $null
  $poForCancel = $null

  try {
    $supplierPayload = @{
      code = "SUP-S18-3010"
      name = "Supplier Sprint18"
      phone = "08123"
      email = "s18@example.com"
      address = "Jl Sprint"
      active = $true
    } | ConvertTo-Json
    $supplier = Invoke-RestMethod -Uri ($api + "/api/supplier") -Method POST -Headers $headers -Body $supplierPayload
    Add-Result -Name "create_supplier" -Status "PASS" -Value ("id=" + $supplier.id + ";code=" + $supplier.code)
  } catch {
    Add-Result -Name "create_supplier" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    $inventoryPayload = @{
      code = "INV-S18-3010"
      name = "Beras"
      unit = "KG"
      category = "BAHAN"
      minimumStock = 5
      currentStock = 20
      averageCost = 14000
      active = $true
    } | ConvertTo-Json
    $inventory = Invoke-RestMethod -Uri ($api + "/api/inventory") -Method POST -Headers $headers -Body $inventoryPayload
    Add-Result -Name "create_inventory" -Status "PASS" -Value ("id=" + $inventory.id + ";code=" + $inventory.code)
  } catch {
    Add-Result -Name "create_inventory" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    if (-not $supplier -or -not $inventory) { throw "setup supplier/inventory gagal" }
    $poPayload = @{
      supplierId = $supplier.id
      supplierName = $supplier.name
      items = @(
        @{
          inventoryId = $inventory.id
          inventoryName = $inventory.name
          qty = 2
          unitCost = 15000
          total = 30000
        }
      )
    } | ConvertTo-Json -Depth 5
    $po = Invoke-RestMethod -Uri ($api + "/api/purchase-order") -Method POST -Headers $headers -Body $poPayload
    Add-Result -Name "create_purchase_order" -Status "PASS" -Value ("id=" + $po.id + ";po=" + $po.poNumber + ";status=" + $po.status)
  } catch {
    Add-Result -Name "create_purchase_order" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    if (-not $supplier -or -not $inventory) { throw "setup supplier/inventory gagal" }
    $poCancelPayload = @{
      supplierId = $supplier.id
      supplierName = $supplier.name
      items = @(
        @{
          inventoryId = $inventory.id
          inventoryName = $inventory.name
          qty = 1
          unitCost = 14500
          total = 14500
        }
      )
    } | ConvertTo-Json -Depth 5
    $poForCancel = Invoke-RestMethod -Uri ($api + "/api/purchase-order") -Method POST -Headers $headers -Body $poCancelPayload
    Add-Result -Name "create_purchase_order_cancel_flow" -Status "PASS" -Value ("id=" + $poForCancel.id + ";po=" + $poForCancel.poNumber + ";status=" + $poForCancel.status)
  } catch {
    Add-Result -Name "create_purchase_order_cancel_flow" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    if (-not $po) { throw "PO belum tersedia" }
    $poDetail = Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $po.id) -Method GET -UseBasicParsing
    Add-Result -Name "get_purchase_order_detail" -Status "PASS" -Value ("po=" + $poDetail.poNumber + ";items=" + [string]$poDetail.items.Count + ";status=" + $poDetail.status)
  } catch {
    Add-Result -Name "get_purchase_order_detail" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    if (-not $po) { throw "PO belum tersedia" }
    $approved = Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $po.id + "/approve") -Method POST -Headers $headers -Body "{}"
    Add-Result -Name "approve_purchase_order" -Status "PASS" -Value ("status=" + $approved.status)
  } catch {
    Add-Result -Name "approve_purchase_order" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    if (-not $po) { throw "PO belum tersedia" }
    $received = Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $po.id + "/receive") -Method POST -Headers $headers -Body "{}"
    Add-Result -Name "receive_purchase_order" -Status "PASS" -Value ("status=" + $received.status)
  } catch {
    Add-Result -Name "receive_purchase_order" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    if (-not $poForCancel) { throw "PO cancel flow belum tersedia" }
    $cancelled = Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $poForCancel.id + "/cancel") -Method POST -Headers $headers -Body '{"reason":"Acceptance cancel flow"}'
    if ($cancelled.status -ne "CANCELLED") { throw "status hasil cancel bukan CANCELLED" }
    Add-Result -Name "cancel_purchase_order" -Status "PASS" -Value ("status=" + $cancelled.status)
  } catch {
    Add-Result -Name "cancel_purchase_order" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    if (-not $poForCancel) { throw "PO cancel flow belum tersedia" }
    Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $poForCancel.id + "/receive") -Method POST -Headers $headers -Body "{}" | Out-Null
    Add-Result -Name "receive_after_cancel_rejected" -Status "FAIL" -Value "Receive after cancel should fail"
  } catch {
    $msg = $_.Exception.Message
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
      $msg = $_.ErrorDetails.Message
    }
    Add-Result -Name "receive_after_cancel_rejected" -Status "PASS" -Value $msg
  }

  try {
    if (-not $inventory -or -not $po) { throw "inventory/po belum tersedia" }
    $reference = "PO_RECEIVE:" + $po.poNumber
    $url = $api + "/api/stock-movement?inventoryId=" + $inventory.id + "&movementType=IN&reference=" + [uri]::EscapeDataString($reference)
    $movements = Invoke-RestMethod -Uri $url -Method GET -UseBasicParsing
    $count = 0
    if ($movements -is [array]) {
      $count = $movements.Count
    } elseif ($movements) {
      $count = 1
    }
    Add-Result -Name "stock_movement_filtered" -Status "PASS" -Value ("count=" + [string]$count)
  } catch {
    Add-Result -Name "stock_movement_filtered" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    if (-not $po) { throw "PO belum tersedia" }
    $r1 = Invoke-WebRequest -Uri ($customer + "/purchase/" + $po.id) -Method GET -UseBasicParsing
    Add-Result -Name "customer_route_purchase_detail" -Status "PASS" -Value ("status=" + [string]$r1.StatusCode)
  } catch {
    Add-Result -Name "customer_route_purchase_detail" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    $r2 = Invoke-WebRequest -Uri ($customer + "/stock-movement") -Method GET -UseBasicParsing
    Add-Result -Name "customer_route_stock_movement" -Status "PASS" -Value ("status=" + [string]$r2.StatusCode)
  } catch {
    Add-Result -Name "customer_route_stock_movement" -Status "FAIL" -Value $_.Exception.Message
  }

  try {
    $dashboard = Invoke-RestMethod -Uri ($api + "/api/inventory/dashboard") -Method GET -UseBasicParsing
    $pos = Invoke-RestMethod -Uri ($api + "/api/purchase-order") -Method GET -UseBasicParsing
    $pending = @($pos | Where-Object { $_.status -eq "DRAFT" -or $_.status -eq "APPROVED" }).Count
    Add-Result -Name "dashboard_kpi_data" -Status "PASS" -Value ("lowStock=" + [string]@($dashboard.lowStock).Count + ";pendingPO=" + [string]$pending)
  } catch {
    Add-Result -Name "dashboard_kpi_data" -Status "FAIL" -Value $_.Exception.Message
  }

  $results | ConvertTo-Json -Depth 4
}
finally {
  if ($customerProc -and -not $customerProc.HasExited) {
    Stop-Process -Id $customerProc.Id -Force -ErrorAction SilentlyContinue
  }
  if ($apiProc -and -not $apiProc.HasExited) {
    Stop-Process -Id $apiProc.Id -Force -ErrorAction SilentlyContinue
  }
}
