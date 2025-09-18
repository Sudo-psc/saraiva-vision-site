const axios = require('axios');

describe('Nginx Health Check', () => {
  it('should return a 200 OK response from the health check endpoint', async () => {
    const response = await axios.get('http://localhost/health');
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('healthy');
  });
});
