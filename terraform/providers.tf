data "google_client_config" "default" {}
provider "google" {}

provider "google-beta" {}
provider "kubernetes" {
  host                   = "https://${module.infrastructure.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.infrastructure.ca_certificate)
}
