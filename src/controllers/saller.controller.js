import Saller from '../models/saller.model.js';
import { BaseController } from './base.controller.js';
import crypto from '../utils/Crypto.js';
import { AppError } from '../error/AppError.js';
import { successRes } from '../utils/success-res.js';
import token from '../utils/Token.js';
import config from '../config/index.js';

class SallerController extends BaseController {
    constructor() {
        super(Saller, ['products']);
    }

    async createSaller(req, res, next) {
        try {
            const { phoneNumber, email, password } = req.body;
            const existsPhone = await Saller.findOne({ phoneNumber });
            if (existsPhone) {
                throw new AppError('Phone number already exists', 409);
            }
            const existsEmail = await Saller.findOne({ email });
            if (existsEmail) {
                throw new AppError('Email address already exists', 409);
            }
            const hashedPassword = await crypto.encrypt(password);
            delete req.body.password;
            const saller = await Saller.create({
                ...req.body,
                hashedPassword,
                image: req?.file?.filename ?? ''
            });
            return successRes(res, saller, 201);
        } catch (error) {
            next(error);
        }
    }

    async signIn(req, res, next) {
        try {
            const { phoneNumber, password } = req.body;
            const saller = await Saller.findOne({ phoneNumber });
            const isMatchPassword = await crypto.decrypt(password, saller?.hashedPassword ?? '');
            if (!isMatchPassword) {
                throw new AppError('Phone number or password incorrect', 400);
            }
            const payload = {
                id: saller._id, role: saller.role, isActive: saller.isActive
            };
            const accessToken = token.generateAccessToken(payload);
            const refreshToken = token.generateRefreshToken(payload);
            token.writeToCookie(res, 'refreshTokenSaller', refreshToken, 30);
            return successRes(res, {
                token: accessToken,
                saller
            });
        } catch (error) {
            next(error);
        }
    }

    async generateNewToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshTokenSaller;
            if (!refreshToken) {
                throw new AppError('Authorization error', 401);
            }
            const verifiedToken = token.verifyToken(refreshToken, config.TOKEN.REFRESH_KEY);
            if (!verifiedToken) {
                throw new AppError('Refresh token expired', 401);
            }
            const saller = await Saller.findById(verifiedToken?.id);
            if (!saller) {
                throw new AppError('Forbidden user', 403);
            }
            const payload = {
                id: saller._id, role: saller.role, isActive: saller.isActive
            };
            const accessToken = token.generateAccessToken(payload);
            return successRes(res, {
                token: accessToken
            });
        } catch (error) {
            next(error);
        }
    }

    async signOut(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshTokenSaller;
            if (!refreshToken) {
                throw new AppError('Refresh token not found', 401);
            }
            const verifiedToken = token.verifyToken(refreshToken, config.TOKEN.REFRESH_KEY);
            if (!verifiedToken) {
                throw new AppError('Refresh token expired', 401);
            }
            const saller = await Saller.findById(verifiedToken?.id);
            if (!saller) {
                throw new AppError('Forbidden user', 403);
            }
            res.clearCookie('refreshTokenSaller');
            return successRes(res, {});
        } catch (error) {
            next(error);
        }
    }
}

export default new SallerController();