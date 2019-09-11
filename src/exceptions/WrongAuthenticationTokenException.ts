import HttpException from "./HttpException";

class WrongAuthenticationTokenException extends HttpException {
    constructor() {
        super(401, `Failed to authorize`);
    }
}

export default WrongAuthenticationTokenException;

