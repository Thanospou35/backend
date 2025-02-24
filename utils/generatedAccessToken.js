import jwt from 'jsonwebtoken';

const generatedAccessToken = async (userId) => {
    try {
        // Vérifier si l'ID utilisateur est valide
        if (!userId || typeof userId !== 'string') {
            throw new Error("Invalid user ID format");
        }

        // Générer le token d'accès
        const token = jwt.sign(
            { id: userId },
            process.env.SECRET_KEY_ACCESS_TOKEN,
            { expiresIn: '5h' }
        );

        console.log("Access token generated successfully.");
        return token;
    } catch (error) {
        console.error("Error generating access token:", error.message);
        throw error; // Propager l'erreur si nécessaire
    }
};

export default generatedAccessToken;