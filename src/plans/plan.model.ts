import * as mongoose from 'mongoose';
import PlanInterface from './plan.interface';

const planSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    finishTime: {
        type: String,
        required: true
    },
    additionalWishes: {
        type: String
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    }
});

const Plan = mongoose.model<PlanInterface & mongoose.Document>('Plan', planSchema);

export default Plan;
