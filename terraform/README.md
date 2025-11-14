# Terraform Infrastructure

This directory contains Terraform configuration for deploying the Team 4 Job Application backend to Azure.

## Architecture

The infrastructure includes:
- **Resource Group**: Container for all resources
- **Container Registry**: For storing Docker images
- **App Service Plan**: Linux-based hosting plan
- **App Service**: Container-based web app
- **Storage Account**: For SQLite database and file uploads
- **Application Insights**: For monitoring and logging
- **Log Analytics Workspace**: For centralized logging

## Prerequisites

1. **Azure CLI** installed and authenticated
2. **Terraform** >= 1.9.0 installed
3. **Azure Subscription** with contributor access
4. **Service Principal** or **Managed Identity** configured for GitHub Actions (OIDC)

## Setup

### 1. Create Backend Storage (One-time setup)

Before using Terraform, create a storage account for the Terraform state:

```bash
# Create resource group for Terraform state
az group create --name terraform-state-rg --location uksouth

# Create storage account
az storage account create \
  --name team4jobappterraformstate \
  --resource-group terraform-state-rg \
  --location uksouth \
  --sku Standard_LRS \
  --encryption-services blob

# Create storage container
az storage container create \
  --name tfstate \
  --account-name team4jobappterraformstate
```

### 2. Configure Variables

Copy the example variables file and update with your values:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your actual values:
- Azure subscription ID
- JWT and session secrets
- CORS allowed origins
- Other configuration as needed

**Important**: Never commit `terraform.tfvars` to version control (it's in `.gitignore`).

### 3. Configure GitHub Secrets

Add these secrets to your GitHub repository:

- `AZURE_CLIENT_ID`: Service Principal Client ID
- `AZURE_TENANT_ID`: Azure AD Tenant ID
- `AZURE_SUBSCRIPTION_ID`: Azure Subscription ID

For GitHub Actions OIDC setup, follow: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure

## Local Usage

### Initialize Terraform

```bash
cd terraform
terraform init
```

### Validate Configuration

```bash
terraform validate
terraform fmt -check
```

### Plan Changes

```bash
terraform plan
```

### Apply Changes

```bash
terraform apply
```

### View Outputs

```bash
terraform output
terraform output -json
```

### Destroy Infrastructure

```bash
terraform destroy
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/terraform.yml`) handles:

1. **Validation**: Checks formatting and validates configuration on every PR
2. **Plan**: Generates and comments the plan on pull requests
3. **Apply**: Automatically applies changes when merged to `main`

## Important Notes

1. **State Management**: Terraform state is stored in Azure Storage (configured in `backend.tf`)
2. **Secrets**: Use Azure Key Vault or GitHub Secrets for sensitive values in production
3. **Costs**: The configuration uses Basic/Standard SKUs to minimize costs
4. **SQLite**: For production, consider migrating to Azure Database for PostgreSQL
5. **Scaling**: Adjust App Service Plan SKU in `main.tf` for higher performance needs

## Resource Naming Convention

Resources follow this pattern: `{project_name}-{environment}-{resource_type}`

Example: `team4-job-app-prod-rg`

## Troubleshooting

### Backend Initialization Error

If you get an error about the backend not existing:
```bash
terraform init -backend=false  # Initialize without backend
```

Then create the backend storage as described in Setup section.

### State Lock Issues

If the state is locked:
```bash
terraform force-unlock <lock-id>
```

### Container Registry Authentication

To authenticate with the container registry:
```bash
az acr login --name <registry-name>
```

## Next Steps

1. Set up the backend storage account
2. Configure `terraform.tfvars` with your values
3. Run `terraform init` and `terraform plan` locally
4. Configure GitHub Secrets for CI/CD
5. Push to `main` branch to trigger deployment
