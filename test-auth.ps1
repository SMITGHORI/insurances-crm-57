# Test authentication with admin credentials
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    email = "admin@gmail.com"
    password = "admin@123"
} | ConvertTo-Json

try {
    Write-Host "Testing login with admin@gmail.com..."
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User: $($response.data.user.name)" -ForegroundColor Cyan
    Write-Host "Email: $($response.data.user.email)" -ForegroundColor Cyan
    Write-Host "Role: $($response.data.user.role.name)" -ForegroundColor Cyan
    Write-Host "Permissions: $($response.data.permissions.Count) permissions loaded" -ForegroundColor Cyan
    Write-Host "Token: $($response.data.token.Substring(0, 50))..." -ForegroundColor Yellow
    
    # Test getting current user
    Write-Host "`nTesting /auth/me endpoint..."
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $($response.data.token)"
    }
    
    $currentUser = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $authHeaders
    Write-Host "✅ Current user fetched successfully!" -ForegroundColor Green
    Write-Host "User ID: $($currentUser.data._id)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Authentication test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")