import mongoose from "mongoose";
const connectDB = async () =>{
    try{
        const conn = await mongoose.connect("mongodb+srv://admin:admin@cluster0.3g3xopo.mongodb.net/chai");
        console.log(`MongoDB Atlas Connected`);
    }catch(error){
        console.log(error.message);
        process.exit(1);
    }
}

export default connectDB;