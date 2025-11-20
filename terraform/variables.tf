# Core Variables for Team4 Job App Backend Infrastructure

variable "resource_group_name" {
  description = "The name of the Azure resource group for backend infrastructure"
  type        = string
  default     = "team4-backend"

  validation {
    condition     = can(regex("^[a-zA-Z0-9_-]{1,90}$", var.resource_group_name))
    error_message = "Resource group name must be 1-90 characters and contain only alphanumeric characters, underscores, and hyphens."
  }
}

variable "location" {
  description = "The Azure region where resources will be deployed"
  type        = string
  default     = "UK South"

  validation {
    condition     = var.location == "UK South"
    error_message = "Location must be UK South for this project."
  }
}

variable "environment" {
  description = "The environment name (dev, test, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, prod."
  }
}

# Project-specific variables
variable "project_name" {
  description = "The name of the project"
  type        = string
  default     = "jobapp"

  validation {
    condition     = can(regex("^[a-z0-9]+$", var.project_name))
    error_message = "Project name must contain only lowercase alphanumeric characters."
  }
}

variable "team_name" {
  description = "The team name"
  type        = string
  default     = "team4"

  validation {
    condition     = can(regex("^[a-z0-9]+$", var.team_name))
    error_message = "Team name must contain only lowercase alphanumeric characters."
  }
}

variable "key_vault_name" {
  description = "Name of the existing Key Vault for secrets management"
  type        = string
  default     = "team4-job-app-key-vault"
}

variable "key_vault_resource_group_name" {
  description = "Resource group name where the Key Vault is located"
  type        = string
  default     = "team4-rg"
}

variable "container_registry_name" {
  description = "Name of the existing Azure Container Registry"
  type        = string
  default     = "aiacademy25"
}

variable "container_registry_resource_group_name" {
  description = "Resource group name where the Container Registry is located"
  type        = string
  default     = "team4-backend"
}

# Common tags to be applied to all resources
variable "common_tags" {
  description = "Common tags to be applied to all resources"
  type        = map(string)
  default = {
    Environment = "dev"
    ManagedBy   = "Terraform"
    Project     = "JobApp-Backend"
    Team        = "Team4"
  }
}
