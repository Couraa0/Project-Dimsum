const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });

        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Email atau password salah' });
        }
        admin.lastLogin = new Date();
        await admin.save({ validateBeforeSave: false });

        const token = signToken(admin._id);
        res.json({ success: true, token, admin: admin.toJSON() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMe = async (req, res) => {
    res.json({ success: true, admin: req.admin });
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.admin._id).select('+password');
        if (!(await admin.comparePassword(currentPassword))) {
            return res.status(400).json({ success: false, message: 'Password saat ini salah' });
        }
        admin.password = newPassword;
        await admin.save();
        res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
