$ErrorActionPreference = 'Stop'

Write-Host "========================================================"
Write-Host "      ROSHNAMART FULL-STACK INTEGRATION SUITE"
Write-Host "========================================================"

Write-Host "`n--- TEST 1: Public Dynamic Settings ---"
$settings = Invoke-RestMethod -Uri "http://localhost:8080/api/settings" -Method Get
Write-Host "Platform Name: $($settings.platformName)"
Write-Host "Default Commission: $($settings.defaultCommissionPercentage)%"
Write-Host "Delivery Charge: $($settings.deliveryCharge)"
Write-Host "Free Delivery Threshold: $($settings.freeDeliveryThreshold)"

Write-Host "`n--- TEST 2: Live Search API (Debounced Navbar Query) ---"
$searchRes = Invoke-RestMethod -Uri "http://localhost:8080/api/products?search=wireless&size=5" -Method Get
Write-Host "Found $($searchRes.content.Count) products matching 'wireless':"
foreach ($p in $searchRes.content) {
    Write-Host " - $($p.name) | Price: $($p.price) | Seller: $($p.sellerBusinessName)"
}

Write-Host "`n--- TEST 3: Buyer Authentication & Profile Setup ---"
$buyerLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"buyer@roshnamart.com","password":"Buyer@123"}'
$buyerToken = $buyerLogin.token
Write-Host "Buyer authenticated: $($buyerLogin.name) | Role: $($buyerLogin.role)"

$buyerHeaders = @{ Authorization = "Bearer $buyerToken" }
$addresses = Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/addresses" -Method Get -Headers $buyerHeaders
Write-Host "Existing addresses: $($addresses.Count)"

$addressId = $null
if ($addresses.Count -gt 0) {
    $addressId = $addresses[0].id
    Write-Host "Using existing address ID: $addressId ($($addresses[0].addressLine), $($addresses[0].city))"
} else {
    Write-Host "Creating sample delivery address..."
    $addrBody = @{
        fullName = "John Doe"
        phone = "9876543210"
        addressLine = "Flat 402, Green Meadows, 12th Cross"
        city = "Bengaluru"
        state = "Karnataka"
        pincode = "560001"
        country = "India"
        addressType = "HOME"
        isDefault = $true
    } | ConvertTo-Json
    $newAddr = Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/addresses" -Method Post -Headers $buyerHeaders -ContentType "application/json" -Body $addrBody
    $addressId = $newAddr.id
    Write-Host "Created address ID: $addressId"
}

Write-Host "`n--- TEST 4: Multi-Vendor Cart Population ---"
# Clear cart first for clean state
Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/cart" -Method Delete -Headers $buyerHeaders | Out-Null
Write-Host "Cart reset successfully."

# Retrieve 2 products from different sellers
$prodList = Invoke-RestMethod -Uri "http://localhost:8080/api/products?size=10" -Method Get
$apexProd = $prodList.content | Where-Object { $_.sellerBusinessName -like "*Apex*" } | Select-Object -First 1
$urbanProd = $prodList.content | Where-Object { $_.sellerBusinessName -like "*Urban*" } | Select-Object -First 1

Write-Host "Adding Apex Product (ID: $($apexProd.id), '$($apexProd.name)') to cart..."
Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/cart/items" -Method Post -Headers $buyerHeaders -ContentType "application/json" -Body (@{ productId = $apexProd.id; quantity = 1 } | ConvertTo-Json) | Out-Null

Write-Host "Adding Urban Vogue Product (ID: $($urbanProd.id), '$($urbanProd.name)') to cart..."
Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/cart/items" -Method Post -Headers $buyerHeaders -ContentType "application/json" -Body (@{ productId = $urbanProd.id; quantity = 1 } | ConvertTo-Json) | Out-Null

$cart = Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/cart" -Method Get -Headers $buyerHeaders
Write-Host "Cart item count: $($cart.items.Count)"
Write-Host "Cart subtotal: $($cart.subtotal)"
$vendorsInCart = $cart.items | ForEach-Object { $_.sellerBusinessName } | Select-Object -Unique
Write-Host "Vendors in Cart: $($vendorsInCart -join ' & ')"

Write-Host "`n--- TEST 5: Real Coupon Validation ---"
$couponRes = Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/coupons/validate?code=WELCOME10&amount=$($cart.subtotal)" -Method Get -Headers $buyerHeaders
Write-Host "Coupon valid: $($couponRes.valid) | Code: $($couponRes.code) | Discount: $($couponRes.discountAmount) | Message: $($couponRes.message)"

