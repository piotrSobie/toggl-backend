import HttpException from "./http.exception";

class InvalidUpdatesException extends HttpException {
    constructor() {
        super(400, 'Invalid updates');
    }
}

export default InvalidUpdatesException;
