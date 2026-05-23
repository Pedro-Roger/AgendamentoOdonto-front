import path from 'node:path';

const PRIVATE_PATHS = [
  '/dashboard/:path*',
  '/pacientes/:path*',
  '/prontuario/:path*',
  '/configuracoes/:path*',
  '/assinatura/:path*',
  '/sign/:path*',
  '/api/:path*',
];

const NOINDEX_HEADERS = [
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve('./'),
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    return PRIVATE_PATHS.map((source) => ({
      source,
      headers: NOINDEX_HEADERS,
    }));
  },
};

export default nextConfig;
