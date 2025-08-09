# Deploy FE changes to VM (Windows PowerShell)
param(
    [string]$FERepoURL = "https://github.com/boi1da-proj/SoftGeometry.git",
    [string]$FEPathOnVM = "C:\inetpub\wwwroot\Soft.Geometry",
    [string]$AzureResourceGroup = "",
    [string]$AzureWebAppName = ""
)

Write-Output "🚀 Deploying Soft.Geometry frontend to VM..."

# Step 1: Ensure FE path exists
if (-Not (Test-Path $FEPathOnVM)) { 
    Write-Output "Cloning repository to $FEPathOnVM"
    git clone $FERepoURL $FEPathOnVM 
}

# Step 2: Pull latest changes
Set-Location $FEPathOnVM
Write-Output "Pulling latest changes from main branch..."
git fetch --all
git reset --hard origin/main

# Step 3: Install/build (if Node.js is installed on the VM)
if (Test-Path ".\package.json") {
    Write-Output "Installing dependencies and building..."
    npm install
    npm run build --if-present
}

# Step 4: Restart Azure Web App (requires Azure CLI)
if ($AzureResourceGroup -ne "" -and $AzureWebAppName -ne "") {
    Write-Output "Restarting Azure Web App: $AzureWebAppName"
    az webapp restart --name $AzureWebAppName --resource-group $AzureResourceGroup
} else {
    Write-Output "Azure App details not provided; please restart manually if needed."
}

Write-Output "✅ Frontend deployment complete!"
