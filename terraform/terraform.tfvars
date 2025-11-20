# Example terraform.tfvars file for Team4 Job App Backend
# Core Infrastructure
resource_group_name = "team4-backend"
location            = "UK South"
environment         = "dev"

# Project Configuration
project_name = "jobapp"
team_name    = "team4"

# Additional tags (optional)
common_tags = {
  Environment = "dev"
  ManagedBy   = "Terraform"
  Project     = "JobApp-Backend"
  Team        = "Team4"
  CostCenter  = "Development"
}