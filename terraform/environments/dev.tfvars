# Development Environment Configuration
# File: environments/dev.tfvars

# Core Infrastructure
location    = "UK South"
environment = "dev"

# Project Configuration
project_name = "jobapp"
team_name    = "team4"

# Container Registry Configuration
acr_sku = "Basic"

# App Service Configuration
app_service_sku = "B1"

# Container Configuration
docker_image_name = "jobapp-backend"
docker_image_tag  = "dev-latest"

# Application Settings
app_settings = {
  "NODE_ENV"  = "development"
  "LOG_LEVEL" = "debug"
}

# Pipeline-specific (usually set by CI/CD)
ci_cd        = false
git_branch   = "dev"
build_number = "local-dev"

# Development-specific tags
common_tags = {
  Project    = "JobApp-Backend"
  Team       = "Team4"
  Repository = "team4-job-app-backend"
  CostCenter = "Development"
  Owner      = "Team4-Dev"
}