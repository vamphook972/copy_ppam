module "amplify" {
  source = "../../modules/amplify"

  app = {
    project_name   = var.project_name
    environment    = var.environment
    repository_url = var.repository_url
    branch         = var.branch_name
    build_spec     = file("../../../amplify.yml")
    oauth_token    = var.oauth_token
    tags           = {}
    environment_variables = {
      APP_ENV                         = var.environment
      NEXT_PUBLIC_API_URL             = var.api_url
      NEXT_PUBLIC_AWS_REGION          = var.aws_region
      NEXT_PUBLIC_USER_POOL_ID        = var.user_pool_id
      NEXT_PUBLIC_USER_POOL_CLIENT_ID = var.user_pool_client_id
    }
  }
}

locals {
  domain_name = "appam.co"
}

resource "aws_amplify_domain_association" "domain" {
  app_id                = module.amplify.app_id
  domain_name           = local.domain_name
  wait_for_verification = false

  sub_domain {
    branch_name = module.amplify.branch_name
    prefix      = ""
  }
}

# Auxiliar para leer los datos de validación de AWS
locals {
  cert_record  = split(" ", aws_amplify_domain_association.domain.certificate_verification_dns_record)
  record_name  = trimsuffix(local.cert_record[0], ".")
  record_value = trimsuffix(local.cert_record[2], ".")
}

# Validación SSL/ACM vía módulo Cloudflare
module "cloudflare_dns_validation" {
  source = "../../modules/cloudflare"

  dns = {
    zone_id   = var.cloudflare_zone_id
    zone_name = "appam.co"
    hostname  = local.record_name
    target    = local.record_value
    proxied   = false
  }
}

# Tráfico web vía módulo Cloudflare
module "cloudflare_dns" {
  source = "../../modules/cloudflare"

  dns = {
    zone_id   = var.cloudflare_zone_id
    zone_name = "appam.co"
    hostname  = "@"
    target    = "${module.amplify.branch_name}.${module.amplify.app_id}.amplifyapp.com"
    proxied   = true
  }
}
