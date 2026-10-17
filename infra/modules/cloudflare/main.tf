resource "cloudflare_dns_record" "this" {
  zone_id = var.dns.zone_id
  name    = var.dns.hostname
  type    = "CNAME"
  content = var.dns.target
  ttl     = 1
  proxied = var.dns.proxied
}
