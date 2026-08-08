Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$api = "http://127.0.0.1:3010"
$customer = "http://127.0.0.1:3210"
$headers = @{ "content-type" = "application/json" }
$results = New-Object System.Collections.Generic.List[Object]

function Add-Result {
  param(
    [string]$Name,
    [string]$Status,
    [string]$Value
  )
  $results.Add([pscustomobject]@{
    name = $Name
    status = $Status
    value = $Value
  })
}

function Check-Get {
  param(
    [string]$Name,
    [string]$Url
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing
    Add-Result -Name $Name -Status "PASS" -Value ("status=" + [string]$response.StatusCode)
  } catch {
    Add-Result -Name $Name -Status "FAIL" -Value $_.Exception.Message
  }
}

Check-Get -Name "api_health_ticket" -Url ($api + "/api/ticket")
Check-Get -Name "api_health_cashier_summary" -Url ($api + "/api/cashier-shift/summary")
Check-Get -Name "api_health_reservation_report" -Url ($api + "/api/reservation/report")
Check-Get -Name "api_health_activity_booking" -Url ($api + "/api/activity-booking")
Check-Get -Name "customer_route_stock_movement" -Url ($customer + "/stock-movement")

$supplier = $null
$inventory = $null
$purchaseOrder = $null

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
  Add-Result -Name "create_supplier" -Status "PASS" -Value ("id=" + $supplier.id)
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
  Add-Result -Name "create_inventory" -Status "PASS" -Value ("id=" + $inventory.id)
} catch {
  Add-Result -Name "create_inventory" -Status "FAIL" -Value $_.Exception.Message
}

try {
  if (-not $supplier -or -not $inventory) {
    throw "setup gagal"
  }

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

  $purchaseOrder = Invoke-RestMethod -Uri ($api + "/api/purchase-order") -Method POST -Headers $headers -Body $poPayload
  Add-Result -Name "create_po" -Status "PASS" -Value ("id=" + $purchaseOrder.id + ";status=" + $purchaseOrder.status)
} catch {
  Add-Result -Name "create_po" -Status "FAIL" -Value $_.Exception.Message
}

try {
  if (-not $purchaseOrder) {
    throw "po kosong"
  }

  $detail = Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $purchaseOrder.id) -Method GET -UseBasicParsing
  Add-Result -Name "get_po_detail" -Status "PASS" -Value ("po=" + $detail.poNumber + ";items=" + [string]$detail.items.Count + ";status=" + $detail.status)
} catch {
  Add-Result -Name "get_po_detail" -Status "FAIL" -Value $_.Exception.Message
}

try {
  if (-not $purchaseOrder) {
    throw "po kosong"
  }

  $approved = Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $purchaseOrder.id + "/approve") -Method POST -Headers $headers -Body "{}"
  Add-Result -Name "approve_po" -Status "PASS" -Value ("status=" + $approved.status)
} catch {
  Add-Result -Name "approve_po" -Status "FAIL" -Value $_.Exception.Message
}

try {
  if (-not $purchaseOrder) {
    throw "po kosong"
  }

  $received = Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $purchaseOrder.id + "/receive") -Method POST -Headers $headers -Body "{}"
  Add-Result -Name "receive_po" -Status "PASS" -Value ("status=" + $received.status)
} catch {
  Add-Result -Name "receive_po" -Status "FAIL" -Value $_.Exception.Message
}

try {
  if (-not $inventory -or -not $purchaseOrder) {
    throw "inventory/po kosong"
  }

  $today = (Get-Date).ToString("yyyy-MM-dd")
  $movementUrl = $api + "/api/stock-movement?inventoryId=" + $inventory.id + "&movementType=IN&from=" + $today + "&to=" + $today + "&reference=" + [uri]::EscapeDataString($purchaseOrder.poNumber)
  $movements = Invoke-RestMethod -Uri $movementUrl -Method GET -UseBasicParsing

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
  if (-not $purchaseOrder) {
    throw "po kosong"
  }

  $routeResponse = Invoke-WebRequest -Uri ($customer + "/purchase/" + $purchaseOrder.id) -Method GET -UseBasicParsing
  Add-Result -Name "customer_route_purchase_detail" -Status "PASS" -Value ("status=" + [string]$routeResponse.StatusCode)
} catch {
  Add-Result -Name "customer_route_purchase_detail" -Status "FAIL" -Value $_.Exception.Message
}

$results | ConvertTo-Json -Depth 4
