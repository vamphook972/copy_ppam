variable "app" {
  description = "Configuración de la aplicación"
  type = object({
    project_name          = string
    environment           = string
    repository_url        = string
    branch                = string
    build_spec            = string
    environment_variables = map(string)
    tags                  = map(string)
    oauth_token           = string
  })
}
