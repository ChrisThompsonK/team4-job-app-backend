# Terraform variables file for Team4 Job App Backend

# Core Infrastructure
location    = "UK South"
environment = "dev"

# Project Configuration
project_name = "jobapp"
team_name    = "team4"

# Pipeline Configuration (can be overridden by CI/CD)
ci_cd        = false
git_branch   = "local"
build_number = "local-dev"

# Common tags (will be merged with environment-specific tags in main.tf)
common_tags = {
  Project    = "JobApp-Backend"
  Team       = "Team4"
  Repository = "team4-job-app-backend"
  CostCenter = "Development"
}