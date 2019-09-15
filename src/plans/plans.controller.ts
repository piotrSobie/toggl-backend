import * as express from 'express';
import Controller from "../interfaces/controller.interface";
import PlanModel from './plan.model';
import PlanInterface from './plan.interface';
import authMiddleware from "../middleware/auth.middleware";
import RequestWithUser from '../interfaces/request-with-user.interface';
import InvalidPlanValuesException from "../exceptions/invalid-plan-values.exception";
import InternalServerException from "../exceptions/internal-server.exception";
import InvalidUpdatesException from "../exceptions/invalid-updates.exception";

class PlansController implements Controller{
    public path = '/plans';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/create`, authMiddleware, this.createPlan);
        this.router.get(`${this.path}/all`, authMiddleware, this.getAllPlans);
        this.router.get(`${this.path}/get/:id`, authMiddleware, this.getPlanById);
        this.router.patch(`${this.path}/edit/:id`, authMiddleware, this.editPlan);
        this.router.delete(`${this.path}/delete/:id`, authMiddleware, this.deletePlan);
    }

    private createPlan = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        const plan: PlanInterface = new PlanModel({
            ...request.body,
            owner: request.user._id
        });

        try {
            await plan.save();
            response.status(201).send(plan);
        } catch (e) {
            next(new InvalidPlanValuesException());
        }
    };

    private getAllPlans = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        try {
            await request.user.populate('usersPlans').execPopulate();
            response.send(request.user.usersPlans);
        } catch (e) {
            next(new InternalServerException());
        }
    };

    private getPlanById = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        const _id = request.params.id;
        try {
            const plan: PlanInterface = await PlanModel.findOne({ _id, owner: request.user._id });

            if (!plan) {
                return response.status(404).send();
            }

            response.send(plan);

        } catch (e) {
            next(new InternalServerException());
        }
    };

    private editPlan = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        const updates = Object.keys(request.body);
        const allowedUpdates = ['additionalWishes'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            next(new InvalidUpdatesException());
        } else {
            try {
                const plan: PlanInterface = await PlanModel.findOne({ _id: request.params.id, owner: request.user._id });

                if (!plan) {
                    return response.status(404).send();
                }

                updates.forEach((update) => plan[update] = request.body[update]);
                await plan.save();
                response.send(plan);
            } catch (e) {
                response.status(400).send(e);
            }
        }
    };

    private deletePlan = async (request: RequestWithUser, response: express.Response, next: express.NextFunction) => {
        try {
            const plan: PlanInterface = await PlanModel.findOneAndDelete({ _id: request.params.id, owner: request.user._id });

            if (!plan) {
                return response.status(404).send();
            }

            response.send(plan);
        } catch (e) {
            next(new InternalServerException())
        }
    };
}

export default PlansController;
