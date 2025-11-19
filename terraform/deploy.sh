#!/bin/bash
# Terraform deployment script with error handling and validation
# Usage: ./deploy.sh [environment] [action]

set -e  # Exit on any error

ENVIRONMENT=${1:-dev}
ACTION=${2:-plan}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Validation
if [[ ! "$ENVIRONMENT" =~ ^(dev|prod)$ ]]; then
    log_error "Environment must be 'dev' or 'prod', got: $ENVIRONMENT"
    exit 1
fi

if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
    log_error "Action must be 'plan', 'apply', or 'destroy', got: $ACTION"
    exit 1
fi

# Check if we're in the terraform directory
if [[ ! -f "main.tf" ]]; then
    log_error "main.tf not found. Please run this script from the terraform directory."
    exit 1
fi

BACKEND_KEY="team4-jobapp-backend-$ENVIRONMENT.tfstate"
TFVARS_FILE="environments/$ENVIRONMENT.tfvars"

# Check if tfvars file exists
if [[ ! -f "$TFVARS_FILE" ]]; then
    log_error "Environment file not found: $TFVARS_FILE"
    exit 1
fi

log_info "Starting Terraform $ACTION for $ENVIRONMENT environment"

# Set environment variables
export TF_VAR_environment="$ENVIRONMENT"
export TF_VAR_git_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
export TF_VAR_ci_cd="false"
export TF_VAR_build_number="local-$(date +%Y%m%d-%H%M%S)"

# Initialize Terraform with environment-specific state
log_info "Initializing Terraform with state key: $BACKEND_KEY"
terraform init -backend-config="key=$BACKEND_KEY"

# Validate configuration
log_info "Validating Terraform configuration"
terraform validate

# Format check (non-breaking)
if ! terraform fmt -check=true >/dev/null 2>&1; then
    log_warn "Terraform files are not properly formatted. Run 'terraform fmt' to fix."
fi

case $ACTION in
    plan)
        log_info "Running Terraform plan"
        terraform plan -var-file="$TFVARS_FILE" -input=false
        ;;
    apply)
        log_info "Running Terraform plan and apply"
        terraform plan -var-file="$TFVARS_FILE" -out=tfplan -input=false
        log_info "Applying Terraform plan"
        terraform apply -auto-approve tfplan
        rm -f tfplan  # Clean up plan file
        log_info "Deployment completed successfully!"
        ;;
    destroy)
        log_warn "This will destroy all resources in $ENVIRONMENT environment!"
        read -p "Are you sure? Type 'yes' to confirm: " -r
        if [[ $REPLY == "yes" ]]; then
            terraform plan -destroy -var-file="$TFVARS_FILE" -out=destroy.tfplan -input=false
            terraform apply -auto-approve destroy.tfplan
            rm -f destroy.tfplan
            log_info "Destroy completed successfully!"
        else
            log_info "Destroy cancelled."
        fi
        ;;
esac

log_info "Done! 🚀"