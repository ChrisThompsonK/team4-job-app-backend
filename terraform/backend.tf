terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-mgmt"
    storage_account_name = "aistatemgmt"
    container_name       = "team4-backend"
    
    key = "team4-jobapp-backend-dev.tfstate"
  }
}
