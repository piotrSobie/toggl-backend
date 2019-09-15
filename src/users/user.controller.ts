import * as express from 'express';
import Controller from "../interfaces/controller.interface";
import RequestWithUser from "../interfaces/request-with-user.interface";
import authMiddleware from "../middleware/auth.middleware";
import InternalServerException from "../exceptions/internal-server.exception";
import InvalidUpdatesException from "../exceptions/invalid-updates.exception";
import HttpException from "../exceptions/http.exception";

class UserController implements Controller{
    public path = '/user';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }


    private initializeRoutes() {
        this.router.get(`${this.path}/me`, authMiddleware, this.getUserProfile);
        this.router.patch(`${this.path}/edit`, authMiddleware, this.updateUser);
        this.router.delete(`${this.path}/delete`, authMiddleware, this.deleteUser);
    }

    private getUserProfile = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        response.send(request.user);
    };

    private updateUser = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        const updates = Object.keys(request.body);
        const allowedUpdates = ['email', 'password', 'location'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            next(new InvalidUpdatesException());
        } else {
            try {
                updates.forEach((update) => request.user[update] = request.body[update]);
                await request.user.save();
                response.send(request.user);
            } catch (e) {
                next(new HttpException(400, e));
            }
        }
    };

    private deleteUser = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        try {
            await request.user.remove();
            response.send(request.user);
        } catch (e) {
            next(new InternalServerException());
        }
    };
}

export default UserController;
