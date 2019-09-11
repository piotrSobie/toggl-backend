import * as express from 'express';
import * as jwt_decode from 'jwt-decode';
import User from "../users/user.model";
import Controller from "../interfaces/controller.interface";
import RequestWithUser from "../interfaces/RequestWithUser.interface";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import HttpException from '../exceptions/HttpException';
import InternalServerException from "../exceptions/InternalServerException";
import authMiddleware from "../middleware/auth.middleware";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";

class AuthenticationController implements Controller {
    public path = '/auth';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.registerUser);
        this.router.post(`${this.path}/login`, this.loggingIn);
        this.router.post(`${this.path}/logout`, authMiddleware, this.loggingOut);
        this.router.post(`${this.path}/logout-all`, authMiddleware, this.loggingOutAll);
        this.router.get(`${this.path}/get-new-auth-token`, this.getNewAuthToken);
    }

    private registerUser = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const user = new User(request.body);

        try {
            await user.save();
            const tokenData = await user.generateAuthToken();
            await user.generateRefreshToken();
            response.status(201).send({ user, tokenData });
        } catch (e) {
            next(new HttpException(404, e));
        }
    };

    private loggingIn = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        try {
            const user = await User.findByCredentials(request.body.email, request.body.password);
            const tokenData = await user.generateAuthToken();
            await user.generateRefreshToken();
            response.send({ user, tokenData });
        } catch (e) {
            next(new WrongCredentialsException());
        }
    };

    private loggingOut = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        try {
            request.user.tokens = request.user.tokens.filter((token) => {
                return token.token !== request.token;
            });
            await request.user.save();

            response.send({});
        } catch (e) {
            next(new InternalServerException());
        }
    };

    private loggingOutAll = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        try {
            request.user.tokens = [];
            await request.user.save();
            response.send();
        } catch (e) {
            next(new InternalServerException());
        }
    };

    private getNewAuthToken = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        const authToken = request.header('Authorization').replace('Bearer ', '');
        const decodedToken = jwt_decode(authToken);

        //auth token is expired
        const user = await User.findOne({ _id: decodedToken._id});
        if (!user) {
            next(new WrongAuthenticationTokenException());
        }
        const decodedRefreshToken = jwt_decode(user.refreshToken);

        if (new Date().getTime() < decodedRefreshToken.exp*1000) {
            //refresh token is not expired
            try {
                user.tokens = user.tokens.filter((token) => {
                    return token.token !== authToken;
                });
                await user.save();
            } catch (e) {
                next(new InternalServerException());
            }
            const newAuthToken = await user.generateAuthToken();
            response.send(newAuthToken);
        } else {
            //refresh token is expired
            next(new WrongAuthenticationTokenException());
        }
    }
}

export default AuthenticationController;
