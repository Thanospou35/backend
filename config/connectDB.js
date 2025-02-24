import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

if(!process.env.MONGODB_URI){
    throw new Error(
        'Please provide MONGODB_URI in the .env file'
    );
}

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connexion avec la base de données MongoDB reussit");
        
    } catch (error) {
        console.error("Erreur lors de laa connexion à MongoDB", error);
        process.exit(1);
    }
}

export default connectDB;