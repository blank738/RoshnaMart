try {
    $login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"buyer@roshnamart.com","password":"Buyer@123"}'
    $token = $login.token
    Write-Host "Logged in successfully, token received."

    $headers = @{ Authorization = "Bearer $token" }
    $body = @{ productId = 12; quantity = 1 } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/buyer/cart" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    Write-Host "Response: $($res | ConvertTo-Json)"
} catch {
    Write-Host "Exception: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())"
    }
}
