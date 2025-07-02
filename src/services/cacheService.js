const redis = require('redis');
const { promisify } = require('util');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    this._client.connect(); 

    this.getAsync = promisify(this._client.get).bind(this._client);
    this.setAsync = promisify(this._client.set).bind(this._client);
    this.delAsync = promisify(this._client.del).bind(this._client);
  }

  async set(key, value, expirationInSecond = 30 * 60) {
    await this.setAsync(key, value, 'EX', expirationInSecond);
  }

  async get(key) {
    const result = await this.getAsync(key);
    return result === null ? null : result;
  }

  async delete(key) {
    return this.delAsync(key);
  }
}

module.exports = new CacheService();