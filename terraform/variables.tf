# General
variable "project_id" {}

variable "project" {}

variable "region" {}

variable "environment" {}
variable "tags" {
  type    = map(any)
  default = {}
}
# Network
variable "vpc_cidr" {}
variable "subnet_tags" {
  type    = map(any)
  default = {}
}
variable "availability_zones" {}

variable "pod_cidr" {}

variable "service_cidr" {}


# Node Type
variable "min_cluster_capacity" {
  default = 1
  type    = number
  validation {
    condition     = var.min_cluster_capacity > 0 && var.min_cluster_capacity <= 20
    error_message = "Minimum cluster capacity must be between 1 and 20 (included)."
  }
}

variable "max_cluster_capacity" {
  default = 10
  type    = number
  validation {
    condition     = var.max_cluster_capacity > 0 && var.max_cluster_capacity <= 20
    error_message = "Maximum cluster capacity must be between 1 and 20 (included)."
  }
}
variable "machine_type" {}

variable "disk_type" {
  default = "pd-standard"
}
variable "disk_size_gb" {
  default = 50
}