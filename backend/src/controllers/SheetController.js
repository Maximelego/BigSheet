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
    static async getSharedToCurrentUser(res, req) {
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
        let sheet = await SheetModel.create();
        let user = await UserModel.getById(userID);
        await sheet.addUser(user);      // TODO : Wrong number of args
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
        await sheet.save();
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
        console.log(Params.getRequestParams(res).sheetID)
        return res.send(await SheetModel.getById(2));
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

        await sheet.removeUser(user);       // TODO : function is undefined
        await sheet.save();
        return res.send(Data.ANSWERS.DEFAULT.DEFAULT_OK_ANSWER);
    }
}

export default SheetController;
