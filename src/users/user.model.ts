import * as mongoose from 'mongoose';
import * as validator from 'validator';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'
import Plan from '../plans/plan.model'
import UserInterface from './user.interface';
import DataStoredInToken from "../interfaces/DataStoredInToken";
import TokenData from "../interfaces/TokenData";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import InvalidEmailException from '../exceptions/InvalidEmailException';
import WeakPasswordException from "../exceptions/WeakPasswordException";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new InvalidEmailException();
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
            if (!regex.test(value)) {
                throw new WeakPasswordException();
            }
        }
    },
    location: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    refreshToken: {
        type: String
    }
});

userSchema.virtual('usersPlans', {
    ref: 'Plan',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
};

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const expiresIn = 15;
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
        _id: user._id
    };
    const token = jwt.sign(dataStoredInToken, secret, { expiresIn });
    user.tokens = user.tokens.concat({ token });
    await user.save();
    const tokenData: TokenData = {
        expiresIn,
        token: token
    };
    return tokenData;
};

userSchema.methods.generateRefreshToken = async function() {
    const user = this;
    const expiresIn = "10h";
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
        _id: user._id
    };
    const refreshToken = jwt.sign(dataStoredInToken, secret, { expiresIn });
    user.refreshToken = refreshToken;
    await user.save();
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new WrongCredentialsException();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new WrongCredentialsException();
    }

    return user;
};

userSchema.pre('save', async function generateHash(next) {
   const user = this;
   if (user.isModified('password')) {
       user.password = await bcrypt.hash(user.password, 8);
   }

   next();
});

userSchema.pre('remove', async function deletePlansBeforeDeletingUser(next) {
   const user = this;
   await Plan.deleteMany({ owner: user._id });

   next();
});

const User = mongoose.model<UserInterface & mongoose.Document>('User', userSchema);

export default User;
