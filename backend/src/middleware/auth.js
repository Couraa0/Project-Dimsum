const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Cek Admin lama atau User yang baru
        let account = await Admin.findById(decoded.id).select('-password');
        if (!account) account = await User.findById(decoded.id).select('-password');

        if (!account || !account.isActive) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token or inactive account' });
        }
        
        req.account = account;
        req.admin = account; // Kompatibilitas mundur
        req.user = account;  // Route pengguna baru
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token invalid or expired' });
    }
};

exports.restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.account.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }
    next();
};
