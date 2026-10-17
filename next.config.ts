import createNextIntlPlugin from "next-intl/plugin";

import packageJson from "./package.json";

import "./src/config/env";

const withNextIntl = createNextIntlPlugin();

const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "";

const cspHeader = `
  default-src 'self';
  frame-src 'self' blob:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://ui-avatars.com https://unpkg.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  connect-src 'self' https://cognito-idp.${region}.amazonaws.com https://*.amazonaws.com https://*.amazoncognito.com ${cognitoDomain ? `https://${cognitoDomain}` : ""} ${apiUrl} https://nominatim.openstreetmap.org https://cloudflareinsights.com https://*.cloudflareinsights.com;
  upgrade-insecure-requests;
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "0",
  },
];

export default withNextIntl({
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
});
