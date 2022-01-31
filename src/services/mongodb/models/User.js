import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 0
    }
    //this role is imp in user 
    //it means if it is admin user they'll have role 1 and if its a normal user they'll have role 0
    //this is for role based authentication
})


const User = mongoose.model("User", UserSchema)

export default User