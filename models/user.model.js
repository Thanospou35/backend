import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true, // Supprime les espaces inutiles
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      lowercase: true, // Convertit l'email en minuscules
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ], // Validation de l'email
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    mobile: {
      type: String,
      default: null,
      match: [/^\d{10}$/, "Please provide a valid mobile number"], // Validation du numéro de téléphone
    },
    user_avatar: {
      type: String,
      default: ""
    },
    refresh_token: {
      type: String,
      default: "",
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    address_details: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address", // Référence au modèle Address
      },
    ],
    shopping_cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CartProduct", // Référence au modèle CartProduct
      },
    ],
    orderList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order", // Référence au modèle Order
      },
    ],
    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
  },
  {
    timestamps: true, // Ajoute automatiquement `createdAt` et `updatedAt`
  }
);

// Création du modèle User
const UserModel = mongoose.model("User", userSchema);

// Export du modèle
export default UserModel;