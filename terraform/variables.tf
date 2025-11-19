# Core Variables for Team4 Job App Backend Infrastructure

variable "resource_group_name" {
  description = "The name of the Azure resource group for backend infrastructure"
  type        = string
  default     = "rg-team4-jobapp-backend"

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
    condition = contains([
      "UK South", "UK West", "West Europe", "North Europe",
      "East US", "West US", "Central US"
    ], var.location)
    error_message = "Location must be a valid Azure region."
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

# Backend-specific variables

