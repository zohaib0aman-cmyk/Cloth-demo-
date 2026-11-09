/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdfkit", "sharp"],
  outputFileTracingIncludes: {
    "/api/invoice/[orderNumber]": ["./assets/fonts/**/*", "./public/brand/**/*"],
  },
  poweredByHeader: false,
};
export default nextConfig;
