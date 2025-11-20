# Core Variables for Team4 Job App Backend Infrastructure

# Note: resource_group_name is now dynamically generated in main.tf using locals
# This supports environment-based naming without hardcoding values

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

# Pipeline-specific variables
variable "ci_cd" {
  description = "Whether this is running in a CI/CD pipeline"
  type        = bool
  default     = false
}

variable "git_branch" {
  description = "The git branch being deployed (for pipeline context)"
  type        = string
  default     = "unknown"

  validation {
    condition     = length(var.git_branch) > 0
    error_message = "Git branch cannot be empty."
  }
}

variable "build_number" {
  description = "The build number from the CI/CD pipeline"
  type        = string
  default     = "local"

  validation {
    condition     = length(var.build_number) > 0
    error_message = "Build number cannot be empty."
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
    Project    = "JobApp-Backend"
    Team       = "Team4"
    Repository = "team4-job-app-backend"
  }
}

# Backend-specific variables

# Azure Container Registry Configuration
variable "acr_sku" {
  description = "The SKU for Azure Container Registry"
  type        = string
  default     = "Basic"

  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.acr_sku)
    error_message = "ACR SKU must be one of: Basic, Standard, Premium."
  }
}

# App Service Configuration
variable "app_service_sku" {
  description = "The SKU for App Service Plan"
  type        = string
  default     = "B1"

  validation {
    condition     = can(regex("^(B[1-3]|S[1-3]|F[1-3]|P[1-3](v2|v3)?|Y1)$", var.app_service_sku))
    error_message = "App Service SKU must be a valid Azure App Service SKU (e.g., B1, S1, P1v2, P2v3, etc.)."
  }
}

variable "app_service_always_on" {
  description = "Whether the App Service should always be on"
  type        = bool
  default     = true
}

# Container Configuration
variable "docker_image_name" {
  description = "The name of the Docker image"
  type        = string
  default     = "jobapp-backend"

  validation {
    condition     = can(regex("^[a-z0-9]+([a-z0-9._-]*[a-z0-9]+)?$", var.docker_image_name))
    error_message = "Docker image name must be a valid container image name."
  }
}

variable "docker_image_tag" {
  description = "The tag of the Docker image"
  type        = string
  default     = "latest"
}

# Application Settings
variable "app_settings" {
  description = "Application settings for the App Service"
  type        = map(string)
  default     = {}
}

