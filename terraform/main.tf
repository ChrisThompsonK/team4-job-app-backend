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

# Azure Container Registry for storing Docker images
resource "azurerm_container_registry" "acr" {
  name                = "acr${replace(local.naming_prefix, "-", "")}${var.environment}"
  resource_group_name = azurerm_resource_group.backend.name
  location            = azurerm_resource_group.backend.location

  sku           = var.acr_sku
  admin_enabled = true

  tags = merge(local.common_tags, {
    Service = "ContainerRegistry"
  })
}

# App Service Plan for hosting the backend API
resource "azurerm_service_plan" "backend" {
  name                = "asp-${local.naming_prefix}-backend-${var.environment}"
  resource_group_name = azurerm_resource_group.backend.name
  location            = azurerm_resource_group.backend.location

  os_type  = "Linux"
  sku_name = var.app_service_sku

  tags = merge(local.common_tags, {
    Service = "AppServicePlan"
  })
}

# Linux Web App for the backend API
resource "azurerm_linux_web_app" "backend" {
  name                = "app-${local.naming_prefix}-backend-${var.environment}"
  resource_group_name = azurerm_resource_group.backend.name
  location            = azurerm_resource_group.backend.location
  service_plan_id     = azurerm_service_plan.backend.id

  site_config {
    always_on = var.app_service_always_on

    application_stack {
      docker_image_name   = "${azurerm_container_registry.acr.login_server}/job-app-backend:latest"
      docker_registry_url = "https://${azurerm_container_registry.acr.login_server}"
    }
  }

  app_settings = {
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.acr.admin_password
    "WEBSITES_PORT"                   = "3000"
    "NODE_ENV"                        = var.environment
  }

  identity {
    type = "SystemAssigned"
  }

  tags = merge(local.common_tags, {
    Service = "AppService"
  })
}
