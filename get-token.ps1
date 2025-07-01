# Simple script to get a fresh token
$baseUrl = "http://localhost:5000"

$loginData = @{
    email = "admin@gmail.com"
    password = "admin@123"
} | ConvertTo-Json

try {
    Write-Host "Getting fresh token..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    
    $responseData = $response.Content | ConvertFrom-Json
    
    if ($responseData.success -and $responseData.data.token) {
        Write-Host "✅ Token obtained successfully!" -ForegroundColor Green
        Write-Host "Token: $($responseData.data.token)" -ForegroundColor Cyan
        
        # Now test the /auth/me endpoint
        Write-Host ""
        Write-Host "Testing /auth/me endpoint..." -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $($responseData.data.token)"
            "Content-Type" = "application/json"
        }
        
        $meResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers -UseBasicParsing
        
        Write-Host "✅ /auth/me test successful!" -ForegroundColor Green
        Write-Host "Status Code: $($meResponse.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($meResponse.Content)" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Login failed - no token received" -ForegroundColor Red
        Write-Host "Response: $($response.Content)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Request failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")