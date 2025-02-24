import { Router } from "express";
import { AddSubCategoryController, deleteSubCategoryController, getSubCategoryController, updateSubCategoryController } from "../controllers/subCategory.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
 // Importer multer

const subCategoryRouter = Router();

subCategoryRouter.post('/create', auth, upload.single('image'), AddSubCategoryController);
subCategoryRouter.post('/get',getSubCategoryController)
subCategoryRouter.put('/update', auth, upload.single('image'), updateSubCategoryController);
subCategoryRouter.delete('/delete',auth,deleteSubCategoryController)


export default subCategoryRouter;
