const uploadImageController = async (req, res) => {
    try {
        // Vérifier si un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({
                message: "Aucun fichier uploadé.",
                error: true,
                success: false,
            });
        }

        // Récupérer les informations du fichier
        const file = req.file;

        // Construire l'URL de l'image
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

        // Répondre avec l'URL de l'image
        return res.status(200).json({
            message: "Upload réussi !",
            data: {
                url: imageUrl, // URL de l'image
                filename: file.filename, // Nom du fichier
                size: file.size, // Taille du fichier
            },
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Erreur lors de l'upload de l'image :", error);
        return res.status(500).json({
            message: error.message || "Une erreur s'est produite lors de l'upload de l'image.",
            error: true,
            success: false,
        });
    }
};

export default uploadImageController;