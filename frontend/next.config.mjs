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
      // Priorizar localhost se estiver em desenvolvimento, senão usar Render
      const isDev = process.env.NODE_ENV === 'development';
      const destination = isDev 
        ? 'http://localhost:8000' 
        : (process.env.BACKEND_URL || 'https://swiftdesk-nvsl.onrender.com');
        
      console.log(`Rewriting API requests to: ${destination}`);
      
      return [
        {
          source: '/api/:path*',
          destination: `${destination}/:path*`,
        },
      ];
    },
}

export default nextConfig

