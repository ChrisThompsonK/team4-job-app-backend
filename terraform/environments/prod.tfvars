# Production Environment Configuration
# File: environments/prod.tfvars

# Core Infrastructure
location    = "UK South"
environment = "prod"

# Project Configuration
project_name = "jobapp"
team_name    = "team4"

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