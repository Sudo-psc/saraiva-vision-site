// CORS configuration for API endpoints
const allowedOrigins = [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br'
];

export const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
        ? 'https://saraivavision.com.br'
        : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': 'true'
};

export const setCorsHeaders = (req, res) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV !== 'production') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://saraivavision.com.br');
    }

    res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
    res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
    res.setHeader('Access-Control-Max-Age', corsHeaders['Access-Control-Max-Age']);
    res.setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials']);
};

export default corsHeaders;