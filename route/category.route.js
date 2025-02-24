import { Router } from 'express'
import auth from '../middleware/auth.js'
import { AddCategoryController, deleteCategoryController, getCategoryController} from '../controllers/category.controller.js'
import upload from '../middleware/multer.js'

const categoryRouter = Router()

categoryRouter.post("/add-category" ,upload.single("image"),AddCategoryController)
categoryRouter.get('/get',getCategoryController)
categoryRouter.delete("/delete",auth,deleteCategoryController)



export default categoryRouter