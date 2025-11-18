variable "azure_subscription_id" {
  description = "Azure Subscription ID"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "team4-job-app"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "uksouth"
}

variable "existing_container_registry_name" {
  description = "Name of the existing Azure Container Registry to use"
  type        = string
}

variable "existing_container_registry_rg" {
  description = "Resource group name where the existing Container Registry is located"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "Team4-Job-App"
    ManagedBy   = "Terraform"
    Environment = "Production"
  }
}
