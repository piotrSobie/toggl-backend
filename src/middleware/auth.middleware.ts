import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as jwt_decode from 'jwt-decode';
import User from '../users/user.model';
import DataStoredInTokenInterface from "../interfaces/data-stored-in-token.interface";
import RequestWithUser from '../interfaces/request-with-user.interface';
import WrongAuthenticationTokenException from "../exceptions/wrong-authentication-token.exception";
import InternalServerException from "../exceptions/internal-server.exception";


async function authMiddleware(request: RequestWithUser, response: express.Response, next: express.NextFunction) {
    const authToken = request.header('Authorization').replace('Bearer ', '');
    const decodedToken = jwt_decode(authToken);

    if (new Date().getTime() < decodedToken.exp*1000) {
        //auth token is not expired
        const user = await User.findOne({ _id: decodedToken._id, 'tokens.token': authToken });
        if (!user) {
            next(new WrongAuthenticationTokenException());
        } else {
            request.token = authToken;
            request.user = user;
            next();
        }
    } else {
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
            request.newAuthToken = newAuthToken;
            request.user = user;
            next();
        } else {
            //refresh token is expired
            next(new WrongAuthenticationTokenException());
        }
    }


    // try {
    //     const token = request.header('Authorization').replace('Bearer ', '');
    //     const verificationResponse = jwt.verify(token, process.env.JWT_SECRET) as DataStoredInTokenInterface;
    //     const user = await User.findOne({ _id: verificationResponse._id, 'tokens.token': token });
    //
    //     if (!user) {
    //         next(new WrongAuthenticationTokenException());
    //     } else {
    //         request.token = token;
    //         request.user = user;
    //         next();
    //     }
    // } catch (e) {
    //     next(new WrongAuthenticationTokenException());
    // }
}

export default authMiddleware;
