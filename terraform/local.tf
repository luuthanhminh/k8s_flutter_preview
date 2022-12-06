locals {
  tags = merge(var.tags, {
    project      = var.project
    env          = var.environment
    region       = var.region
    provision_by = "terraform"
  })
}
