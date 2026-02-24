Set-Location "c:\Users\mari_\OneDrive\Escritorio\puntoVentaInd"
Write-Host "Iniciando creacion de Frontend..."
npx -y create-vite@latest frontend --template react-ts

$frontendSrc = "c:\Users\mari_\OneDrive\Escritorio\puntoVentaInd\frontend\src"
$frontendDirs = @(
    "app", "assets\styles", "assets\icons", "components\ui", "components\layout",
    "features\auth", "features\catalog", "features\pos", "features\fiscal", "features\wallet",
    "hooks", "services\api", "services\localDb", "store", "types", "utils",
    "..\tests\components", "..\tests\features"
)
foreach ($dir in $frontendDirs) {
    New-Item -ItemType Directory -Force -Path "$frontendSrc\$dir" | Out-Null
}

Write-Host "Iniciando creacion de Backend..."
$backendPath = "c:\Users\mari_\OneDrive\Escritorio\puntoVentaInd\backend"
New-Item -ItemType Directory -Force -Path $backendPath | Out-Null
Set-Location $backendPath

dotnet new sln -n puntoVentaInd | Out-Null

dotnet new classlib -n Core -o src/Core | Out-Null
dotnet new classlib -n Application -o src/Application | Out-Null
dotnet new classlib -n Infrastructure -o src/Infrastructure | Out-Null
dotnet new webapi -n API -o src/API | Out-Null
dotnet new xunit -n Core.UnitTests -o tests/Core.UnitTests | Out-Null
dotnet new xunit -n Application.UnitTests -o tests/Application.UnitTests | Out-Null
dotnet new xunit -n API.IntegrationTests -o tests/API.IntegrationTests | Out-Null

dotnet sln add src/Core/Core.csproj src/Application/Application.csproj src/Infrastructure/Infrastructure.csproj src/API/API.csproj tests/Core.UnitTests/Core.UnitTests.csproj tests/Application.UnitTests/Application.UnitTests.csproj tests/API.IntegrationTests/API.IntegrationTests.csproj | Out-Null

$backendDirs = @(
    "src\Core\Entities", "src\Core\Enums", "src\Core\Exceptions", "src\Core\Interfaces",
    "src\Application\DTOs", "src\Application\Features\Catalog", "src\Application\Features\Fiscal", "src\Application\Features\POS", "src\Application\Features\Tenants", "src\Application\Validations",
    "src\Infrastructure\Persistence\Contexts", "src\Infrastructure\Persistence\Interceptors", "src\Infrastructure\Persistence\Migrations", "src\Infrastructure\Persistence\Repositories", "src\Infrastructure\ExternalServices\ARCA", "src\Infrastructure\ExternalServices\Redis", "src\Infrastructure\Security",
    "src\API\Controllers", "src\API\Middleware"
)
foreach ($dir in $backendDirs) {
    New-Item -ItemType Directory -Force -Path "$backendPath\$dir" | Out-Null
}

Set-Location "$backendPath\src\Application"
dotnet add reference ../Core/Core.csproj | Out-Null
Set-Location "$backendPath\src\Infrastructure"
dotnet add reference ../Application/Application.csproj ../Core/Core.csproj | Out-Null
Set-Location "$backendPath\src\API"
dotnet add reference ../Application/Application.csproj ../Infrastructure/Infrastructure.csproj | Out-Null

Write-Host "Estructura de Backend y Frontend creada exitosamente."
