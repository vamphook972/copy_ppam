terraform {
  backend "s3" {
    bucket         = "appam-terraform-state"
    key            = "appam/frontend/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "appam-back-terraform-locks"
    encrypt        = true
  }
}
