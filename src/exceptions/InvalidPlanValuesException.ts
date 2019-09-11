import HttpException from "./HttpException";

class InvalidPlanValuesException extends HttpException {
    constructor() {
        super(400, 'Values provided are not valid to create new plan');
    }
}

export default InvalidPlanValuesException;
