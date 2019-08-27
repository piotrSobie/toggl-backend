import * as mongoose from 'mongoose';
import * as validator from 'validator';
import * as bcrypt from 'bcrypt';
import WrongCredentialsException from "../exceptions/WrongCredentialsException";

const userSchema = new mongoose.Schema({
    login: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password should not contain password string');
            }
        }
    }
});

userSchema.statics.findByCredentials = async (login, password) => {
    const user = await User.findOne({ login });
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

const User = mongoose.model('User', userSchema);

export default User;
