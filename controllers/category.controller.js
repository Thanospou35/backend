import CategoryModel from "../models/category.model.js";
import multer from 'multer';
import SubCategoryModel from "../models/subCategory.model.js";
import ProductModel from "../models/product.model.js"

// Configuration de multer pour l'upload des fichiers
const upload = multer({ dest: 'uploads/' });

export const AddCategoryController = async (request, response) => {
    try {
        // Récupérer les données envoyées
        const { name } = request.body;
        const image = request.file; // Le fichier image

        if (!name || !image) {
            return response.status(400).json({
                message: "Name and image are required",
                error: true,
                success: false
            });
        }

        const addCategory = new CategoryModel({
            name,
            image: image.path.replace(/\\/g, "/"), // Remplace \ par / // Chemin de l'image
        });

        const saveCategory = await addCategory.save();

        if (!saveCategory) {
            return response.status(500).json({
                message: "Category not created",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Category added successfully",
            data: saveCategory,
            success: true,
            error: false
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getCategoryController = async(request,response) => {
    try {
        const data = await CategoryModel.find().sort({ createdAt : -1 });

        return response.json({
            data: data,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
export const deleteCategoryController = async (req, res) => {
    try {
        const { _id } = req.params; // Access the _id from the URL path params

        // Check if the category is used in any subcategory or product
        const checkSubCategory = await SubCategoryModel.find({
            category: { "$in": [_id] }
        }).countDocuments();

        const checkProduct = await ProductModel.find({
            category: { "$in": [_id] }
        }).countDocuments();

        if (checkSubCategory > 0 || checkProduct > 0) {
            return res.status(400).json({
                message: "Category is already in use, can't delete",
                error: true,
                success: false,
            });
        }

        // Proceed with category deletion
        const deleteCategory = await CategoryModel.deleteOne({ _id });

        return res.json({
            message: "Category deleted successfully",
            data: deleteCategory,
            error: false,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true,
        });
    }
};
