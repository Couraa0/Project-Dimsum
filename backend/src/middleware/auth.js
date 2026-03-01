const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin || !admin.isActive) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }
        req.admin = admin;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token invalid or expired' });
    }
};

exports.restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }
    next();
};
