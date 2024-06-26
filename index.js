class RateLimiter {
  constructor(options) {
    this.limit = options.limit || 100; // Max requests allowed
    this.windowMs = options.windowMs || 60000; // Time window in milliseconds
    this.cache = new Map(); // To store client timestamps
    this.trustedClients = options.trustedClients || []; // Trusted clients who can bypass rate limit
  }

  // Method to add a trusted client
  addTrustedClient(clientIP) {
    this.trustedClients.push(clientIP);
  }

  middleware() {
    return (req, res, next) => {
      const key = req.ip; // Use IP address to identify the client
      const now = Date.now();
      const timestamps = this.cache.get(key) || [];

      // If the client is trusted, bypass the rate limit
      if (this.trustedClients.includes(key)) {
        next();
        return;
      }

      // Remove timestamps outside the current window
      while (timestamps.length && timestamps[0] <= now - this.windowMs) {
        timestamps.shift();
      }

      // Check the rate limit
      if (timestamps.length >= this.limit) {
        res.status(429).send('Rate limit exceeded. Please try again later.');
        return;
      }

      // Record the new timestamp
      timestamps.push(now);
      this.cache.set(key, timestamps);
      next();
    };
  }
}

module.exports = RateLimiter;
