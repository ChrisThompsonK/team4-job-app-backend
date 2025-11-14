terraform {
  backend "azurerm" {
    resource_group_name  = "team4-backend"
    storage_account_name = "team4tfstate"
    container_name       = "tfstate"
    key                  = "team4-job-app-backend.tfstate"
  }
}
