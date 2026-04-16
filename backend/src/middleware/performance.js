/**
 * Performance Monitoring Middleware
 * Tracks execution time and latency for each request.
 */
const performanceMonitor = (req, res, next) => {
    const start = process.hrtime();

    // Listen for the finish event to calculate elapsed time
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
        
        // Log basic metrics
        // In a real serverless environment, you might send this to AWS CloudWatch or Google Cloud Logging
        console.log(`[MONITOR] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Latency: ${timeInMs}ms`);
        
        // You could also attach this to a custom header for the frontend to read
        // res.setHeader('X-Response-Time', `${timeInMs}ms`);
    });

    next();
};

module.exports = performanceMonitor;
