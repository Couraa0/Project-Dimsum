/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
            { protocol: 'https', hostname: 'project-dimsum-production.up.railway.app', pathname: '/uploads/**' },
            { protocol: 'https', hostname: '**' },
        ],
        unoptimized: true,
    },
    webpack: (config, { dev }) => {
        if (dev) {
            config.devtool = 'source-map';
        }
        return config;
    },
    turbopack: {},
};

module.exports = nextConfig;
