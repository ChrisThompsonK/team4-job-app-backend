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
  sku                 = var.acr_sku
  admin_enabled       = false # Security best practice - use managed identity

  # Enable public network access (can be restricted later)
  public_network_access_enabled = true

  # Enable zone redundancy for Premium SKU
  zone_redundancy_enabled = var.acr_sku == "Premium" ? true : false

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

# App Service for the backend API
resource "azurerm_linux_web_app" "backend" {
  name                = "app-${local.naming_prefix}-backend-${var.environment}"
  resource_group_name = azurerm_resource_group.backend.name
  location            = azurerm_service_plan.backend.location
  service_plan_id     = azurerm_service_plan.backend.id

  site_config {
    always_on = var.environment == "prod" ? true : false

    application_stack {
      docker_image     = "${azurerm_container_registry.acr.login_server}/${var.docker_image_name}"
      docker_image_tag = var.docker_image_tag
    }

    # Health check configuration
    health_check_path = "/health"
  }

  # Application settings
  app_settings = merge(var.app_settings, {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "DOCKER_REGISTRY_SERVER_URL"          = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_ENABLE_CI"                    = "true"
    "NODE_ENV"                            = var.environment == "prod" ? "production" : "development"
    "PORT"                                = "3001"
  })

  # Configure managed identity for ACR access
  identity {
    type = "SystemAssigned"
  }

  tags = merge(local.common_tags, {
    Service = "WebApp"
  })

  depends_on = [azurerm_container_registry.acr]
}

# Role assignment for App Service to pull from ACR
resource "azurerm_role_assignment" "app_service_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app.backend.identity[0].principal_id

  depends_on = [azurerm_linux_web_app.backend]
}
