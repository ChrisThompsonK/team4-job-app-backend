terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.116"
    }
  }
} # Configure Azure Provider with Service Principal authentication
provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }

  # These can be set via environment variables:
  # ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_SUBSCRIPTION_ID, ARM_TENANT_ID
}

# Locals for dynamic naming
locals {
  # Naming convention: {team}-{project}-{component}-{environment}
  naming_prefix = "${var.team_name}-${var.project_name}"

  # Environment-specific naming
  resource_group_name = "rg-${local.naming_prefix}-backend-${var.environment}"

  # Common tags with environment-specific values
  common_tags = merge(
    var.common_tags,
    {
      Environment = var.environment
      Component   = "backend"
      ManagedBy   = "Terraform"
      DeployedBy  = "Pipeline"
    }
  )
}

# Resource Group for the Job Application Backend
resource "azurerm_resource_group" "backend" {
  name     = local.resource_group_name
  location = var.location

  tags = local.common_tags

  lifecycle {
    create_before_destroy = true
  }
}
