import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import DataStoredInToken from "../interfaces/DataStoredInToken";
import User from '../users/user.model';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";


async function authMiddleware(request: RequestWithUser, response: express.Response, next: express.NextFunction) {
    const cookies = request.cookies;
    if (cookies && cookies.Authorization) {
        const secret = process.env.JWT_SECRET;
        try {
            const verificationResponse = jwt.verify(cookies.Authorization, secret) as DataStoredInToken;
            const id = verificationResponse._id;
            const user = await User.findById(id);
            if (user) {
                request.user = user;
                next();
            } else {
                next(new WrongAuthenticationTokenException());
            }
        } catch (e) {
            next(new WrongAuthenticationTokenException());
        }
    } else {
        next(new WrongAuthenticationTokenException());
    }
}

export default authMiddleware;
