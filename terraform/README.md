# Terraform Infrastructure - Team4 Job App Backend

This directory contains Terraform configuration for deploying the Team4 Job Application Backend infrastructure to Azure.

## 🚀 Quick Setup

### Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.6
- Azure CLI with valid authentication
- Access to the `terraform-state-mgmt` resource group for state storage

### 1. Setup Local Environment

```bash
# Clone and navigate to terraform directory
cd terraform

# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your settings (optional for defaults)
```

### 2. Local Deployment

```bash
# Plan deployment
./deploy.sh dev plan

# Apply deployment
./deploy.sh dev apply

# Destroy (when needed)
./deploy.sh dev destroy
```

## 📁 Project Structure

```
terraform/
├── main.tf                    # Main infrastructure configuration
├── variables.tf               # Input variables and validation
├── outputs.tf                 # Output values
├── backend.tf                 # Remote state configuration
├── deploy.sh                  # Local deployment script
├── terraform.tfvars           # Local variable values (git ignored)
├── terraform.tfvars.example   # Example variable values
└── environments/
    ├── dev.tfvars             # Development environment
    └── prod.tfvars            # Production environment
```

## 🏗️ Architecture

### Naming Convention
`{team}-{project}-{component}-{environment}`

Examples:
- Resource Group: `rg-team4-jobapp-backend-dev`
- Resources: `{service}-team4-jobapp-backend-dev`

### Environments

- **dev**: Development environment (default for local)
- **prod**: Production environment (CI/CD only)

### State Management

- **Backend**: Azure Storage Account
- **State Files**: `team4-jobapp-backend-{environment}.tfstate`
- **Container**: `team4-backend`

## 🔧 Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `location` | Azure region | `"UK South"` |
| `environment` | Environment name | `"dev"` or `"prod"` |
| `project_name` | Project identifier | `"jobapp"` |
| `team_name` | Team identifier | `"team4"` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ci_cd` | Running in CI/CD | `false` |
| `git_branch` | Git branch | `"unknown"` |
| `build_number` | Build number | `"local"` |
| `common_tags` | Resource tags | See variables.tf |

## 🔄 CI/CD Integration

### Pipeline Environments

- **Feature branches**: Plan only (dev environment)
- **Main branch**: Plan + Apply (prod environment)

### Environment Variables

```bash
# Azure Service Principal (set in pipeline)
ARM_CLIENT_ID="xxx"
ARM_CLIENT_SECRET="xxx"
ARM_SUBSCRIPTION_ID="xxx"
ARM_TENANT_ID="xxx"

# Terraform variables (set by pipeline)
TF_VAR_environment="prod"
TF_VAR_ci_cd="true"
TF_VAR_git_branch="main"
TF_VAR_build_number="123"
```

## 🛠️ Development

### Local Commands

```bash
# Check formatting
terraform fmt

# Validate configuration
terraform validate

# Plan with specific environment
terraform plan -var-file="environments/dev.tfvars"

# Show current state
terraform show

# List resources
terraform state list
```

### Deploy Script Features

- ✅ Input validation
- ✅ Error handling with colored output
- ✅ File existence checks
- ✅ Automatic state key generation
- ✅ Format checking
- ✅ Plan file cleanup

## 📋 Best Practices Applied

- ✅ **Remote state** with environment separation
- ✅ **Version pinning** for Terraform and providers
- ✅ **Input validation** on all variables
- ✅ **Dynamic naming** with consistent conventions
- ✅ **Comprehensive tagging** strategy
- ✅ **Environment isolation** via separate tfvars
- ✅ **Security** considerations (no secrets in config)
- ✅ **Documentation** with examples

## 🔒 Security

- State files stored securely in Azure Storage
- No secrets in Terraform files
- Service Principal authentication
- Resource tagging for compliance

## 🧪 Testing

```bash
# Validate syntax
terraform validate

# Check formatting
terraform fmt -check

# Dry run
./deploy.sh dev plan
```

## 📚 Resources

- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure Naming Conventions](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)