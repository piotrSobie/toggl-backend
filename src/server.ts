import validateEnv from "./utils/validateEnv";
import App from './app';
import AuthenticationController from "./authentication/authentication.controller";
import PlansController from "./plans/plans.controller";
import UserController from "./users/user.controller";


validateEnv();

const app = new App(
    [
        new AuthenticationController(),
        new UserController(),
        new PlansController()
    ]
);

app.listen();
