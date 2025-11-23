import path from 'path'

const nextConfig = {
  // Habilitar standalone output para Docker
  output: 'standalone',
  // A chave saiu de experimental e agora é top-level em Next 16
  outputFileTracingRoot: path.join(__dirname, '..'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.sa-east-1.amazonaws.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
        pathname: '/**'
      }
    ]
  }
} satisfies import('next').NextConfig

export default nextConfig
