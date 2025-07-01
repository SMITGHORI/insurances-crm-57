# Test /auth/me endpoint directly with a hardcoded token
# This bypasses the login rate limiting

$baseUrl = "http://localhost:5000"

# Use a token from a previous successful login (you'll need to update this)
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZkNzJhNzNhNzE5YzI4ZGJhNzNhNzciLCJpYXQiOjE3MzU3NTQ2NTMsImV4cCI6MTczNjM1OTQ1M30.Uy8Uy_Uy8Uy_Uy8Uy_Uy8Uy_Uy8Uy_Uy8Uy_Uy8Uy_Uy8"

Write-Host "Testing /auth/me endpoint directly..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers -UseBasicParsing
    
    Write-Host "✅ Test successful!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        try {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorContent = $reader.ReadToEnd()
            Write-Host "Response: $errorContent" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error response" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")