# Data source to reference the existing shared Container App Environment
data "azurerm_container_app_environment" "backend" {
  name                = "team4-aca-env"
  resource_group_name = "team4-rg"
}

resource "azurerm_container_app" "backend" {
  name                         = "ca-team4-backend-${var.environment}"
  container_app_environment_id = data.azurerm_container_app_environment.backend.id
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

  secret {
    name                = "session-secret"
    key_vault_secret_id = "${data.azurerm_key_vault.job_app_kv.vault_uri}secrets/SESSIONSECRET"
    identity            = azurerm_user_assigned_identity.job_app_backend.id
  }

  template {
    container {
      name   = "backend"
      image  = "${data.azurerm_container_registry.acr.login_server}/team4-job-app-backend:6ac9ed2"
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

      env{
        name = "CV_UPLOAD_DIR"
        value = "./uploads/cvs"
      }

      env{
        name = "MAX_CV_FILE_SIZE"
        value = 10485760
      }

      env{
        name = "ALLOWED_CV_EXTENSIONS"
        value = "doc,docx,pdf"
      }

      env{
        name = "ALLOWED_CV_MIME_TYPES"
        value = "application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
      }

      env {
        name        = "SESSION_SECRET"
        secret_name = "session-secret"
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
