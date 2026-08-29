/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enables instrumentation.ts's register() hook (auto admin credentials).
    instrumentationHook: true,
    serverComponentsExternalPackages: ['archiver', 'exceljs', '@prisma/client', 'pdf-lib', 'docx'],
    // Makes sure the logo PNGs are bundled into the serverless functions
    // that read them via fs (needed for document generation on Vercel).
    outputFileTracingIncludes: {
      '/api/**': ['./public/logos/**']
    }
  }
};

module.exports = nextConfig;
