import mongoose from "mongoose";
import SubCategoryModel from "../models/subCategory.model.js";
import fs from "fs"; // Pour gérer les fichiers locaux si nécessaire

export const AddSubCategoryController = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        if (!req.file) {
            return res.status(400).json({
                message: "Veuillez télécharger une image",
                error: true,
                success: false,
            });
        }

        const { name, category } = req.body;
        const image = req.file.path; // multer stocke le chemin du fichier

        if (!name || !category) {
            return res.status(400).json({
                message: "Fournissez un nom et une catégorie",
                error: true,
                success: false,
            });
        }

        const payload = { name, image, category };
        const createSubCategory = new SubCategoryModel(payload);
        const save = await createSubCategory.save();

        return res.json({
            message: "Sous-catégorie créée avec succès",
            data: save,
            error: false,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

export const getSubCategoryController = async(request,response)=>{
    try {
        const data = await SubCategoryModel.find().sort({createdAt : -1}).populate('category')
        return response.json({
            message : "Sub Category data",
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const updateSubCategoryController = async (request, response) => {
    try {
        const { _id, name, category } = request.body;
        const imageFile = request.file;

        // Validation de l'ID
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return response.status(400).json({
                message: "Invalid _id provided",
                error: true,
                success: false,
            });
        }

        // Vérifier si tous les champs requis sont présents
        if (!name || !category) {
            return response.status(400).json({
                message: "Fields 'name' and 'category' are required",
                error: true,
                success: false,
            });
        }

        // Vérifier si la sous-catégorie existe
        const existingSubCategory = await SubCategoryModel.findById(_id);
        if (!existingSubCategory) {
            return response.status(404).json({
                message: "Subcategory not found",
                error: true,
                success: false,
            });
        }

        // Préparer les données à mettre à jour
        const updateData = {
            name,
            category,
        };

        // Gérer l'image si elle a été fournie
        if (imageFile) {
            // Supprimer l'ancienne image si elle existe
            if (existingSubCategory.image && fs.existsSync(existingSubCategory.image)) {
                fs.unlinkSync(existingSubCategory.image); // Supprimer l'ancien fichier
            }

            // Mettre à jour le chemin de l'image
            updateData.image = imageFile.path; // Chemin relatif du fichier
        }

        // Mettre à jour la sous-catégorie
        const updatedSubCategory = await SubCategoryModel.findByIdAndUpdate(
            _id,
            updateData,
            { new: true }
        );

        // Répondre avec succès
        return response.status(200).json({
            message: "Subcategory updated successfully",
            data: updatedSubCategory,
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Error in updateSubCategoryController:", error);
        return response.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false,
        });
    }
};

export const deleteSubCategoryController = async(request,response)=>{
    try {
        const { _id } = request.body 
        console.log("Id",_id)
        const deleteSub = await SubCategoryModel.findByIdAndDelete(_id)

        return response.json({
            message : "Delete successfully",
            data : deleteSub,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
