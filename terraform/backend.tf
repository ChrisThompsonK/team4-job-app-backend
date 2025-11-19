terraform {
  backend "azurerm" {
    # These values can be provided via:
    # 1. Backend configuration file (-backend-config)
    # 2. Environment variables (ARM_ACCESS_KEY for storage account key)
    # 3. Service Principal authentication

    resource_group_name  = "terraform-state-mgmt"
    storage_account_name = "aistatemgmt"
    container_name       = "team4-backend"

    # State file key is set dynamically via:
    # - Local: deploy.sh script sets backend-config="key=team4-jobapp-backend-{env}.tfstate"
    # - Pipeline: terraform init -backend-config="key=team4-jobapp-backend-${var.environment}.tfstate"
    # Default fallback for manual init without backend-config
    key = "team4-jobapp-backend-dev.tfstate"
  }
}
