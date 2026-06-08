const prisma = require('../utils/prisma');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// =======================
// AUTH METHODS
// =======================

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Harap lengkapi semua field' });
        
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                id: uuidv4(),
                name,
                email,
                password: hashedPassword,
                role: 'user'
            }
        });

        const userResponse = { ...user };
        delete userResponse.password;

        const token = signToken(user.id);
        res.status(201).json({ success: true, token, user: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const accountId = req.admin ? req.admin.id : (req.user ? req.user.id : null);
        if (!accountId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        let user = await prisma.user.findUnique({ where: { id: accountId } });
        if (!user) {
            user = await prisma.admin.findUnique({ where: { id: accountId } });
        }

        if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        const userResponse = { ...user };
        delete userResponse.password;

        res.json({ success: true, user: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Email atau password salah' });
        }
        
        if (!user.isActive) return res.status(401).json({ success: false, message: 'Akun dinonaktifkan' });

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        const userResponse = { ...updated };
        delete userResponse.password;

        const token = signToken(user.id);
        res.json({ success: true, token, user: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ success: false, message: 'Google Token ID diperlukan' });

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: uuidv4(),
                    name,
                    email,
                    googleId: sub,
                    avatar: picture || '',
                    role: 'user',
                    lastLogin: new Date()
                }
            });
        } else {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: sub,
                    avatar: picture || user.avatar,
                    lastLogin: new Date()
                }
            });
        }

        const userResponse = { ...user };
        delete userResponse.password;

        const token = signToken(user.id);
        res.json({ success: true, token, user: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Google authentication failed: ' + err.message });
    }
};

// =======================
// MANAGEMENT CRUD METHODS
// =======================

exports.getAll = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        
        const formattedUsers = users.map(user => {
            const formatted = { ...user };
            delete formatted.password;
            return formatted;
        });
        res.json({ success: true, data: formattedUsers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role }
        });
        
        const formatted = { ...user };
        delete formatted.password;
        res.json({ success: true, data: formatted });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'User berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
