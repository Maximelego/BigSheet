import bcrypt from "bcrypt";
import UserModel from "../../model/UserModel.js";

class AuthMiddleware {

    /**
     * Validator for the login request. Check if the mandatory fields are present.
     *
     * @param req Request provided.
     * @param res Response to send.
     * @param next Next method to call.
     * @returns {*}
     */
    static hasValidLoginFields(req, res, next){
        if (!req.body.login || !req.body.password) {
            return res.status(400)
                      .send("Mandatory fields are missing.")
        }
        return next()
    }


    /**
     * This method will provide the hash of the plain text password provided.
     * It will use the bcrypt hash method and a salt that is 10 character long.
     *
     * @param plainTextPassword Password to hash.
     * @returns {Promise<void|*>}
     */
    static async hashPassword(plainTextPassword) {
        return await bcrypt.hash(plainTextPassword, 10);
    }

    /**
     * This method will compare the hash and the plain text password provided?.
     *
     * @param plainTextPassword Password to compare
     * @param hash Hash to compare.
     * @returns {Promise<boolean>} If the password and hash match or not.
     */
    static async comparePassword(plainTextPassword, hash) {
        return await bcrypt.compare(plainTextPassword, hash);
    }

    /**
     * This method checks the credentials provided by the user.
     *
     * @param login Login of the user.
     * @param password Plain text password.
     * @returns {Promise<boolean>} If the user was authenticated or not.
     */
    static async authenticate(login, password) {
        // We find the user that has the login provided.
        let userConcerned = await UserModel.getUserByLogin(login)

        // If no user with this login exists.
        if(userConcerned === null) {
            return false
        }
        // We return the result of password matching.
        return await AuthMiddleware.comparePassword(password, userConcerned.hash)
    }

    static checkTokens(tokens) {

    }


}
export default AuthMiddleware