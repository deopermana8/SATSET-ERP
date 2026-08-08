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

$PSDefaultParameterValues["Invoke-WebRequest:TimeoutSec"] = 120
$PSDefaultParameterValues["Invoke-RestMethod:TimeoutSec"] = 120

function Add-Result {
  param([string]$Name, [string]$Status, [string]$Value)
  $results.Add([pscustomobject]@{ name = $Name; status = $Status; value = $Value })
}

function Stop-PortListeners {
  param([int[]]$Ports)
  foreach ($port in $Ports) {
    $conn = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
      $conn | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
      }
    }
  }
}

function Wait-Ready {
  param([string]$Url, [int]$MaxRetry = 60)
  for ($i = 0; $i -lt $MaxRetry; $i++) {
    try {
      $res = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 2
      if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 500) { return $true }
    } catch {
      # keep polling
    }
    Start-Sleep -Milliseconds 300
  }
  return $false
}

function Expect-Reject {
  param([string]$Name, [scriptblock]$Action)
  try {
    & $Action | Out-Null
    Add-Result -Name $Name -Status "FAIL" -Value "Expected reject but succeeded"
  } catch {
    $msg = $_.Exception.Message
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) { $msg = $_.ErrorDetails.Message }
    Add-Result -Name $Name -Status "PASS" -Value $msg
  }
}

function Expect-Http200 {
  param([string]$Name, [string]$Url)
  try {
    $r = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing
    if ($r.StatusCode -eq 200) {
      Add-Result -Name $Name -Status "PASS" -Value "status=200"
    } else {
      Add-Result -Name $Name -Status "FAIL" -Value ("status=" + [string]$r.StatusCode)
    }
  } catch {
    Add-Result -Name $Name -Status "FAIL" -Value $_.Exception.Message
  }
}

$hadFatal = $false

