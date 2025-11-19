# Resource Group Outputs
output "resource_group_id" {
  description = "The ID of the backend resource group"
  value       = azurerm_resource_group.backend.id
}

output "resource_group_name" {
  description = "The name of the backend resource group"
  value       = azurerm_resource_group.backend.name
}

output "resource_group_location" {
  description = "The Azure region where the backend resource group is located"
  value       = azurerm_resource_group.backend.location
}

output "resource_group_tags" {
  description = "The tags applied to the backend resource group"
  value       = azurerm_resource_group.backend.tags
}

# Environment Information
output "environment" {
  description = "The current environment"
  value       = var.environment
}

output "project_name" {
  description = "The project name"
  value       = var.project_name
}

output "team_name" {
  description = "The team name"
  value       = var.team_name
}

# Pipeline-friendly outputs
output "naming_prefix" {
  description = "The naming prefix used for resources"
  value       = local.naming_prefix
}

# Container Registry Outputs
output "acr_name" {
  description = "The name of the Azure Container Registry"
  value       = azurerm_container_registry.acr.name
}

output "acr_login_server" {
  description = "The login server URL for the Azure Container Registry"
  value       = azurerm_container_registry.acr.login_server
}

output "acr_id" {
  description = "The resource ID of the Azure Container Registry"
  value       = azurerm_container_registry.acr.id
}

# App Service Outputs
output "app_service_name" {
  description = "The name of the App Service"
  value       = azurerm_linux_web_app.backend.name
}

output "app_service_url" {
  description = "The URL of the App Service"
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "app_service_id" {
  description = "The resource ID of the App Service"
  value       = azurerm_linux_web_app.backend.id
}

output "app_service_principal_id" {
  description = "The principal ID of the App Service managed identity"
  value       = azurerm_linux_web_app.backend.identity[0].principal_id
}

output "deployment_info" {
  description = "Information about the deployment"
  value = {
    environment  = var.environment
    git_branch   = var.git_branch
    build_number = var.build_number
    deployed_at  = timestamp()
    ci_cd_mode   = var.ci_cd
  }

  # Note: Set to true in production to avoid logging deployment details
  sensitive = false
}