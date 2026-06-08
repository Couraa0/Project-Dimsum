const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });

        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ success: false, message: 'Email atau password salah' });
        }

        const updated = await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLogin: new Date() }
        });

        const adminResponse = { ...updated };
        delete adminResponse.password;

        const token = signToken(admin.id);
        res.json({ success: true, token, admin: adminResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMe = async (req, res) => {
    const adminResponse = { ...req.admin };
    delete adminResponse.password;
    res.json({ success: true, admin: adminResponse });
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
        if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) {
            return res.status(400).json({ success: false, message: 'Password saat ini salah' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.admin.update({
            where: { id: req.admin.id },
            data: { password: hashedPassword }
        });
        
        res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
