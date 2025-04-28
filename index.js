import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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
import productRouter from "./route/product.route.js";
import cartRouter from "./route/cart.route.js";
import addressRouter from "./route/address.route.js";
import orderRouter from "./route/order.route.js";
import http from "http";
import { Server } from "socket.io";
import vendorRouter from "./route/vendor.route.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://pinoufe-frontend.vercel.app", // <-- ici ton frontend vercel
    methods: ["GET", "POST"],
    credentials: true
  }
});

// WebSocket events
io.on("connection", (socket) => {
  console.log("Un utilisateur est connecté via WebSocket");

  socket.on("disconnect", () => {
    console.log("Un utilisateur est déconnecté");
  });
});

// Other server settings
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

const allowedOrigins = [
  "http://localhost:5173",
  "https://pinoufe-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// API routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/file", uploadRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/vendor", vendorRouter);

// Database + Server
connectDB().then(() => {
  server.listen(process.env.PORT || 8080, () => {
    console.log(`Le serveur est en écoute sur le port ${process.env.PORT || 8080}`);
  });
});
