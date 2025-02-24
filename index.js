import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.route.js";
import uploadRouter from "./route/upload.router.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import subCategoryRouter from "./route/subCategory.route.js";

const app = express(); // Définition correcte

// Pour rendre compatible avec ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Servir les fichiers du dossier 'uploads' statiquement
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL // Corrige l'erreur FRONTEND_UR
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev")); // Ajoute "dev" pour un meilleur affichage des logs
app.use(helmet({
    crossOriginResourcePolicy: false
}));

const PORT = process.env.PORT || 8080; // Corrige l'ordre de priorité

app.get("/", (req, res) => {
    ///server pour le client
    res.json({
        message : "Serveur en ligne" + PORT
    })
})

app.use('/api/user',userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)

connectDB().then(() =>{
    app.listen(PORT, () => {
        console.log(`Le serveur est en écoute sur le port ${PORT}`);
    });
});