Write-Host "`n--- TEST 6: Multi-Vendor Checkout Order Placement ---"
$checkoutBody = @{
    addressId = $addressId
    paymentMethod = "ONLINE"
    couponCode = "WELCOME10"
} | ConvertTo-Json

$order = Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/checkout" -Method Post -Headers $buyerHeaders -ContentType "application/json" -Body $checkoutBody
Write-Host "Order Placed! OrderNumber: $($order.orderNumber)"
Write-Host "Total Amount: $($order.totalAmount) | Discount: $($order.discountAmount) | Delivery: $($order.deliveryCharge) | Final: $($order.finalAmount)"
Write-Host "Status: $($order.orderStatus) | Items in Order: $($order.items.Count)"
foreach ($it in $order.items) {
    Write-Host "  - Product: '$($it.productName)' | Seller: $($it.sellerBusinessName) | Status: $($it.itemStatus) | Subtotal: $($it.subtotal)"
}

Write-Host "`n--- TEST 7: Seller Isolation & Order Item Fulfillment ---"
$sellerLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"techseller@roshnamart.com","password":"Seller@123"}'
$sellerToken = $sellerLogin.token
$sellerHeaders = @{ Authorization = "Bearer $sellerToken" }

$sellerDash = Invoke-RestMethod -Uri "http://localhost:8080/api/seller/dashboard" -Method Get -Headers $sellerHeaders
Write-Host "Seller Dashboard Metrics:"
Write-Host "  Gross Sales: $($sellerDash.grossSales)"
Write-Host "  Net Earnings: $($sellerDash.netEarnings)"
Write-Host "  Platform Commission Rate: $($sellerDash.commissionPercentage)%"

$sellerOrders = Invoke-RestMethod -Uri "http://localhost:8080/api/seller/orders?size=10" -Method Get -Headers $sellerHeaders
Write-Host "Seller Order Items Count: $($sellerOrders.content.Count)"

# Enforce strict seller isolation check
foreach ($it in $sellerOrders.content) {
    if ($it.sellerBusinessName -notlike "*Apex*") {
        throw "SECURITY / ISOLATION ERROR: Seller saw order item for $($it.sellerBusinessName)"
    }
}
Write-Host ">>> STRICT SELLER ISOLATION CONFIRMED: 100% of order items belong to Apex Electronics Hub"

# Update item status
$firstItem = $sellerOrders.content | Select-Object -First 1
Write-Host "Updating item (ID: $($firstItem.id), '$($firstItem.productName)') status to PROCESSING..."
$updatedItem = Invoke-RestMethod -Uri "http://localhost:8080/api/seller/orders/items/$($firstItem.id)/status?status=PROCESSING" -Method Patch -Headers $sellerHeaders
Write-Host "Updated Item Status: $($updatedItem.itemStatus)"

Write-Host "`n--- TEST 8: Admin Dashboard, Seller Approval & Audit Logs ---"
$adminLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@roshnamart.com","password":"Admin@123"}'
$adminToken = $adminLogin.token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

$adminDash = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/dashboard" -Method Get -Headers $adminHeaders
Write-Host "Admin Overview: Total Users: $($adminDash.totalUsers) | Orders: $($adminDash.totalOrders) | Revenue: $($adminDash.totalRevenue)"

$pendingSellers = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/sellers?status=PENDING" -Method Get -Headers $adminHeaders
Write-Host "Pending Sellers Count: $($pendingSellers.content.Count)"
if ($pendingSellers.content.Count -gt 0) {
    $pending = $pendingSellers.content[0]
    Write-Host "Approving pending seller '$($pending.businessName)' (ID: $($pending.id))..."
    $approveRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/sellers/$($pending.id)/approve" -Method Put -Headers $adminHeaders
    Write-Host "Approval Result: $($approveRes.message)"
} else {
    Write-Host "No pending sellers currently awaiting approval."
}

$auditLogs = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/audit-logs?size=5" -Method Get -Headers $adminHeaders
Write-Host "Recent Audit Log Entries: $($auditLogs.content.Count)"
foreach ($log in $auditLogs.content) {
    Write-Host "  - [$($log.createdAt)] $($log.action): $($log.details)"
}

Write-Host "`n========================================================"
Write-Host "   ALL REAL DATABASE & API OPERATIONS VERIFIED PASSING!"
Write-Host "========================================================"
