/** @type {import('next').NextConfig} */
export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '**',
      },
    ],
  },
};
