import HttpException from "./HttpException";

class UserWithEmailOrLoginAlreadyExistsException extends HttpException {
    constructor() {
        super(404, 'User with login or email already exists');
    }
}

export default UserWithEmailOrLoginAlreadyExistsException;