try {
  Set-Location $root
  Stop-PortListeners -Ports @(3010, 3210)

  $dbLine = Get-Content (Join-Path $root ".env") | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
  if (-not $dbLine) {
    throw "DATABASE_URL not found in .env"
  }
  $databaseUrl = $dbLine.Substring("DATABASE_URL=".Length)

  npm run build --workspace @satset/blueprint-api | Out-Null
  if ($LASTEXITCODE -eq 0) { Add-Result -Name "build_api" -Status "PASS" -Value "ok" } else { Add-Result -Name "build_api" -Status "FAIL" -Value ("exit=" + [string]$LASTEXITCODE); throw "build api failed" }

  npm run build --workspace @satset/blueprint-customer | Out-Null
  if ($LASTEXITCODE -eq 0) { Add-Result -Name "build_customer" -Status "PASS" -Value "ok" } else { Add-Result -Name "build_customer" -Status "FAIL" -Value ("exit=" + [string]$LASTEXITCODE); throw "build customer failed" }

  $apiProc = Start-Process -FilePath "cmd.exe" -ArgumentList ('/c set "DATABASE_URL=' + $databaseUrl + '"&& set API_PORT=3010&& node apps/api/dist/index.js') -WorkingDirectory $root -PassThru -WindowStyle Hidden
  $customerProc = Start-Process -FilePath "cmd.exe" -ArgumentList '/c set CUSTOMER_PORT=3210&& set API_URL=http://127.0.0.1:3010&& node apps/customer/dist/index.js' -WorkingDirectory $root -PassThru -WindowStyle Hidden

  if (Wait-Ready -Url ($api + "/api/ticket")) { Add-Result -Name "run_api" -Status "PASS" -Value $api } else { Add-Result -Name "run_api" -Status "FAIL" -Value "not ready"; throw "api not ready" }
  if (Wait-Ready -Url ($customer + "/customer")) { Add-Result -Name "run_customer" -Status "PASS" -Value ($customer + "/customer") } else { Add-Result -Name "run_customer" -Status "FAIL" -Value "not ready"; throw "customer not ready" }

  $suffix = [string][DateTimeOffset]::Now.ToUnixTimeSeconds()
  $today = Get-Date -Format "yyyy-MM-dd"
  $validFrom = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
  $validUntil = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
  $visitDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")

  $ticket = Invoke-RestMethod -Uri ($api + "/api/ticket") -Method POST -Headers $headers -Body (@{
    code = "TKT-RH-" + $suffix
    name = "Ticket RH"
    category = "REGULAR"
    price = 50000
    quota = 20
    validFrom = $validFrom
    validUntil = $validUntil
    active = $true
  } | ConvertTo-Json)

  Expect-Reject -Name "neg_ticket_sale_without_open_shift" -Action {
    Invoke-RestMethod -Uri ($api + "/api/ticket-sale") -Method POST -Headers $headers -Body (@{
      customerName = "No Shift"
      customerPhone = "0800"
      paymentMethod = "CASH"
      items = @(@{ ticketId = $ticket.id; ticketName = $ticket.name; qty = 1; price = [double]$ticket.price; total = [double]$ticket.price })
    } | ConvertTo-Json -Depth 5)
  }

  $open = Invoke-RestMethod -Uri ($api + "/api/cashier-shift/open") -Method POST -Headers $headers -Body (@{ cashierId = "CSH-RH"; cashierName = "Cashier RH"; openingCash = 100000 } | ConvertTo-Json)
  $sale = Invoke-RestMethod -Uri ($api + "/api/ticket-sale") -Method POST -Headers $headers -Body (@{
    customerName = "Walkin"
    customerPhone = "08123"
    paymentMethod = "CASH"
    items = @(@{ ticketId = $ticket.id; ticketName = $ticket.name; qty = 1; price = [double]$ticket.price; total = [double]$ticket.price })
  } | ConvertTo-Json -Depth 5)
  Invoke-RestMethod -Uri ($api + "/api/ticket-sale/" + $sale.id + "/pay") -Method POST -Headers $headers -Body (@{ paymentMethod = "CASH"; paidAmount = 50000 } | ConvertTo-Json) | Out-Null
  Invoke-RestMethod -Uri ($api + "/api/ticket-sale/" + $sale.id + "/print") -Method POST -Headers $headers -Body "{}" | Out-Null
  Expect-Http200 -Name "ticket_sale_summary" -Url ($api + "/api/ticket-sale/summary")

  $closed = Invoke-RestMethod -Uri ($api + "/api/cashier-shift/close") -Method POST -Headers $headers -Body (@{ closingCash = 150000 } | ConvertTo-Json)
  if ($open.status -eq "OPEN" -and $closed.status -eq "CLOSED") { Add-Result -Name "cashier_shift_open_sale_close" -Status "PASS" -Value "ok" } else { Add-Result -Name "cashier_shift_open_sale_close" -Status "FAIL" -Value "invalid status" }

  $reservation = Invoke-RestMethod -Uri ($api + "/api/reservation") -Method POST -Headers $headers -Body (@{
    customerName = "Res RH"
    customerPhone = "08111"
    customerEmail = "res.rh@example.com"
    visitDate = $visitDate
    visitSession = "PAGI"
    paymentMethod = "CASH"
    ticketItems = @(@{ ticketId = $ticket.id; ticketName = $ticket.name; qty = 1 })
  } | ConvertTo-Json -Depth 5)
  Invoke-RestMethod -Uri ($api + "/api/reservation/" + $reservation.id + "/pay") -Method POST -Headers $headers -Body (@{ paymentMethod = "CASH" } | ConvertTo-Json) | Out-Null
  Invoke-RestMethod -Uri ($api + "/api/reservation/" + $reservation.id + "/confirm") -Method POST -Headers $headers -Body "{}" | Out-Null
  $reservationCheckedIn = Invoke-RestMethod -Uri ($api + "/api/reservation/" + $reservation.id + "/checkin") -Method POST -Headers $headers -Body "{}"
  if ($reservationCheckedIn.reservation.reservationStatus -eq "CHECKED_IN") { Add-Result -Name "reservation_book_pay_confirm_checkin" -Status "PASS" -Value "ok" } else { Add-Result -Name "reservation_book_pay_confirm_checkin" -Status "FAIL" -Value "not checked in" }

  Expect-Reject -Name "neg_double_checkin" -Action {
    Invoke-RestMethod -Uri ($api + "/api/reservation/" + $reservation.id + "/checkin") -Method POST -Headers $headers -Body "{}"
  }

  $ticketBefore = Invoke-RestMethod -Uri ($api + "/api/ticket/" + $ticket.id) -Method GET
  $reservationCancel = Invoke-RestMethod -Uri ($api + "/api/reservation") -Method POST -Headers $headers -Body (@{
    customerName = "Res Cancel"
    customerPhone = "08222"
    customerEmail = "cancel.rh@example.com"
    visitDate = $visitDate
    visitSession = "SIANG"
    paymentMethod = "CASH"
    ticketItems = @(@{ ticketId = $ticket.id; ticketName = $ticket.name; qty = 2 })
  } | ConvertTo-Json -Depth 5)
  $cancelled = Invoke-RestMethod -Uri ($api + "/api/reservation/" + $reservationCancel.id + "/cancel") -Method POST -Headers $headers -Body "{}"
  $ticketAfter = Invoke-RestMethod -Uri ($api + "/api/ticket/" + $ticket.id) -Method GET
  if ($cancelled.reservationStatus -eq "CANCELLED" -and $ticketAfter.quota -eq $ticketBefore.quota) { Add-Result -Name "reservation_cancel_quota_restore" -Status "PASS" -Value "ok" } else { Add-Result -Name "reservation_cancel_quota_restore" -Status "FAIL" -Value ("before=" + $ticketBefore.quota + ";after=" + $ticketAfter.quota) }

  Expect-Reject -Name "neg_double_reservation_cancel" -Action {
    Invoke-RestMethod -Uri ($api + "/api/reservation/" + $reservationCancel.id + "/cancel") -Method POST -Headers $headers -Body "{}"
  }

  $activity = Invoke-RestMethod -Uri ($api + "/api/activity") -Method POST -Headers $headers -Body (@{
    code = "ACT-RH-" + $suffix
    name = "Activity RH"
    category = "ADVENTURE"
    duration = 60
    capacity = 5
    price = 75000
    active = $true
  } | ConvertTo-Json)

  $schedule = Invoke-RestMethod -Uri ($api + "/api/activity-schedule") -Method POST -Headers $headers -Body (@{
    activityId = $activity.id
    date = $visitDate
    session = "PAGI"
    capacity = 5
  } | ConvertTo-Json)

  $reservationForActivity = Invoke-RestMethod -Uri ($api + "/api/reservation") -Method POST -Headers $headers -Body (@{
    customerName = "Res Activity"
    customerPhone = "08333"
    customerEmail = "activity.rh@example.com"
    visitDate = $visitDate
    visitSession = "SORE"
    paymentMethod = "QRIS"
    ticketItems = @(@{ ticketId = $ticket.id; ticketName = $ticket.name; qty = 1 })
  } | ConvertTo-Json -Depth 5)

  $booking = Invoke-RestMethod -Uri ($api + "/api/activity-booking") -Method POST -Headers $headers -Body (@{
    reservationId = $reservationForActivity.id
    customerName = "Res Activity"
    activityId = $activity.id
    scheduleId = $schedule.id
    qty = 2
  } | ConvertTo-Json)

  $schAfterBook = (Invoke-RestMethod -Uri ($api + "/api/activity-schedule") -Method GET | Where-Object { $_.id -eq $schedule.id } | Select-Object -First 1)
  Invoke-RestMethod -Uri ($api + "/api/activity-booking/" + $booking.id + "/cancel") -Method POST -Headers $headers -Body "{}" | Out-Null
  $schAfterCancel = (Invoke-RestMethod -Uri ($api + "/api/activity-schedule") -Method GET | Where-Object { $_.id -eq $schedule.id } | Select-Object -First 1)
  if ($schAfterBook.available -eq 3 -and $schAfterCancel.available -eq 5) { Add-Result -Name "activity_booking_capacity_reduce_restore" -Status "PASS" -Value "ok" } else { Add-Result -Name "activity_booking_capacity_reduce_restore" -Status "FAIL" -Value ("book=" + $schAfterBook.available + ";cancel=" + $schAfterCancel.available) }

  $reservationOverflow = Invoke-RestMethod -Uri ($api + "/api/reservation") -Method POST -Headers $headers -Body (@{
    customerName = "Res Overflow"
    customerPhone = "08444"
    customerEmail = "overflow.rh@example.com"
    visitDate = $visitDate
    visitSession = "MALAM"
    paymentMethod = "TRANSFER"
    ticketItems = @(@{ ticketId = $ticket.id; ticketName = $ticket.name; qty = 1 })
  } | ConvertTo-Json -Depth 5)

  Expect-Reject -Name "neg_activity_capacity_exceeded" -Action {
    Invoke-RestMethod -Uri ($api + "/api/activity-booking") -Method POST -Headers $headers -Body (@{
      reservationId = $reservationOverflow.id
      customerName = "Res Overflow"
      activityId = $activity.id
      scheduleId = $schedule.id
      qty = 999
    } | ConvertTo-Json)
  }

  $supplier = Invoke-RestMethod -Uri ($api + "/api/supplier") -Method POST -Headers $headers -Body (@{
    code = "SUP-RH-" + $suffix
    name = "Supplier RH"
    phone = "08123"
    email = "sup.rh@example.com"
    address = "Jl RH"
    active = $true
  } | ConvertTo-Json)

  $inventory = Invoke-RestMethod -Uri ($api + "/api/inventory") -Method POST -Headers $headers -Body (@{
    code = "INV-RH-" + $suffix
    name = "Item RH"
    unit = "PCS"
    category = "BAHAN"
    minimumStock = 1
    currentStock = 10
    averageCost = 10000
    active = $true
  } | ConvertTo-Json)

  $po = Invoke-RestMethod -Uri ($api + "/api/purchase-order") -Method POST -Headers $headers -Body (@{
    supplierId = $supplier.id
    supplierName = $supplier.name
    items = @(@{
      inventoryId = $inventory.id
      inventoryName = $inventory.name
      qty = 2
      unitCost = 12000
      total = 24000
    })
  } | ConvertTo-Json -Depth 5)
  $poApproved = Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $po.id + "/approve") -Method POST -Headers $headers -Body "{}"
  $poReceived = Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $po.id + "/receive") -Method POST -Headers $headers -Body "{}"
  if ($po.status -eq "DRAFT" -and $poApproved.status -eq "APPROVED" -and $poReceived.status -eq "RECEIVED") { Add-Result -Name "purchase_order_draft_approved_received" -Status "PASS" -Value "ok" } else { Add-Result -Name "purchase_order_draft_approved_received" -Status "FAIL" -Value "invalid transition" }

  Expect-Reject -Name "neg_duplicate_po_receive" -Action {
    Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $po.id + "/receive") -Method POST -Headers $headers -Body "{}"
  }

  $ref = "PO_RECEIVE:" + $po.poNumber
  $movements = Invoke-RestMethod -Uri ($api + "/api/stock-movement?inventoryId=" + $inventory.id + "&movementType=IN&reference=" + [uri]::EscapeDataString($ref)) -Method GET
  $movementCount = if ($movements -is [array]) { $movements.Count } elseif ($movements) { 1 } else { 0 }
  if ($movementCount -ge 1) { Add-Result -Name "stock_movement_after_receive" -Status "PASS" -Value ("count=" + [string]$movementCount) } else { Add-Result -Name "stock_movement_after_receive" -Status "FAIL" -Value "count=0" }

  Expect-Reject -Name "neg_invalid_stock_movement_filter" -Action {
    Invoke-RestMethod -Uri ($api + "/api/stock-movement?movementType=INVALID") -Method GET
  }

  try {
    $dashboardResp = Invoke-WebRequest -Uri ($api + "/api/inventory/dashboard") -Method GET -Headers @{ authorization = "Bearer workspace-token" } -UseBasicParsing
    if ($dashboardResp.StatusCode -eq 200) {
      Add-Result -Name "dashboard_endpoint" -Status "PASS" -Value "status=200"
    } else {
      Add-Result -Name "dashboard_endpoint" -Status "FAIL" -Value ("status=" + [string]$dashboardResp.StatusCode)
    }
  } catch {
    Add-Result -Name "dashboard_endpoint" -Status "FAIL" -Value $_.Exception.Message
  }

  $pages = @(
    "/customer",
    "/customer/dashboard",
    "/ticketing",
    "/cashier",
    "/gate",
    "/reservation",
    "/activities",
    "/activity-booking",
    "/cafe",
    "/kitchen",
    "/supplier",
    "/inventory",
    "/purchase",
    ("/purchase/" + $po.id),
    "/recipe",
    "/stock-adjustment",
    "/stock-movement"
  )
  $allPages200 = $true
  foreach ($p in $pages) {
    try {
      $resp = Invoke-WebRequest -Uri ($customer + $p) -Method GET -UseBasicParsing
      if ($resp.StatusCode -ne 200) { $allPages200 = $false }
    } catch {
      $allPages200 = $false
    }
  }
  Add-Result -Name "operational_pages_http_200" -Status ($(if ($allPages200) { "PASS" } else { "FAIL" })) -Value ("count=" + [string]$pages.Count)
}
catch {
  $hadFatal = $true
  Add-Result -Name "fatal_error" -Status "FAIL" -Value $_.Exception.Message
}
finally {
  if ($customerProc -and -not $customerProc.HasExited) { Stop-Process -Id $customerProc.Id -Force -ErrorAction SilentlyContinue }
  if ($apiProc -and -not $apiProc.HasExited) { Stop-Process -Id $apiProc.Id -Force -ErrorAction SilentlyContinue }
  Stop-PortListeners -Ports @(3010, 3210)

  $left3010 = @(Get-NetTCPConnection -State Listen -LocalPort 3010 -ErrorAction SilentlyContinue).Count
  $left3210 = @(Get-NetTCPConnection -State Listen -LocalPort 3210 -ErrorAction SilentlyContinue).Count
  Add-Result -Name "port_cleanup_3010_3210" -Status ($(if ($left3010 -eq 0 -and $left3210 -eq 0) { "PASS" } else { "FAIL" })) -Value ("3010=" + [string]$left3010 + ";3210=" + [string]$left3210)
}

