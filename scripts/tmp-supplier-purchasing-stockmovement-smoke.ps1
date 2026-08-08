$ErrorActionPreference = 'Stop'
$base = 'http://127.0.0.1:3001'

function Count-Rows($value) {
  if ($null -eq $value) { return 0 }
  if ($value -is [array]) { return $value.Count }
  return 1
}

$supplierBefore = Count-Rows (Invoke-RestMethod -Method Get -Uri "$base/api/supplier")
$poBefore = Count-Rows (Invoke-RestMethod -Method Get -Uri "$base/api/purchase-order")
$smBefore = Count-Rows (Invoke-RestMethod -Method Get -Uri "$base/api/stock-movement")

$inventoryRows = Invoke-RestMethod -Method Get -Uri "$base/api/inventory"
$inventory = @($inventoryRows)[0]
if ($null -eq $inventory) { throw 'No inventory row available for purchase-order test' }

$supplierCodeA = 'SUPTESTA-' + (Get-Random -Minimum 1000 -Maximum 9999)
$supplierA = Invoke-RestMethod -Method Post -Uri "$base/api/supplier" -ContentType 'application/json' -Body (@{
  code = $supplierCodeA
  name = 'Supplier Test A'
  phone = '081111111111'
  email = 'supplier-a@test.local'
  address = 'Alamat Test A'
  active = $true
} | ConvertTo-Json -Depth 5)

$supplierAUpdated = Invoke-RestMethod -Method Put -Uri "$base/api/supplier/$($supplierA.id)" -ContentType 'application/json' -Body (@{
  code = $supplierCodeA
  name = 'Supplier Test A Updated'
  phone = '082222222222'
  email = 'supplier-a-updated@test.local'
  address = 'Alamat Test A Updated'
  active = $false
} | ConvertTo-Json -Depth 5)

$supplierADeleteStatus = (Invoke-WebRequest -Method Delete -Uri "$base/api/supplier/$($supplierA.id)" -UseBasicParsing).StatusCode

$supplierCodeB = 'SUPTESTB-' + (Get-Random -Minimum 1000 -Maximum 9999)
$supplierB = Invoke-RestMethod -Method Post -Uri "$base/api/supplier" -ContentType 'application/json' -Body (@{
  code = $supplierCodeB
  name = 'Supplier Test B'
  phone = '083333333333'
  email = 'supplier-b@test.local'
  address = 'Alamat Test B'
  active = $true
} | ConvertTo-Json -Depth 5)

$poCreated = Invoke-RestMethod -Method Post -Uri "$base/api/purchase-order" -ContentType 'application/json' -Body (@{
  supplierId = $supplierB.id
  supplierName = $supplierB.name
  items = @(@{
    inventoryId = $inventory.id
    inventoryName = $inventory.name
    qty = 1
    unitCost = 1234
    total = 1234
  })
} | ConvertTo-Json -Depth 8)

$poDetail = Invoke-RestMethod -Method Get -Uri "$base/api/purchase-order/$($poCreated.id)"
$poApproved = Invoke-RestMethod -Method Post -Uri "$base/api/purchase-order/$($poCreated.id)/approve"
$inventoryBeforeReceive = Invoke-RestMethod -Method Get -Uri "$base/api/inventory/$($inventory.id)"
$poReceived = Invoke-RestMethod -Method Post -Uri "$base/api/purchase-order/$($poCreated.id)/receive"
$inventoryAfterReceive = Invoke-RestMethod -Method Get -Uri "$base/api/inventory/$($inventory.id)"
$stockMovementRows = Invoke-RestMethod -Method Get -Uri "$base/api/stock-movement?inventoryId=$($inventory.id)"

$supplierAfter = Count-Rows (Invoke-RestMethod -Method Get -Uri "$base/api/supplier")
$poAfter = Count-Rows (Invoke-RestMethod -Method Get -Uri "$base/api/purchase-order")
$smAfter = Count-Rows (Invoke-RestMethod -Method Get -Uri "$base/api/stock-movement")

$result = [ordered]@{
  get = [ordered]@{
    supplier = 'PASS'
    purchaseOrder = 'PASS'
    stockMovement = 'PASS'
  }
  supplier = [ordered]@{
    createdId = $supplierA.id
    updatedName = $supplierAUpdated.name
    deletedStatus = $supplierADeleteStatus
    retainedSupplierId = $supplierB.id
  }
  purchaseOrder = [ordered]@{
    createdId = $poCreated.id
    detailPoNumber = $poDetail.poNumber
    approvedStatus = $poApproved.status
    receivedStatus = $poReceived.status
  }
  inventory = [ordered]@{
    id = $inventory.id
    beforeReceive = $inventoryBeforeReceive.currentStock
    afterReceive = $inventoryAfterReceive.currentStock
  }
  stockMovement = [ordered]@{
    filteredCount = Count-Rows $stockMovementRows
    latestReference = @($stockMovementRows)[0].reference
  }
  counts = [ordered]@{
    before = [ordered]@{
      supplier = $supplierBefore
      purchaseOrder = $poBefore
      stockMovement = $smBefore
    }
    after = [ordered]@{
      supplier = $supplierAfter
      purchaseOrder = $poAfter
      stockMovement = $smAfter
    }
  }
}

$result | ConvertTo-Json -Depth 8
