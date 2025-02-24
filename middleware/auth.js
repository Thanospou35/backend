import jwt from 'jsonwebtoken';

const auth = async (request, response, next) => {
    try {
        // Extraction du token depuis les cookies ou l'en-tête Authorization
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1];

        // Vérification de la présence du token
        if (!token) {
            return response.status(401).json({
                message: "Provide token",
                error: true,
                success: false,
            });
        }

        // Vérification et décodage du token
        const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

        // Ajout de l'ID utilisateur à l'objet `request`
        request.userId = decode.id; // Assurez-vous que le token contient un champ `id`

        // Passage au middleware ou contrôleur suivant
        next();
    } catch (error) {
        // Gestion des erreurs spécifiques à JWT
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return response.status(401).json({
                message: "Invalid or expired token",
                error: true,
                success: false,
            });
        }

        // Gestion des autres erreurs
        return response.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false,
        });
    }
};

export default auth;