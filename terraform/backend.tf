terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "team4jobappterraformstate"
    container_name       = "tfstate"
    key                  = "team4-job-app-backend.tfstate"
  }
}
