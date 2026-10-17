locals {
  app_name = "${var.app.project_name}-${var.app.environment}"

  tags = merge(
    {
      Project     = var.app.project_name
      Environment = var.app.environment
      ManagedBy   = "Terraform"
    },
    var.app.tags
  )
}
