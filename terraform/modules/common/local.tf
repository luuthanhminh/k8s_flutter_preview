locals {
  prefix = "${var.project}-${var.environment}-${var.region}"
  cluster_name  = "${local.prefix}-cluster"

  tags = merge(var.tags, {
    project      = var.project
    env          = var.environment
    region       = var.region
    provision_by = "terraform"
  })

  ip_range_services_name = "${local.prefix}-gke-service-range"
  pod_range_name         = "${local.prefix}-gke-pod-range"

  subnet_tags = merge(local.tags, var.subnet_tags, {})

  secondary_subnets = [
    {
      range_name    = local.ip_range_services_name
      ip_cidr_range = var.service_cidr
    },
    {
      range_name    = local.pod_range_name
      ip_cidr_range = var.pod_cidr
    }
  ]
}

