locals {
  fqdn = var.dns.hostname == "@" ? var.dns.zone_name : "${var.dns.hostname}.${var.dns.zone_name}"
}
