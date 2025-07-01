// src/services/cacheService.js
const redis = require('redis');
const config = require('../utils/config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      host: config.redis.host,
    });

    this._client.on('error', (error) => {
      console.error(error);
    });

    this._client.connect(); // Connect to Redis
  }

  async set(key, value, expirationInSecond = 30 * 60) { // Default 30 minutes
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);
    if (result === null) return null;
    return result;
  }

  async delete(key) {
    return this._client.del(key);
  }
}

module.exports = new CacheService(); // Export an instance
