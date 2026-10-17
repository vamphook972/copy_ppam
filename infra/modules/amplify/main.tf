resource "aws_iam_role" "amplify_role" {
  name = "${var.app.project_name}-${var.app.environment}-amplify-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "amplify_role_policy" {
  role       = aws_iam_role.amplify_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

resource "aws_amplify_app" "this" {
  name       = "${var.app.project_name}-${var.app.environment}"
  repository = var.app.repository_url

  platform             = "WEB_COMPUTE" # Next.js 14 SSR
  build_spec           = var.app.build_spec
  iam_service_role_arn = aws_iam_role.amplify_role.arn

  enable_branch_auto_build = true
  oauth_token              = var.app.oauth_token

  environment_variables = var.app.environment_variables
  tags                  = local.tags
}

resource "aws_amplify_branch" "this" {
  app_id      = aws_amplify_app.this.id
  branch_name = var.app.branch

  framework         = "Next.js - SSR"
  enable_auto_build = true

  stage = var.app.environment == "prod" ? "PRODUCTION" : "DEVELOPMENT"
}
