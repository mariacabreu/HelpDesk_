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
      // Usando a URL do Render como padrão para o deploy
      const destination = process.env.BACKEND_URL || 'https://swiftdesk-nvsl.onrender.com';
      return [
        {
          source: '/api/:path*',
          destination: `${destination}/:path*`,
        },
      ];
    },
}

export default nextConfig

