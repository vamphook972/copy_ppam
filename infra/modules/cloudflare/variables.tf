variable "dns" {
  description = "DNS configuration"
  type = object({
    zone_id   = string
    zone_name = string
    hostname  = string
    target    = string
    proxied   = bool
  })
}
