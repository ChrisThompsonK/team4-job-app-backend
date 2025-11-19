# Example terraform.tfvars file for Team4 Job App Backend
# Core Infrastructure
resource_group_name = "rg-team4-jobapp-backend-dev"
location            = "UK South"
environment         = "dev"

# Project Configuration
project_name = "jobapp"
team_name    = "team4"

# App Service Configuration
app_service_plan_sku = "F1" # Free tier for development

# Database Configuration
database_tier = "Basic" # Basic tier for development

# Additional tags (optional)
common_tags = {
  Environment = "dev"
  ManagedBy   = "Terraform"
  Project     = "JobApp-Backend"
  Team        = "Team4"
  CostCenter  = "Development"
}