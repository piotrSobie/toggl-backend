import HttpException from "./http.exception";

class InvalidEmailException extends HttpException {
    constructor() {
        super(400, 'Email is invalid');
    }
}

export default InvalidEmailException;
