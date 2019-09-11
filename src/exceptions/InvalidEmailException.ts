import HttpException from "./HttpException";

class InvalidEmailException extends HttpException {
    constructor() {
        super(400, 'Email is invalid');
    }
}

export default InvalidEmailException;
