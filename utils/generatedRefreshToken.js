import UserModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generatedRefreshToken = async (userId) => {
    try {
        // Vérifier si l'ID utilisateur est valide
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID format");
        }

        // Générer le refreshToken
        const token = jwt.sign(
            { id: userId },
            process.env.SECRET_KEY_REFRESH_TOKEN,
            { expiresIn: '7d' }
        );

        // Conversion explicite en ObjectId
        const objectId = new mongoose.Types.ObjectId(userId);

        // Mettre à jour le champ `refresh_token` dans la base de données
        const updateResult = await UserModel.updateOne(
            { _id: objectId }, // Utiliser ObjectId ici
            { refresh_token: token }
        );

        // Vérifier si la mise à jour a réussi
        if (updateResult.matchedCount === 0) {
            throw new Error("User not found");
        }
        if (updateResult.modifiedCount === 0) {
            console.warn("The refresh_token field was not updated. It may already have the same value.");
        }

        console.log("Refresh token generated and saved successfully.");
        return token;
    } catch (error) {
        console.error("Error generating or saving refresh token:", error.message);
        throw error; // Propager l'erreur si nécessaire
    }
};

export default generatedRefreshToken;