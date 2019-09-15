import HttpException from "./http.exception";

class WrongAuthenticationTokenException extends HttpException {
    constructor() {
        super(401, `Failed to authorize`);
    }
}

export default WrongAuthenticationTokenException;

