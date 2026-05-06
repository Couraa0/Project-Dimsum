const http = require('http');

async function runTest(volume, name) {
    console.log(`\n--- Running Test: ${name} (${volume} requests) ---`);
    const startTime = Date.now();
    const requests = [];

    for (let i = 0; i < volume; i++) {
        requests.push(new Promise((resolve) => {
            const reqStart = Date.now();
            http.get('http://localhost:5000/api/health', (res) => {
                res.on('data', () => {}); // Consume data
                res.on('end', () => {
                    resolve(Date.now() - reqStart);
                });
            }).on('error', (err) => {
                console.error(`Request ${i} failed:`, err.message);
                resolve(null);
            });
        }));
    }

    const results = await Promise.all(requests);
    const endTime = Date.now();
    
    const validResults = results.filter(r => r !== null);
    const avgLatency = (validResults.reduce((a, b) => a + b, 0) / validResults.length).toFixed(2);
    const totalTime = endTime - startTime;

    console.log(`Total Time: ${totalTime}ms`);
    console.log(`Average Latency: ${avgLatency}ms`);
    console.log(`Success Rate: ${(validResults.length / volume * 100).toFixed(2)}%`);
}

async function main() {
    console.log('Starting Serverless API Load Testing Simulation...');
    
    // Test Case 1: Low Volume (Concurrent)
    await runTest(10, 'Low Volume');
    
    // Test Case 2: Medium Volume
    await runTest(50, 'Medium Volume');
    
    // Test Case 3: High Volume (Simulating burst)
    await runTest(200, 'High Volume Burst');

    console.log('\nTesting Complete.');
}

const checkServer = http.get('http://localhost:5000/api/health', () => {
    main();
}).on('error', () => {
    console.error('Error: Backend server is not running on http://localhost:5000');
    console.log('Please run "npm run dev" in the backend folder first.');
    process.exit(1);
});
