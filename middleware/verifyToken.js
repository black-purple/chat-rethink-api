import jwt from 'jsonwebtoken';
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Access token missing' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            console.error('JWT verification error:', error);
            return res.status(401).json({ message: 'Unauthorized: Invalid access token' });
        }

        req.user = decoded; // Attach decoded user information to the request object
        next(); // Allow the request to proceed
    });
}

export { verifyJWT }