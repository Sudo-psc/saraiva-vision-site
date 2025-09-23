// CORS configuration for API endpoints
export const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
        ? 'https://saraivavision.com.br'
        : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': 'true'
};

export const setCorsHeaders = (res) => {
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
};

export default corsHeaders;