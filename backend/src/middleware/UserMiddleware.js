import Data from "../common/data/Data.js";
import Tokens from "../common/tools/Tokens.js";
import UserModel from "../model/UserModel.js";

class UserMiddleware {

    /**
     * This method checks if the body fields are present in the request for the modification.
     * It also checks the following prerequisites.
     * - password and confirmPassword matches.
     * - Login provided is not already in use.
     * - Mail provided is not already in use.
     *
     * @param req request provided.
     * @param res response to send.
     * @param next next handler to call.
     * @returns {Promise<*>}
     */
    static async hasValidRegisterFields(req, res, next) {
        let body = req.body
        if ((!body.firstname
            || !body.lastname
            || !body.mail
            || !body.login
            || !body.password
            || !body.confirmPassword)
        ) {
            return res.status(400)
                      .send(Data.ANSWERS.ERRORS_400.MISSING_FIELDS);
        } else if (body.password !== body.confirmPassword) {    // We check if the passwords match.
            return res.status(400)
                      .send(Data.ANSWERS.ERRORS_400.PASSWORD_DONT_MATCH);
        }
        // We check if login was already used :
        let user = await UserModel.getUserByLogin(body.login);
        if(user !== null) {
            return res.status(400)
                      .send(Data.ANSWERS.ERRORS_400.LOGIN_ALREADY_USED);
        }

        // We check if mail was already used :
        user = await UserModel.getUserByMail(body.mail);
        if(user !== null) {
            return res.status(400)
                      .send(Data.ANSWERS.ERRORS_400.MAIL_ALREADY_USED);
        }

        return next();
    }

    /**
     * This method checks if the current user has the permission to delete the user identified by the user ID provided.
     *
     * @param req request provided.
     * @param res response to send.
     * @param next next handler to call.
     * @returns {Promise<*>}
     */
    static async hasPermissionToDelete(req, res, next) {
        let userID = Number(await Tokens.getUserIdFromToken(await Tokens.getAuthTokenFromHeader(req)));
        let userIDToDelete = Number(req.params.id);

        if(userID !== userIDToDelete) {
            return res.status(401)
                      .send(Data.ANSWERS.ERRORS_401.INSUFFICIENT_PERMS)
        }
        return next();
    }

    /**
     * This method checks if the ID of the user is present in the parameters of the request.
     *
     * @param req request provided.
     * @param res response to send.
     * @param next next handler to call.
     * @returns {Promise<*>}
     */
    static async hasValidDeletionParams(req, res, next) {
        if (!req.params.id) {
            return res.status(400)
                      .send(Data.ANSWERS.ERRORS_400.MISSING_FIELDS);
        }
        return next();
    }

    /**
     * This method checks if the body fields are present in the request for the modification.
     * It also checks the following prerequisites.
     * - password and confirmPassword matches.
     * - Login provided is not already in use.
     * - Mail provided is not already in use.
     *
     * @param req request provided.
     * @param res response to send.
     * @param next next handler to call.
     * @returns {Promise<*>}
     */
    static async hasValidModificationFields(req, res, next) {
        let body = req.body
        // We check if there are at least some fields provided.
        if ((!body.firstname
            && !body.lastname
            && !body.mail
            && !body.login
            && !body.password
            && !body.confirmPassword)
        ) {
            return res.status(400)
                      .send(Data.ANSWERS.ERRORS_400.NO_FIELDS);
        }

        // If a password is provided, we check that the confirmPassword is also provided.
        // We also check if both values match.
        if (body.password && !body.confirmPassword) {
            return res.status(400)
                      .send(Data.ANSWERS.ERRORS_400.MISSING_FIELDS);
        } else if (body.password !== body.confirmPassword) {
            return res.status(400)
                      .send(Data.ANSWERS.ERRORS_400.PASSWORD_DONT_MATCH);
        }

        // If unique fields were provided, we check that they are not used in DB.
        if (body.mail) {
            if (await UserModel.getUserByMail(body.mail) !== null) {
                return res.status(400)
                          .send(Data.ANSWERS.ERRORS_400.MAIL_ALREADY_USED);
            }
        }
        if (body.login) {
            if (await UserModel.getUserByLogin(body.login) !== null) {
                return res.status(400)
                          .send(Data.ANSWERS.ERRORS_400.LOGIN_ALREADY_USED);
            }
        }

        return next();
    }
}


export default UserMiddleware