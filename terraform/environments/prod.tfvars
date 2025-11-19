# Production Environment Configuration
# File: environments/prod.tfvars

# Core Infrastructure
location    = "UK South"
environment = "prod"

# Project Configuration
project_name = "jobapp"
team_name    = "team4"

# Container Registry Configuration
acr_sku = "Standard" # Higher SKU for production with vulnerability scanning

# App Service Configuration
app_service_sku = "S1" # Standard tier for production

# Container Configuration
docker_image_name = "jobapp-backend"
docker_image_tag  = "latest"

# Application Settings
app_settings = {
  "NODE_ENV"  = "production"
  "LOG_LEVEL" = "info"
}

# Pipeline-specific (usually set by CI/CD)
ci_cd        = true
git_branch   = "main"
build_number = "pipeline-build"

# Production-specific tags
common_tags = {
  Project     = "JobApp-Backend"
  Team        = "Team4"
  Repository  = "team4-job-app-backend"
  CostCenter  = "Production"
  Owner       = "Team4-Ops"
  Criticality = "High"
}