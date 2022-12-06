output "cluster_name" {
    value = local.cluster_name
}

output "endpoint" {
  value = module.gke.endpoint
}

output "ca_certificate" {
  value = module.gke.ca_certificate
}
output "network_name" {
  value = module.vpc.network_name
}

output "network_self_link" {
  value = module.vpc.network_self_link
}
output "subnets" {
  value = local.secondary_subnets
}
