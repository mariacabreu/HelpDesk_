/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  async rewrites() {
    // URL do backend no Render fornecida pelo usuário
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://swiftdesk-nvsl.onrender.com';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig

