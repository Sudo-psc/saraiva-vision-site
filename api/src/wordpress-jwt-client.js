import axios from 'axios';
import jwt from 'jsonwebtoken';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'wordpress-jwt-client' },
  transports: [
    new winston.transports.Console(),
  ],
});

const WORDPRESS_BASE_URL = 'https://cms.saraivavision.com.br';
const JWT_TOKEN_ENDPOINT = `${WORDPRESS_BASE_URL}/wp-json/jwt-auth/v1/token`;
const JWT_VALIDATE_ENDPOINT = `${WORDPRESS_BASE_URL}/wp-json/jwt-auth/v1/token/validate`;

class WordPressJWTClient {
  constructor() {
    this.token = null;
    this.username = process.env.WORDPRESS_ADMIN_USER;
    this.password = process.env.WORDPRESS_ADMIN_PASSWORD;
  }

  async authenticate() {
    try {
      logger.info('Attempting JWT authentication with WordPress');

      const response = await axios.post(JWT_TOKEN_ENDPOINT, {
        username: this.username,
        password: this.password,
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        logger.info('JWT authentication successful');
        return { success: true, token: this.token };
      } else {
        logger.error('JWT authentication failed: No token in response');
        return { success: false, error: 'No token received' };
      }
    } catch (error) {
      logger.error('JWT authentication error:', error.message);
      return { success: false, error: error.message };
    }
  }

  isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      logger.error('Error decoding token:', error.message);
      return true;
    }
  }

  async ensureValidToken() {
    if (!this.token || this.isTokenExpired(this.token)) {
      logger.info('Token is invalid or expired, re-authenticating');
      const authResult = await this.authenticate();
      if (!authResult.success) {
        throw new Error('Failed to authenticate: ' + authResult.error);
      }
    }
  }

  async validateToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await axios.post(JWT_VALIDATE_ENDPOINT, {}, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      logger.error('Token validation error:', error.message);
      return false;
    }
  }

  async makeRequest(method, endpoint, data = null) {
    await this.ensureValidToken();

    const url = `${WORDPRESS_BASE_URL}${endpoint}`;

    try {
      const config = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      };

      if (data && (method === 'post' || method === 'put' || method === 'patch')) {
        config.data = data;
      }

      logger.info(`Making ${method.toUpperCase()} request to ${endpoint}`);
      const response = await axios(config);
      return response.data;
    } catch (error) {
      logger.error(`Request error for ${method.toUpperCase()} ${endpoint}:`, error.message);
      throw error;
    }
  }

  async get(endpoint) {
    return this.makeRequest('get', endpoint);
  }

  async post(endpoint, data) {
    return this.makeRequest('post', endpoint, data);
  }

  async put(endpoint, data) {
    return this.makeRequest('put', endpoint, data);
  }

  async patch(endpoint, data) {
    return this.makeRequest('patch', endpoint, data);
  }

  async delete(endpoint) {
    return this.makeRequest('delete', endpoint);
  }
}

export default WordPressJWTClient;