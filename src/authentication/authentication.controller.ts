import * as express from 'express';
import * as jwt from 'jsonwebtoken'
import Controller from "../interfaces/controller.interface";
import User from "../users/user.model";
import TokenData from "../interfaces/TokenData";
import DataStoredInToken from "../interfaces/DataStoredInToken";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import UserWithEmailOrLoginAlreadyExistsException from "../exceptions/UserWithEmailOrLoginAlreadyExistsException";

class AuthenticationController implements Controller {
    public path = '/auth';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.registerUser);
        this.router.post(`${this.path}/login`, this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
    }

    private registerUser = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const user = new User(request.body);

        try {
            await user.save();
            user.password = undefined;
            const tokenData = AuthenticationController.createToken(user);
            response.setHeader('Set-Cookie', [AuthenticationController.createCookie(tokenData)]);
            response.status(201).send({ user });
        } catch (e) {
            next(new UserWithEmailOrLoginAlreadyExistsException());
        }
    };

    private loggingIn = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        try {
            const user = await User.findByCredentials(request.body.login, request.body.password);
            user.password = undefined;
            const tokenData = AuthenticationController.createToken(user);
            response.setHeader('Set-Cookie', [AuthenticationController.createCookie(tokenData)]);
            response.send(user);
        } catch (e) {
            next(new WrongCredentialsException());
        }
    };

    private loggingOut = (request: express.Request, response: express.Response) => {
        response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
        response.send(200);
    };

    private static createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    private static createToken(user): TokenData {
        const expiresIn = 60 * 60;
        const secret = process.env.JWT_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id
        };

        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn })
        }
    }
}

export default AuthenticationController;
