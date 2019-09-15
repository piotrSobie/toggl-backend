import * as mongoose from 'mongoose';
import { Request } from 'express';
import UserInterface from '../users/user.interface';

interface RequestWithUser extends Request {
    user: UserInterface & mongoose.Document;
    token: string;
    newAuthToken: string;
}

export default RequestWithUser;
