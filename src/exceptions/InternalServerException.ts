import HttpException from "./HttpException";

class InternalServerException extends HttpException {
    constructor() {
        super(500, 'Internal server exception');
    }
}

export default InternalServerException;
