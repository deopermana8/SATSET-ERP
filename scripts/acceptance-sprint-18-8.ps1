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
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
      $msg = $_.ErrorDetails.Message
    }
    Add-Result -Name $Name -Status "PASS" -Value $msg
  }
}

function Check-Get {
  param([string]$Name, [string]$Url, [hashtable]$Headers = $null)
  try {
    if ($null -ne $Headers) {
      $res = Invoke-WebRequest -Uri $Url -Method GET -Headers $Headers -UseBasicParsing
    } else {
      $res = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing
    }
    Add-Result -Name $Name -Status "PASS" -Value ("status=" + [string]$res.StatusCode)
  } catch {
    Add-Result -Name $Name -Status "FAIL" -Value $_.Exception.Message
  }
}

function Check-Get-ExpectStatus {
  param([string]$Name, [string]$Url, [int]$StatusCode, [hashtable]$Headers = $null)
  try {
    if ($null -ne $Headers) {
      $res = Invoke-WebRequest -Uri $Url -Method GET -Headers $Headers -UseBasicParsing
    } else {
      $res = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing
    }
    if ($res.StatusCode -eq $StatusCode) {
      Add-Result -Name $Name -Status "PASS" -Value ("status=" + [string]$res.StatusCode)
      return
    }
    Add-Result -Name $Name -Status "FAIL" -Value ("expected=" + [string]$StatusCode + ";actual=" + [string]$res.StatusCode)
  } catch {
    $response = $_.Exception.Response
    if ($response -and [int]$response.StatusCode -eq $StatusCode) {
      Add-Result -Name $Name -Status "PASS" -Value ("status=" + [string][int]$response.StatusCode)
      return
    }
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

  $apiProc = Start-Process -FilePath "cmd.exe" -ArgumentList ('/c set "DATABASE_URL=' + $databaseUrl + '"&& set API_PORT=3010&& node apps/api/dist/index.js') -WorkingDirectory $root -PassThru -WindowStyle Hidden
  $customerProc = Start-Process -FilePath "cmd.exe" -ArgumentList '/c set CUSTOMER_PORT=3210&& set API_URL=http://127.0.0.1:3010&& node apps/customer/dist/index.js' -WorkingDirectory $root -PassThru -WindowStyle Hidden

  if (Wait-Ready -Url ($api + "/api/ticket")) {
    Add-Result -Name "run_api" -Status "PASS" -Value $api
  } else {
    Add-Result -Name "run_api" -Status "FAIL" -Value "API not ready"
    throw "API not ready"
  }

  if (Wait-Ready -Url ($customer + "/customer")) {
    Add-Result -Name "run_customer" -Status "PASS" -Value ($customer + "/customer")
  } else {
    Add-Result -Name "run_customer" -Status "FAIL" -Value "Customer not ready"
    throw "Customer not ready"
  }

  $suffix = [string][DateTimeOffset]::Now.ToUnixTimeSeconds()
  $today = (Get-Date).ToString("yyyy-MM-dd")
  $validFrom = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
  $validUntil = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
  $visitDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")

  # Ticket + shift + sale integration
  $ticket = Invoke-RestMethod -Uri ($api + "/api/ticket") -Method POST -Headers $headers -Body (@{
    code = "TKT-188-" + $suffix
    name = "Ticket 18.8"
    category = "REGULAR"
    price = 75000
    quota = 40
    validFrom = $validFrom
    validUntil = $validUntil
    active = $true
  } | ConvertTo-Json)

  Expect-Reject -Name "negative_ticket_sale_without_open_shift" -Action {
    Invoke-RestMethod -Uri ($api + "/api/ticket-sale") -Method POST -Headers $headers -Body (@{
      customerName = "No Shift"
      customerPhone = "0800"
      paymentMethod = "CASH"
      items = @(@{ ticketId = $ticket.id; ticketName = $ticket.name; qty = 1; price = [double]$ticket.price; total = [double]$ticket.price })
    } | ConvertTo-Json -Depth 5)
  }

  $openShift = Invoke-RestMethod -Uri ($api + "/api/cashier-shift/open") -Method POST -Headers $headers -Body (@{ cashierId = "CSH-188"; cashierName = "Kasir 18.8"; openingCash = 100000 } | ConvertTo-Json)
  Expect-Reject -Name "negative_double_open_shift" -Action {
    Invoke-RestMethod -Uri ($api + "/api/cashier-shift/open") -Method POST -Headers $headers -Body (@{ cashierId = "CSH-188-B"; cashierName = "Kasir 18.8 B"; openingCash = 100000 } | ConvertTo-Json)
  }

  $sale = Invoke-RestMethod -Uri ($api + "/api/ticket-sale") -Method POST -Headers $headers -Body (@{
    customerName = "Sale 18.8"
    customerPhone = "08111"
    paymentMethod = "CASH"
    items = @(@{ ticketId = $ticket.id; ticketName = $ticket.name; qty = 1; price = [double]$ticket.price; total = [double]$ticket.price })
  } | ConvertTo-Json -Depth 5)
  Invoke-RestMethod -Uri ($api + "/api/ticket-sale/" + $sale.id + "/pay") -Method POST -Headers $headers -Body (@{ paymentMethod = "CASH"; paidAmount = 75000 } | ConvertTo-Json) | Out-Null
  Invoke-RestMethod -Uri ($api + "/api/ticket-sale/" + $sale.id + "/print") -Method POST -Headers $headers -Body "{}" | Out-Null

  # Reservation + activity integration
  $reservation = Invoke-RestMethod -Uri ($api + "/api/reservation") -Method POST -Headers $headers -Body (@{
    customerName = "Reservasi 18.8"
    customerPhone = "08222"
    customerEmail = "res188@example.com"
    visitDate = $visitDate
    visitSession = "PAGI"
    paymentMethod = "CASH"
    ticketItems = @(@{ ticketId = $ticket.id; ticketName = $ticket.name; qty = 1 })
  } | ConvertTo-Json -Depth 5)
  Invoke-RestMethod -Uri ($api + "/api/reservation/" + $reservation.id + "/pay") -Method POST -Headers $headers -Body (@{ paymentMethod = "CASH" } | ConvertTo-Json) | Out-Null
  Invoke-RestMethod -Uri ($api + "/api/reservation/" + $reservation.id + "/confirm") -Method POST -Headers $headers -Body "{}" | Out-Null

  $activity = Invoke-RestMethod -Uri ($api + "/api/activity") -Method POST -Headers $headers -Body (@{
    code = "ACT-188-" + $suffix
    name = "Activity 18.8"
    category = "Adventure"
    duration = 60
    capacity = 5
    price = 50000
    active = $true
  } | ConvertTo-Json)

  $schedule = Invoke-RestMethod -Uri ($api + "/api/activity-schedule") -Method POST -Headers $headers -Body (@{
    activityId = $activity.id
    date = $visitDate
    session = "PAGI"
    capacity = 5
  } | ConvertTo-Json)

  $activityBooking = Invoke-RestMethod -Uri ($api + "/api/activity-booking") -Method POST -Headers $headers -Body (@{
    reservationId = $reservation.id
    customerName = "Reservasi 18.8"
    activityId = $activity.id
    scheduleId = $schedule.id
    qty = 1
  } | ConvertTo-Json)
  Invoke-RestMethod -Uri ($api + "/api/activity-booking/" + $activityBooking.id + "/pay") -Method POST -Headers $headers -Body (@{ paymentMethod = "QRIS" } | ConvertTo-Json) | Out-Null

  # Cafe + kitchen operational integration
  $category = Invoke-RestMethod -Uri ($api + "/api/menu-category") -Method POST -Headers $headers -Body (@{
    code = "FNB-188-" + $suffix
    name = "FNB 18.8"
    active = $true
  } | ConvertTo-Json)

  $menu = Invoke-RestMethod -Uri ($api + "/api/menu-item") -Method POST -Headers $headers -Body (@{
    categoryId = $category.id
    code = "MENU-188-" + $suffix
    name = "Nasi 18.8"
    price = 30000
    stock = 20
    active = $true
  } | ConvertTo-Json)

  $cafeOrder = Invoke-RestMethod -Uri ($api + "/api/cafe-order") -Method POST -Headers $headers -Body (@{
    customerName = "Cafe 18.8"
    tableNumber = "K1"
    orderType = "DINE_IN"
    paymentMethod = "CASH"
    discount = 0
    tax = 0
    items = @(@{ menuItemId = $menu.id; menuName = $menu.name; qty = 1; price = 0; total = 0 })
  } | ConvertTo-Json -Depth 5)
  Invoke-RestMethod -Uri ($api + "/api/cafe-order/" + $cafeOrder.id + "/pay") -Method POST -Headers $headers -Body (@{ paymentMethod = "CASH" } | ConvertTo-Json) | Out-Null
  Invoke-RestMethod -Uri ($api + "/api/cafe-order/" + $cafeOrder.id + "/print") -Method POST -Headers $headers -Body "{}" | Out-Null

  # Inventory + purchasing integration
  $supplier = Invoke-RestMethod -Uri ($api + "/api/supplier") -Method POST -Headers $headers -Body (@{
    code = "SUP-188-" + $suffix
    name = "Supplier 18.8"
    phone = "08123"
    email = "sup188@example.com"
    address = "Jl 18.8"
    active = $true
  } | ConvertTo-Json)

  $inventory = Invoke-RestMethod -Uri ($api + "/api/inventory") -Method POST -Headers $headers -Body (@{
    code = "INV-188-" + $suffix
    name = "Bahan 18.8"
    unit = "KG"
    category = "BAHAN"
    minimumStock = 1
    currentStock = 10
    averageCost = 10000
    active = $true
  } | ConvertTo-Json)

  $po = Invoke-RestMethod -Uri ($api + "/api/purchase-order") -Method POST -Headers $headers -Body (@{
    supplierId = $supplier.id
    supplierName = $supplier.name
    items = @(@{ inventoryId = $inventory.id; inventoryName = $inventory.name; qty = 2; unitCost = 11000; total = 22000 })
  } | ConvertTo-Json -Depth 5)
  Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $po.id + "/approve") -Method POST -Headers $headers -Body "{}" | Out-Null
  Invoke-RestMethod -Uri ($api + "/api/purchase-order/" + $po.id + "/receive") -Method POST -Headers $headers -Body "{}" | Out-Null

  $authLogin = Invoke-RestMethod -Uri ($api + "/auth/login") -Method POST -Headers $headers -Body "{}"
  if (-not $authLogin.token) {
    throw "auth/login tidak mengembalikan token"
  }
  $reportHeaders = @{ "content-type" = "application/json"; "authorization" = ("Bearer " + $authLogin.token) }

  # Reporting checks
  Check-Get -Name "ticket_sale_report" -Url ($api + "/api/ticket-sale/report") -Headers $reportHeaders
  Check-Get -Name "reservation_report" -Url ($api + "/api/reservation/report") -Headers $reportHeaders
  Check-Get -Name "activity_booking_report" -Url ($api + "/api/activity-booking/report") -Headers $reportHeaders
  Check-Get -Name "cafe_order_report" -Url ($api + "/api/cafe-order/report") -Headers $reportHeaders
  Check-Get -Name "inventory_report" -Url ($api + "/api/inventory/report") -Headers $reportHeaders
  Check-Get -Name "inventory_dashboard" -Url ($api + "/api/inventory/dashboard") -Headers $reportHeaders

  $aggFrom = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
  $aggTo = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
  $aggUrl = $api + "/api/erp-wisata/report?from=" + $aggFrom + "&to=" + $aggTo

  Check-Get -Name "erp_wisata_aggregated_report" -Url $aggUrl -Headers $reportHeaders
  try {
    $agg = Invoke-RestMethod -Uri $aggUrl -Method GET -Headers $reportHeaders
    $hasOperational = $null -ne $agg.operational
    $hasFinancial = $null -ne $agg.financial
    $hasReservation = $null -ne $agg.reservation
    if ($hasOperational -and $hasFinancial -and $hasReservation) {
      Add-Result -Name "erp_wisata_aggregated_sections" -Status "PASS" -Value "operational/financial/reservation"
    } else {
      Add-Result -Name "erp_wisata_aggregated_sections" -Status "FAIL" -Value "Missing required sections"
    }

    if ($agg.period.from -eq $aggFrom -and $agg.period.to -eq $aggTo) {
      Add-Result -Name "erp_wisata_aggregated_period_filter" -Status "PASS" -Value ("from=" + $agg.period.from + ";to=" + $agg.period.to)
    } else {
      Add-Result -Name "erp_wisata_aggregated_period_filter" -Status "FAIL" -Value ("from=" + $agg.period.from + ";to=" + $agg.period.to)
    }

    $hasFinancialFields = $null -ne $agg.financial.grossSales -and $null -ne $agg.financial.paidSales -and $null -ne $agg.financial.outstanding -and $null -ne $agg.financial.cancelled
    $hasOperationalGroups = $null -ne $agg.operational.ticketSales -and $null -ne $agg.operational.reservations -and $null -ne $agg.operational.activityBookings -and $null -ne $agg.operational.cafeOrders -and $null -ne $agg.operational.inventory
    $hasReservationFields = $null -ne $agg.reservation.total -and $null -ne $agg.reservation.confirmed -and $null -ne $agg.reservation.checkedIn -and $null -ne $agg.reservation.cancelled

    if ($hasFinancialFields -and $hasOperationalGroups -and $hasReservationFields) {
      Add-Result -Name "erp_wisata_aggregated_payload_contract" -Status "PASS" -Value "required fields present"
    } else {
      Add-Result -Name "erp_wisata_aggregated_payload_contract" -Status "FAIL" -Value "missing required fields"
    }
  } catch {
    Add-Result -Name "erp_wisata_aggregated_sections" -Status "FAIL" -Value $_.Exception.Message
    Add-Result -Name "erp_wisata_aggregated_period_filter" -Status "FAIL" -Value $_.Exception.Message
    Add-Result -Name "erp_wisata_aggregated_payload_contract" -Status "FAIL" -Value $_.Exception.Message
  }

  # Negative authorization checks
  Check-Get-ExpectStatus -Name "negative_unauthorized_ticket_sale_report" -Url ($api + "/api/ticket-sale/report") -StatusCode 403
  Check-Get-ExpectStatus -Name "negative_unauthorized_reservation_report" -Url ($api + "/api/reservation/report") -StatusCode 403
  Check-Get-ExpectStatus -Name "negative_unauthorized_activity_booking_report" -Url ($api + "/api/activity-booking/report") -StatusCode 403
  Check-Get-ExpectStatus -Name "negative_unauthorized_cafe_order_report" -Url ($api + "/api/cafe-order/report") -StatusCode 403
  Check-Get-ExpectStatus -Name "negative_unauthorized_inventory_report" -Url ($api + "/api/inventory/report") -StatusCode 403
  Check-Get-ExpectStatus -Name "negative_unauthorized_erp_wisata_aggregated_report" -Url $aggUrl -StatusCode 403
  Check-Get-ExpectStatus -Name "negative_invalid_period_format_erp_wisata_aggregated_report" -Url ($api + "/api/erp-wisata/report?from=2026-13-01") -StatusCode 400 -Headers $reportHeaders
  Check-Get-ExpectStatus -Name "negative_invalid_period_range_erp_wisata_aggregated_report" -Url ($api + "/api/erp-wisata/report?from=2026-08-10&to=2026-08-01") -StatusCode 400 -Headers $reportHeaders

  # Route/operational completion checks
  foreach ($route in @("/kitchen", "/cafe", "/inventory", "/purchase", "/stock-movement", "/activities", "/activity-booking")) {
    Check-Get -Name ("page" + $route.Replace("/", "_")) -Url ($customer + $route)
  }

  # Negative hardening checks
  Expect-Reject -Name "negative_invalid_stock_movement_filter" -Action {
    Invoke-RestMethod -Uri ($api + "/api/stock-movement?movementType=INVALID") -Method GET
  }

  Expect-Reject -Name "negative_invalid_report_method" -Action {
    Invoke-RestMethod -Uri ($api + "/api/cafe-order/report") -Method POST -Headers $headers -Body "{}"
  }

  $hasFail = @($results | Where-Object { $_.status -eq "FAIL" }).Count -gt 0
  $exit = if ($hasFail) { 1 } else { 0 }

  [pscustomobject]@{
    RUN = if ($hasFail) { "FAIL" } else { "PASS" }
    ACCEPTANCE = if ($hasFail) { "FAIL" } else { "PASS" }
    REGRESSION = if ($hasFail) { "FAIL" } else { "PASS" }
    NEGATIVE_TEST = if (@($results | Where-Object { $_.name -like "negative_*" -and $_.status -eq "FAIL" }).Count -eq 0) { "PASS" } else { "FAIL" }
    EXIT_CODE = $exit
    RESULTS = $results
  } | ConvertTo-Json -Depth 6

  exit $exit
}
catch {
  $hadFatal = $true
  Add-Result -Name "fatal_error" -Status "FAIL" -Value $_.Exception.Message
  [pscustomobject]@{
    RUN = "FAIL"
    ACCEPTANCE = "FAIL"
    REGRESSION = "FAIL"
    NEGATIVE_TEST = "FAIL"
    EXIT_CODE = 1
    RESULTS = $results
  } | ConvertTo-Json -Depth 6
  exit 1
}
finally {
  if ($customerProc -and -not $customerProc.HasExited) {
    Stop-Process -Id $customerProc.Id -Force -ErrorAction SilentlyContinue
  }
  if ($apiProc -and -not $apiProc.HasExited) {
    Stop-Process -Id $apiProc.Id -Force -ErrorAction SilentlyContinue
  }
  Stop-PortListeners -Ports @(3010, 3210)
}
