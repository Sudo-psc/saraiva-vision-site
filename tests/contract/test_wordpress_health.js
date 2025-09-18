const axios = require('axios');

describe('WordPress Health Check', () => {
  it('should return a 200 OK response from the health check endpoint', async () => {
    // The WordPress health check is exposed through the Nginx proxy
    const response = await axios.get('http://localhost/wp-json/wp/v2/posts');
    expect(response.status).toBe(200);
  });
});
