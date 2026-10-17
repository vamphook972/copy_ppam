variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "appam-admin"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_zone_id" {
  type = string
}

variable "repository_url" {
  type        = string
  description = "URL of the GitLab repository"
}

variable "oauth_token" {
  type        = string
  description = "GitLab Personal or Project Access Token to read the private repository"
  sensitive   = true
}

variable "branch_name" {
  type    = string
  default = "master"
}

variable "api_url" {
  type = string
}

variable "user_pool_id" {
  type = string
}

variable "user_pool_client_id" {
  type = string
}