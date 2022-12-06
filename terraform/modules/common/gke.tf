module "gke" {
  source                    = "terraform-google-modules/kubernetes-engine/google//modules/private-cluster"
  project_id                = var.project_id
  name                      = local.cluster_name
  regional                  = true
  region                    = var.region
  zones                     = var.availability_zones
  network                   = module.vpc.network_name
  ip_range_pods             = local.pod_range_name
  ip_range_services         = local.ip_range_services_name
  subnetwork                = module.vpc.subnets_names[0]

  http_load_balancing        = false
  network_policy             = false
  horizontal_pod_autoscaling = true
  filestore_csi_driver       = false
  # enable_private_endpoint    = true
  # enable_private_nodes       = true

  # create_service_account    = true
  default_max_pods_per_node = 20
  remove_default_node_pool  = true
  disable_default_snat = true
  # master_ipv4_cidr_block          = var.master_ipv4_cidr_block 

  master_authorized_networks = [{
    cidr_block   = var.vpc_cidr
    display_name = "VPC"
  }]

  node_pools = [
    {
      name            = "pool-default"
      min_count       = var.min_cluster_capacity
      max_count       = var.max_cluster_capacity
      local_ssd_count = 0
      disk_size_gb    = var.disk_size_gb
      disk_type       = var.disk_type
      machine_type    = var.machine_type
      auto_repair     = true
      auto_upgrade    = true
      preemptible       = false
      ip_range_pods     = local.pod_range_name
    }
  ]
}
