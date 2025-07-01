# Test /auth/me endpoint with real token
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    email = "admin@gmail.com"
    password = "admin@123"
} | ConvertTo-Json

try {
    Write-Host "Getting token from login..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers $headers -Body $body
    
    if ($loginResponse.success) {
        Write-Host "✅ Login successful!" -ForegroundColor Green
        $token = $loginResponse.data.token
        Write-Host "Token obtained: $($token.Substring(0, 50))..." -ForegroundColor Cyan
        
        # Test /auth/me endpoint
        $authHeaders = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }
        
        Write-Host "Testing /auth/me endpoint..." -ForegroundColor Yellow
        $meResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $authHeaders
        
        Write-Host "✅ /auth/me endpoint successful!" -ForegroundColor Green
        Write-Host "User ID: $($meResponse.data._id)" -ForegroundColor Cyan
        Write-Host "User Name: $($meResponse.data.name)" -ForegroundColor Cyan
        Write-Host "User Email: $($meResponse.data.email)" -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ Login failed: $($loginResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")