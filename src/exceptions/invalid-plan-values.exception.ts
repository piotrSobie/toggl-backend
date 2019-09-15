import HttpException from "./http.exception";

class InvalidPlanValuesException extends HttpException {
    constructor() {
        super(400, 'Values provided are not valid to create new plan');
    }
}

export default InvalidPlanValuesException;
