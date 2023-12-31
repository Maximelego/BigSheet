import SheetModel from "../model/SheetModel.js";
import Data from "../common/data/Data.js";
import UserModel from "../model/UserModel.js";
import Params from "../middleware/Params.js";

class SheetController {

    /**
     * This method will ask the model to get all sheets owned by connected user.
     * Requires checkAuthToken
     *
     * @param req Request provided. Contains the parameter required in its body.
     * @param res Response to provide.
     * @returns {Promise<void>}
     */
    static async getOwnedByCurrentUser(req, res) {
        // We extract the current user ID from the token.
        let userID = Params.getAddedParams(res).connectedUserID;
        let sheets = await SheetModel.getAllByOwner(userID);
        return res.send(sheets);
    }

    /**
     * This method returns heets shared with the current user.
     * Requires checkAuthToken.
     *
     * @param req Request provided. Contains the parameter required in its body.
     * @param res Response to provide.
     * @returns {Promise<void>}
     */
    static async getSharedToCurrentUser(req, res) {
        // We extract the current user ID from the token.
        let userID = Params.getAddedParams(res).connectedUserID;
        let sheets = await SheetModel.getSharedToUser(userID);
        return res.send(sheets);
    }

    /**
     * This method will ask the model to get all sheets accessible by connected user.
     * Requires checkAuthToken.
     * 
     * @param req Request provided. Contains the parameter required in its body.
     * @param res Response to provide.
     * @returns {Promise<void>}
     */
    static async getAccessibleByCurrentUser(req, res) {
        // We extract the current user ID from the token.
        let userID = Params.getAddedParams(res).connectedUserID;
        let sheets = await SheetModel.getAccessibleByUser(userID);
        return res.send(sheets);
    }

    /**
     * This method will create a sheet.
     * Requires checkAuthToken.
     * 
     * @param req Request provided. Contains the parameters required in its body.
     * @param res Response to provide.
     * @returns {Promise<void>}
     */
    static async createSheet(req, res) {
        // get user connected
        let userID = Params.getAddedParams(res).connectedUserID;
        let body = Params.getRequestParams(res);
        let sheet = await SheetModel.create(body);
        let user = await UserModel.getById(userID);
        await sheet.addUser(user);
        await sheet.save();
        return res.send(sheet);
    }

    /**
     * This method will remove a sheet.
     * Requires Middleware sheetExists.
     * 
     * @param req Request provided. Contains the parameters required in its body.
     * @param res Response to provide.
     * @returns {Promise<void>}
     */
    static async deleteSheet(req, res) {
        let sheet = Params.getAddedParams(res).sheet;
        await sheet.destroy();
        return res.send(Data.ANSWERS.DEFAULT.DEFAULT_OK_ANSWER);
    }

    /**
     * This method will ask the model to get sheet with the good id.
     * Requires Middleware sheetExists.
     * 
     * @param req Request provided. Contains the parameter required in its body.
     * @param res Response to provide.
     * @returns {Promise<void>}
     */
    static async getById(req, res) {
        return res.send(Params.getAddedParams(res).sheet);
    }

    /**
     * This method grant access to a user.
     * Requires Middleware sheetExists userExists.
     * 
     * @param req Request provided. Contains the parameter required in its body.
     * @param res Response to provide.
     * @returns {Promise<void>}
     */
    static async addUser(req, res) {

        let addedParams = Params.getAddedParams(res);

        let user = addedParams.user;
        let sheet = addedParams.sheet;
        let accessRight = Params.getRequestParams(res).access;

        if (accessRight === undefined) {
            accessRight = 'reader';
        }
        // This function is automatically generated by Sequelize.
        await sheet.addUser(user, {
            through: {
                accessRight
            }
        });
        await sheet.save();
        return res.send(Data.ANSWERS.DEFAULT.DEFAULT_OK_ANSWER);
    }

    /**
     * This method removes access to a user.
     * Requires Middleware sheetExists userExists.
     * 
     * @param req Request provided. Contains the parameter required in its body.
     * @param res Response to provide.
     * @returns {Promise<void>}
     */
    static async deleteUser(req, res) {

        let addedParams = Params.getAddedParams(res);
        let user = addedParams.user;
        let sheet = addedParams.sheet;

        // This function is automatically generated by Sequelize.
        await sheet.removeUser(user);
        await sheet.save();
        return res.send(Data.ANSWERS.DEFAULT.DEFAULT_OK_ANSWER);
    }

    /**
     * This method will modify the sheet with the id present in URL request.
     *
     * @param req Request provided. Contains the parameters required in its body.
     * @param res Response to provide.
     * @returns {Promise<void>}
     */
    static async modifySheet(req, res) {
        let body = Params.getRequestParams(res);
        let sheet = Params.getAddedParams(res).sheet;

        // We check the fields of the body, and we apply the necessary modifications.
        if (body.title)  { sheet.title = body.title; }
        if (body.detail)     { sheet.detail = body.detail; }

        await sheet.save();
        return res.send(Data.ANSWERS.DEFAULT.DEFAULT_OK_ANSWER);
    }
}

export default SheetController;
