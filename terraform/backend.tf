# Backend State Configuration for Team4 Job App Backend
# This configuration stores the Terraform state in Azure Storage
# Make sure the storage account and container exist before running terraform init

terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-mgmt"
    storage_account_name = "aistatemgmt"
    container_name       = "team4-backend"
    key                  = "team4-job-app-backend.tfstate"

    # Optional: Uncomment if you want to use these settings
    # use_oidc = true
    # subscription_id = "your-subscription-id"
    # tenant_id       = "your-tenant-id"
  }
}
