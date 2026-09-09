try {
    $login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@roshnamart.com","password":"Admin@123"}'
    $headers = @{ Authorization = "Bearer $($login.token)" }
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/sellers?status=PENDING" -Method Get -Headers $headers
    Write-Host "Response count: $($res.content.Count)"
} catch {
    Write-Host "Exception: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())"
    }
}
