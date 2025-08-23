import mongoose from "mongoose";
const {Schema, models, model} = mongoose;

const UserSchema = new Schema({
    email: {type: String, required: true},
    name: {type: String},
    username: {type: String, required: true},    
    profilepic: {type: String},
    coverpic: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    razorpayid:{type: String},
    razorpaysecret:{type: String},
})


export default models.User || model("User", UserSchema);