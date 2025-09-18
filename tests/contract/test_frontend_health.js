const axios = require('axios');

describe('Frontend Health Check', () => {
  it('should return a 200 OK response from the health check endpoint', async () => {
    const response = await axios.get('http://localhost:3002/health');
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('healthy');
  });
});
