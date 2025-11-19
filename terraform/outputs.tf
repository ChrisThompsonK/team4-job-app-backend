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