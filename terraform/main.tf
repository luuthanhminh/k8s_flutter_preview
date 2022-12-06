module "infrastructure" {
  source = "./modules/common"

  project_id         = var.project_id
  project            = var.project
  environment        = var.environment
  region             = var.region
  availability_zones = var.availability_zones

  vpc_cidr     = var.vpc_cidr
  pod_cidr     = var.pod_cidr
  service_cidr = var.service_cidr
  subnet_tags  = local.tags

  min_cluster_capacity = var.min_cluster_capacity
  max_cluster_capacity = var.max_cluster_capacity
  machine_type         = var.machine_type
  disk_type            = var.disk_type
  disk_size_gb         = var.disk_size_gb

  tags = local.tags
}
