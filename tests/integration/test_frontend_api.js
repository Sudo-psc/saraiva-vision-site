const axios = require('axios');

describe('Frontend to API Communication', () => {
  it('should be able to fetch data from the API', async () => {
    // This test assumes the frontend container can resolve and connect to the API container at 'http://api:3001'
    // We will test this by making a request from the frontend container to the API container
    // This requires running the test inside the frontend container or having a proxy setup
    const response = await axios.get('http://localhost:3001/api/reviews');
    expect(response.status).toBe(200);
  });
});
