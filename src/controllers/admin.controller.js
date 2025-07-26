import Admin from '../models/admin.model.js';
import { BaseController } from './base.controller.js';
import crypto from '../utils/Crypto.js';
import token from '../utils/Token.js';
import config from '../config/index.js';
import { AppError } from '../error/AppError.js';
import { successRes } from '../utils/success-res.js';

class AdminController extends BaseController {
    constructor() {
        super(Admin);
    }

    async createAdmin(req, res, next) {
        try {
            const { error } = validator.create(req.body);
            if (error) {
                throw new AppError('Error input validation', 422);
            }

            console.log('request body: ', req.body);
            const { username, email, password, hashedPassword } = req.body;
            const adminPass = password || hashedPassword;
            if (!adminPass) {
                throw new AppError("parol yo'q", 400);
            }
            const existsUsername = await Admin.findOne({ username });
            if (existsUsername) {
                throw new AppError('Username already exists', 409);
            }
            const existsEmail = await Admin.findOne({ email });
            if (existsEmail) {
                throw new AppError('Email adress already exists', 409);
            }
            const hashedPass = await crypto.encrypt(adminPass);
            const admin = await Admin.create({
                username,
                email,
                hashedPassword: hashedPass
            });
            return successRes(res, admin, 201)
        } catch (error) {
            next(error);
        }
    }

    async signIn(req, res, next) {
        try {
            const { error } = validator.signin(req.body);
            if (error) {
                throw new AppError(error?.details[0]?.message ?? 'Error input validation', 422);
            }

            const { username, password } = req.body;
            const admin = await Admin.findOne({ username });
            const isMatchPassword = await crypto.decrypt(password, admin?.hashedPassword ?? '');
            if (!isMatchPassword) {
                throw new AppError('Username or password incorrect', 400);
            }

            const payload = {
                id: admin._id,
                role: admin.role,
                isActive: admin.isActive
            };
            const accessToken = token.generateAccessToken(payload);
            const refreshToken = token.generateRefreshToken(payload);
            token.writeToCookies(res, 'refreshTokenAdmin', refreshToken, 30);

            return successRes(res, {
                token: accessToken,
                admin
            });
        } catch (error) {
            next(error);
        }
    }

    async generateNewToken(req, res) {
        try {
            const refreshToken = req.cookies?.refreshTokenAdmin;
            if (!refreshToken) {
                throw new AppError('Refresh token not found', 401);
            }
            const verifiedToken = token.verifyToken(refreshToken, config.TOKEN.REFRESH_KEY);
            if (!verifiedToken) {
                throw new AppError('Refresh token expire', 401);
            }
            const admin = await Admin.findById(verifiedToken?.id);
            if (!admin) {
                throw new AppError('Forbidden user', 403);
            }
            const payload = {
                id: admin._id, role: admin.role, isActive: admin.isActive
            }
            const accessToken = token.generateAccessToken(payload);
            return successRes(res, {
                token: accessToken,
                admin
            });
        } catch (error) {
            next(error);
        }
    }

    async signOut(req, res) {
        try {
            const refreshToken = req.cookies?.refreshTokenAdmin;
            if (!refreshToken) {
                throw new AppError('Refresh token not found', 401);
            }
            const verifiedToken = token.verifyToken(refreshToken, config.TOKEN.REFRESH_KEY);
            if (!verifiedToken) {
                throw new AppError('Refresh token expire', 401);
            }
            const admin = await Admin.findById(verifiedToken?.id);
            if (!admin) {
                throw new AppError('Forbidden user', 403);
            }
            res.clearCookie('refreshTokenAdmin');
            return successRes(res, {});
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();