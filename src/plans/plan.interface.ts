import * as mongoose from 'mongoose';

interface PlanInterface extends mongoose.Document{
    _id: string;
    type?: string;
    price?: string;
    description?: string;
    startTime?: string;
    finishTime?: string;
    additionalWishes?: string;
    owner?: string;

    save();
}

export default PlanInterface;
