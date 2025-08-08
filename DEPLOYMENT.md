# Soft Deployment Guide

This guide provides step-by-step instructions for deploying Soft to an Azure VM. The deployment process is designed to be safe, repeatable, and maintainable.

## Architecture Overview

- **Frontend**: React served by IIS at `https://www.softlyplease.com`
- **Backend**: Node.js running on `localhost:4000` (proxied by IIS)
- **Compute**: Rhino.Compute running on `127.0.0.1:8081` with private API key
- **Plugin**: C# SoftComputePlugIn (.rhp) for AI-enhanced operations
- **Deployment**: Azure VM with IIS + PM2, manual Sync only

## Prerequisites

### Azure VM Requirements
- Windows Server 2019/2022
- Public IP: 4.206.116.20
- User: azureuser
- Ports: 80, 443 (public), 3389 (RDP, restricted)

### Software Requirements
1. **Node.js**
   - Version: 18+ LTS
   - Global packages: pm2, pm2-windows-service

2. **IIS**
   - Features: Static Content, URL Rewrite, ARR
   - SSL: Let's Encrypt via win-acme

3. **Rhino**
   - Version: Rhino 8
   - Compute: Latest version
   - License: Cloud Zoo (All Users)

4. **Development Tools**
   - Git (optional)
   - 7-Zip/WinSCP

## Deployment Process

### 1. Preparation

1. **Create Backup**
   ```powershell
   # Run with -DryRun first
   .\scripts\deploy-package.ps1 -DryRun $true
   
   # Then run actual backup
   .\scripts\deploy-package.ps1 -DryRun $false
   ```

2. **Review Package**
   - Check deployment package at `E:\USB_Deploy\Soft`
   - Verify no secrets are included
   - Confirm all necessary files are present

### 2. VM Setup

1. **Directory Structure**
   ```
   C:\apps\soft\
   ├── backend\           # Node.js backend
   ├── frontend\         # React frontend
   ├── gh\              # Grasshopper definitions
   ├── logs\            # PM2 and app logs
   └── scripts\         # Deployment scripts
   ```

2. **Install Prerequisites**
   ```powershell
   # Install IIS features
   Install-WindowsFeature Web-Server,Web-Asp-Net45,Web-Http-Redirect,Web-Http-Logging,Web-Filtering,Web-IP-Security,Web-Url-Auth,Web-Windows-Auth

   # Install URL Rewrite and ARR
   # Download and install from Microsoft's website

   # Install Node.js
   # Download and install from nodejs.org

   # Install PM2
   npm install -g pm2
   npm install -g pm2-windows-service
   pm2-service-install -n "pm2-soft"
   ```

3. **Configure IIS**
   ```powershell
   # Create site
   New-WebSite -Name "SoftlyPlease" -PhysicalPath "C:\apps\soft\frontend" -Port 80

   # Configure SSL (using win-acme)
   wacs.exe --target iis --siteid 1 --installation iis --accepttos
   ```

### 3. Deployment

1. **Stop Services**
   ```powershell
   pm2 stop all
   iisreset /stop
   ```

2. **Copy Files**
   ```powershell
   # Copy deployment package
   robocopy E:\USB_Deploy\Soft C:\apps\soft /MIR
   ```

3. **Configure Environment**
   ```powershell
   # Copy template
   Copy-Item .env.template .env
   
   # Edit environment variables
   notepad .env
   ```

4. **Install Dependencies**
   ```powershell
   # Backend
   cd C:\apps\soft\backend
   npm install --production
   
   # Frontend
   cd C:\apps\soft\frontend
   npm install --production
   ```

5. **Start Services**
   ```powershell
   # Start PM2
   cd C:\apps\soft\backend
   pm2 start ecosystem.config.js
   pm2 save
   
   # Start IIS
   iisreset /start
   ```

### 4. Verification

1. **Run Verification Script**
   ```powershell
   cd C:\apps\soft\scripts
   .\verify-deployment.ps1
   ```

2. **Check Components**
   - Frontend: https://www.softlyplease.com
   - Backend API: https://www.softlyplease.com/api/health
   - Rhino.Compute: http://127.0.0.1:8081/version
   - OpenAI API: https://www.softlyplease.com/api/ai/validate

3. **Monitor Logs**
   ```powershell
   pm2 logs
   Get-Content C:\apps\soft\logs\*.log
   ```

## Rollback Procedure

1. **Stop Services**
   ```powershell
   pm2 stop all
   iisreset /stop
   ```

2. **Restore Backup**
   ```powershell
   robocopy E:\USB_Backup\Soft C:\apps\soft /MIR
   ```

3. **Restart Services**
   ```powershell
   cd C:\apps\soft\backend
   pm2 start ecosystem.config.js
   iisreset /start
   ```

## Maintenance

### Daily Checks
1. Monitor PM2 processes: `pm2 status`
2. Check IIS logs for errors
3. Verify Rhino.Compute status
4. Review OpenAI API usage

### Weekly Tasks
1. Check SSL certificate expiration
2. Review and rotate logs
3. Update Node.js dependencies if needed
4. Test backup restoration

### Monthly Tasks
1. Windows updates
2. SSL certificate renewal (if needed)
3. Full system backup
4. Performance review

## Security Notes

1. **API Keys**
   - Store in environment variables
   - Rotate regularly
   - Never commit to repository

2. **Network Security**
   - Rhino.Compute: localhost only
   - Node.js: localhost only
   - IIS: Public HTTPS only

3. **CORS**
   - Restrict to `softlyplease.com` domains
   - No IP-based access

4. **Deployment**
   - Manual sync only
   - No auto-deploy from GitHub
   - Review all changes before sync

## Troubleshooting

### Common Issues

1. **Backend Not Starting**
   - Check PM2 logs
   - Verify environment variables
   - Test port availability

2. **Rhino.Compute Issues**
   - Check Rhino license
   - Verify localhost binding
   - Test Grasshopper definitions

3. **Frontend 502 Errors**
   - Check IIS reverse proxy
   - Verify backend health
   - Review ARR configuration

4. **OpenAI API Errors**
   - Validate API key
   - Check rate limits
   - Review error responses

### Support Contacts

1. **Infrastructure Issues**
   - Azure Support
   - VM Administrator

2. **Application Issues**
   - Development Team
   - Repository Maintainers

3. **Third-Party Services**
   - Rhino Support
   - OpenAI Support

## Documentation

For more detailed information, refer to:
- `docs/soft-rhino-codex/` - Complete development guide
- `scripts/deploy-package.ps1` - Deployment automation
- `ecosystem.config.js` - PM2 configuration
- `web.config` - IIS configuration
