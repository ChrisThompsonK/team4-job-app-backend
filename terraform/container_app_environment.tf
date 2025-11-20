resource "azurerm_container_app" "backend" {
  name                         = "ca-team4-backend-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.backend.id
  resource_group_name          = "team4-backend"
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.job_app_backend.id]
  }

  registry {
    server   = data.azurerm_container_registry.acr.login_server
    identity = azurerm_user_assigned_identity.job_app_backend.id
  }

  template {
    container {
      name   = "backend"
      image  = "${data.azurerm_container_registry.acr.login_server}/team4-backend:latest"
      cpu    = "0.5"
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "3001"
      }

      env {
        name  = "DATABASE_URL"
        value = "file:/app/data/database.sqlite"
      }
    }
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = false
    target_port                = 3001
    transport                  = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = var.common_tags
}

output "backend_fqdn" {
  value = azurerm_container_app.backend.latest_revision_fqdn
}
