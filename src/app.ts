import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import Controller from './interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware'

import * as cors from 'cors';

class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();

        App.connectToTheDatabase();
        this.initializeMiddleware();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        });
    }

    private static connectToTheDatabase() {
        const MONGODB_URL = process.env.MONGODB_URL;
        mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true,
            useCreateIndex: true,
            dbName: 'toggl-backend'
        });
    }

    private initializeMiddleware() {
        this.app.use(bodyParser.json());
        this.app.use(cors());
    }

    private initializeControllers(controllers) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }
}

export default App;
