import SocketGestionnary from "./SocketGestionnary.js";
import Tokens from "./Tokens.js";
import { UserAccessSheet } from "../../association/UserAccessSheet.js";

const SOCKET_PROTOCOL = {
    TIMEOUT_WHEN_REPLY_IS_REQUIRED: 5000,
    MESSAGE_TYPE: {
        TO_CLIENT: {
            AUTH_REQUIRED: {
                name: 'authReq',
                replyProcess: requestAuth
            },
            AUTH_REFUSED: {
                name: 'authFail',
                replyProcess: null
            }, 
            AUTH_SUCCESS: {
                name: 'authOk',
                replyProcess: null
            },
            WRITE_CELL: {
                name: 'writeCell',
                replyProcess: null
            }
        },
        FROM_CLIENT: {
            WRITE_CELL: {
                name: 'writeCell',
                checkerArg: writeCellChecker,
                event: writeCellEvent
            }
        }
    }
};

function emitReasonToDisconnect(sock, message) {
    SocketGestionnary.getInstance().emit(sock, message);
    sock.disconnect();
}

function requestAuth(sock) {
    return async (err, response) => {
        // if an error (access not autorized...) disconnect socket
        if (err) {
            emitReasonToDisconnect(sock, SOCKET_PROTOCOL.MESSAGE_TYPE.TO_CLIENT.AUTH_REFUSED);
        } else {
            if (response.token !== undefined && response.sheetId !== undefined) {
                let data = await Tokens.verifyAuthToken(response.token);
                if (data.error !== undefined) {
                    emitReasonToDisconnect(sock, SOCKET_PROTOCOL.MESSAGE_TYPE.TO_CLIENT.AUTH_REFUSED);
                } else {
                    let access = await UserAccessSheet.getAccessByPk(data.userID, response.sheetId);
                    // if user has access to sheet, he joins the room corresponding to corresponding to sheet
                    if (access != null) {
                        sock.join('sheet'+response.sheetId);
                        SocketGestionnary.getInstance().emit(sock, SOCKET_PROTOCOL.MESSAGE_TYPE.TO_CLIENT.AUTH_SUCCESS);
                    } else {
                        emitReasonToDisconnect(sock, SOCKET_PROTOCOL.MESSAGE_TYPE.TO_CLIENT.AUTH_REFUSED);
                    }                            
                }
            } else {
                emitReasonToDisconnect(sock, SOCKET_PROTOCOL.MESSAGE_TYPE.TO_CLIENT.AUTH_REFUSED);
            }
        }
    };
}

function verifyCellCoord(arg) {
    // we verify arg.line is an integer
    if (arg.line === undefined || typeof arg.line !== "number" || !Number.isInteger(arg.line)) {
        return false;
    }
    // we verify arg.column is a string
    if (arg.column === undefined || typeof arg.column !== "string") {
        return false;
    }
    return true;
}
function writeCellChecker(arg) {
    // we verify arg is an object
    if (arg === undefined || typeof arg !== 'object' || Array.isArray(arg)) {
        return false;
    }
    if (!verifyCellCoord(arg)) {
        return false;
    }
    // we verify arg.content is a string
    if (arg.content === undefined || typeof arg.content !== "string") {
        return false;
    }
    return true;
}

function writeCellEvent(sock, arg) {
    SocketGestionnary.getInstance().emitToRoom(sock, SOCKET_PROTOCOL.MESSAGE_TYPE.TO_CLIENT.MODIFY_CELLS, arg);
}

export default SOCKET_PROTOCOL;