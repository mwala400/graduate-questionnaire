/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['libreoffice-convert', 'archiver', 'exceljs', '@prisma/client']
  }
};

module.exports = nextConfig;