$regressionNames = @(
  "ticket_sale_summary",
  "cashier_shift_open_sale_close",
  "reservation_book_pay_confirm_checkin",
  "reservation_cancel_quota_restore",
  "activity_booking_capacity_reduce_restore",
  "purchase_order_draft_approved_received",
  "stock_movement_after_receive",
  "dashboard_endpoint",
  "operational_pages_http_200"
)
$negativeNames = @(
  "neg_ticket_sale_without_open_shift",
  "neg_double_checkin",
  "neg_double_reservation_cancel",
  "neg_activity_capacity_exceeded",
  "neg_duplicate_po_receive",
  "neg_invalid_stock_movement_filter"
)

$regressionFail = @($results | Where-Object { $_.name -in $regressionNames -and $_.status -ne "PASS" }).Count
$negativeFail = @($results | Where-Object { $_.name -in $negativeNames -and $_.status -ne "PASS" }).Count

$buildApiStatus = if (@($results | Where-Object { $_.name -eq "build_api" -and $_.status -eq "PASS" }).Count -gt 0) { "PASS" } else { "FAIL" }
$buildCustomerStatus = if (@($results | Where-Object { $_.name -eq "build_customer" -and $_.status -eq "PASS" }).Count -gt 0) { "PASS" } else { "FAIL" }
$runApiStatus = if (@($results | Where-Object { $_.name -eq "run_api" -and $_.status -eq "PASS" }).Count -gt 0) { "PASS" } else { "FAIL" }
$runCustomerStatus = if (@($results | Where-Object { $_.name -eq "run_customer" -and $_.status -eq "PASS" }).Count -gt 0) { "PASS" } else { "FAIL" }
$regressionStatus = if ($regressionFail -eq 0) { "PASS" } else { "FAIL" }
$negativeStatus = if ($negativeFail -eq 0) { "PASS" } else { "FAIL" }

$exitCode = 0
if ($hadFatal -or @($results | Where-Object { $_.status -eq "FAIL" }).Count -gt 0) { $exitCode = 1 }

[pscustomobject]@{
  BUILD_API = $buildApiStatus
  BUILD_CUSTOMER = $buildCustomerStatus
  RUN_API = $runApiStatus
  RUN_CUSTOMER = $runCustomerStatus
  REGRESSION = $regressionStatus
  NEGATIVE_TEST = $negativeStatus
  EXIT_CODE = $exitCode
  RESULTS = $results
} | ConvertTo-Json -Depth 6

exit $exitCode
