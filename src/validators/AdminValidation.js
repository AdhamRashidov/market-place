import Joi from "joi";

class AdminValidator {
    static passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    create() {
        return Joi.object({
            username: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().pattern(AdminValidator.passwordRegex).required()
        });
    }

    signin() {
        return Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
        });
    }

    update() {
        return Joi.object({
            username: Joi.string().optional(),
            email: Joi.string().optional(),
            password: Joi.string().pattern(AdminValidator.passwordRegex).optional()
        });
    }
}

export default new AdminValidator();