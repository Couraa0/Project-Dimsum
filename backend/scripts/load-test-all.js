const http = require('http');

const endpoints = [
    // --- BACKEND API (Port 5000) ---
    { name: 'API: Menu Data', port: 5000, path: '/api/menu' },
    { name: 'API: Categories', port: 5000, path: '/api/categories' },
    { name: 'API: Table Info (1)', port: 5000, path: '/api/tables/1/info' },
    { name: 'API: Testimonials', port: 5000, path: '/api/testimonials' },
    { name: 'API: Settings', port: 5000, path: '/api/settings' },

    // --- FRONTEND PAGES (Port 3000) ---
    { name: 'WEB: Home Page', port: 3000, path: '/' },
    { name: 'WEB: Menu Page', port: 3000, path: '/menu' },
    { name: 'WEB: Cart Page', port: 3000, path: '/cart' },
    { name: 'WEB: Checkout/Order', port: 3000, path: '/order' },
    { name: 'WEB: Dine-in QR', port: 3000, path: '/dinein?meja=01' },
    { name: 'WEB: Order Track', port: 3000, path: '/track' }
];

// Reusing connection agent prevents OS socket exhaustion during high concurrency load tests
const agent = new http.Agent({ keepAlive: true, maxSockets: 500 });

async function runTest(volume, endpoint) {
    const startTime = Date.now();
    const requests = [];

    for (let i = 0; i < volume; i++) {
        requests.push(new Promise((resolve) => {
            const reqStart = Date.now();
            http.get({
                hostname: 'localhost',
                port: endpoint.port,
                path: endpoint.path,
                agent: agent
            }, (res) => {
                res.on('data', () => { }); // Consume data
                res.on('end', () => {
                    resolve({ time: Date.now() - reqStart, status: res.statusCode });
                });
            }).on('error', (err) => {
                resolve({ time: null, error: err.message });
            });
        }));
    }

    const results = await Promise.all(requests);
    const endTime = Date.now();

    // Considering 200 and 404 (if table 1 doesn't exist) as valid responses
    const validResults = results.filter(r => r.time !== null && (r.status === 200 || r.status === 404));
    const avgLatency = validResults.length > 0 ? (validResults.reduce((a, b) => a + b.time, 0) / validResults.length).toFixed(2) : 0;
    const totalTime = endTime - startTime;
    const successRate = ((validResults.length / volume) * 100).toFixed(2);

    return {
        name: endpoint.name,
        target: `Port ${endpoint.port}`,
        path: endpoint.path,
        totalTime,
        avgLatency,
        successRate: `${successRate}%`,
        valid: validResults.length
    };
}

async function main() {
    console.log('=====================================================');
    console.log('🚀 FULLSTACK SYSTEM LOAD TEST (Backend API & Frontend Web)');
    console.log('=====================================================\n');

    const volumes = [
        { label: 'Low Volume (10 reqs)', count: 10 },
        { label: 'Medium Volume (50 reqs)', count: 50 },
        { label: 'High Volume Burst (150 reqs)', count: 150 }
    ];

    for (const vol of volumes) {
        console.log(`\n--- Running Phase: ${vol.label} ---`);
        console.table(
            await Promise.all(endpoints.map(ep => runTest(vol.count, ep)))
        );
    }

    console.log('\n✅ Testing Complete.');
    process.exit(0);
}

// Ensure both Frontend and Backend are running before testing
const checkBackend = http.get('http://localhost:5000/api/health', () => {
    const checkFrontend = http.get('http://localhost:3000/', () => {
        main();
    }).on('error', () => {
        console.error('Error: Frontend server is not running on http://localhost:3000');
        console.log('Please make sure your Next.js app is running.');
        process.exit(1);
    });
}).on('error', () => {
    console.error('Error: Backend server is not running on http://localhost:5000');
    process.exit(1);
});
