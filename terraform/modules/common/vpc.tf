module "vpc" {
  source       = "terraform-google-modules/network/google"
  version      = "~> 4.0.1"
  project_id   = var.project_id
  network_name = local.prefix
  mtu          = 1460

  subnets = [{
    subnet_name           = "${local.prefix}"
    subnet_ip             = var.vpc_cidr
    subnet_region         = var.region
    subnet_private_access = "true"
    subnet_flow_logs      = "false"
  }]
  secondary_ranges = {
    "${local.prefix}" = local.secondary_subnets
  }
}

# module "cloud-nat" {
#   source        = "terraform-google-modules/cloud-nat/google"
#   version       = "~> 2.0"
#   project_id    = var.project_id
#   region        = var.region
#   router        = "${local.prefix}-router"
#   network       = module.vpc.network_self_link
#   create_router = true
# }