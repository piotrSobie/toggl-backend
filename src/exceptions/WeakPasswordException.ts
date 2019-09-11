import HttpException from "./HttpException";

class WeakPasswordException extends HttpException {
    constructor() {
        super(
            400,
            'Password should be at least 8 characters long and contain one of each characters: ' +
            'lowercase character, uppercase character, number and special character'
        );
    }
}

export default WeakPasswordException;
