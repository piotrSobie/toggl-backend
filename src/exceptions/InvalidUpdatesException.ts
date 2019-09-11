import HttpException from "./HttpException";

class InvalidUpdatesException extends HttpException {
    constructor() {
        super(400, 'Invalid updates');
    }
}

export default InvalidUpdatesException;
