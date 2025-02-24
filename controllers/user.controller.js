import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import generatedOtp from '../utils/generatedOtp.js';
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js';
import jwt from 'jsonwebtoken'
import generatedRefreshToken from '../utils/generatedRefreshToken.js';

export async function registerUserController(req, res) {
    try {
        const { name, email, password } = req.body;

        // Validation des champs obligatoires
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email, and password",
                error: true,
                success: false,
            });
        }

        // Vérification si l'utilisateur existe déjà
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "User already exists",
                error: true,
                success: false,
            });
        }

        // Hachage du mot de passe
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        // Création du nouvel utilisateur
        const payload = {
            name,
            email,
            password: hashPassword,
        };
        const newUser = new UserModel(payload);
        const savedUser = await newUser.save();

        // Génération de l'URL de vérification d'email
        const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${savedUser._id}`;

        // Envoi de l'email de vérification
        await sendEmail({
            sendTo: email,
            subject: "Please verify your email",
            html: verifyEmailTemplate({
                name,
                url: verifyEmailUrl,
            }),
        });

        // Réponse réussie
        return res.status(201).json({
            message: "User registered successfully",
            error: false,
            success: true,
            data: savedUser,
        });

    } catch (error) {
        // Gestion des erreurs
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false,
        });
    }
}

export async function verifyEmailController(req, res) {
    try {
        const { code } = req.body;

        const user = await UserModel.findOne({ _id: code });

        if (!user) {
            return res.status(400).json({
                message: "Invalid code",
                error: true,
                success: false,
            });
        }

        const updateUser = await UserModel.updateOne({ _id: code }, {
            verify_email: true
        });

        return res.json({
            message: "Verify email done",
            success: true,
            error: false,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

// Login controller
export async function loginController(req, res) {
    try {
        const { email, password } = req.body;

        // Vérification des champs obligatoires
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
                error: true,
                success: false,
            });
        }

        // Recherche de l'utilisateur par email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Utilisateur introuvable",
                error: true,
                success: false,
            });
        }

        // Vérification du statut de l'utilisateur
        if (user.status !== "Active") {
            return res.status(400).json({
                message: "Contact the admin",
                error: true,
                success: false,
            });
        }

        // Vérification du mot de passe
        const checkPassword = await bcryptjs.compare(password, user.password);
        if (!checkPassword) {
            return res.status(400).json({
                message: "Invalid password",
                error: true,
                success: false,
            });
        }

        // Extraire l'ID utilisateur (_id) et le convertir en chaîne
        const userId = user._id.toString();

        // Génération des tokens
        const accessToken = await generatedAccessToken(userId);
        const refreshToken = await generatedRefreshToken(userId);

        const updatedUser = await UserModel.findByIdAndUpdate( user?._id , {
            last_login_date: new Date(),
        });

        // Configuration des cookies
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        // Ajout des tokens aux cookies
        res.cookie('accessToken', accessToken, cookiesOption);
        res.cookie('refreshToken', refreshToken, cookiesOption);

        // Réponse JSON
        return res.json({
            message: "Connexion avec succès",
            error: false,
            success: true,
            data: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        // Gestion des erreurs
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false,
        });
    }
}

// Logout controller
export async function logoutController(req, res) {
    try {
        const userId = req.userId; // Récupéré depuis le middleware auth

        // Suppression des cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        // Suppression du refresh token dans la base de données
        await UserModel.findByIdAndUpdate(userId, {
            refresh_token: "",
        });

        return res.json({
            message: "Logout successful",
            error: false,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false,
        });
    }
}


//update user details
export async function updateUserDetails(req, res) {
    try {
        const userId = req.userId
        const { name, email, mobile, password } = req.body

        let hashPassword = ""

        if(password){
            const salt = await bcryptjs.genSalt(10);
            hashPassword = await bcryptjs.hash(password, salt);
        }

        const updteUser = await UserModel.updateOne({ _id : userId }, {
            ...(name && { name : name}),
            ...(email && { email : email}),
            ...(mobile && { mobile : mobile}),
            ...(password && { password : hashPassword})
        })

        return res.json({
            message: "User updated successfully",
            error: false,
            success: true,
            data :   updteUser
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        })
    }
}

//forgot password not login
export async function forgotPasswordController(req,res) {
    try {
        const { email } = req.body

        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message : "Email is not uvailable",
                error : true,
                success : false
            })
        }

        const otp = generatedOtp()
        const expireTime = new Date() + 60 * 60 * 1000 /// 1hours

        const update = await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp : otp,
            forgot_password_expiry : new Date(expireTime).toISOString()
        })

        await sendEmail({
            sendTo : email,
            subject : "Forgot password from Mohamed",
            html : forgotPasswordTemplate({
                name : user.name,
                otp : otp
            })
        })

        return res.json({
            message : "cheick your email",
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(req,res) {
    try {
        const { email , otp } = req.body

        if (!email || !otp) {
            return res.status(400).json({
                message : "Provide required field email, otp.",
                error : true,
                success : false
            })
        }
        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message : "Email is not uvailable",
                error : true,
                success : false
            })
        }

        const currentTime = new Date().toISOString()

        if (user.forgot_password_expiry < currentTime) {
            return res.status(400).json({
                message : "Votre code OTP est expiré",
                error : true,
                success : false
            })
        }

        if (otp !== user.forgot_password_otp) {
            return res.status(400).json({
                message : "Votre code OTP est invalide",
                error : true,
                success : false
            })
        }

        //si le code otp n'est pas expiré
        //otp === user.forgot_password_otp

        const updatedUser = await UserModel.findByIdAndUpdate(user._id , {
            forgot_password_otp : "",
            forgot_password_expiry : ""
        })

        return res.json({
            message : "Code otp verifié avec succées",
            error : false,
            success : true
        })


    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//reset the password
export async function resetpassword(req, res) {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Validation des champs obligatoires
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Veuillez fournir les champs requis : email, newPassword, confirmPassword",
                error: true,
                success: false,
            });
        }

        // Vérification si les mots de passe correspondent
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Les mots de passe ne correspondent pas.",
                error: true,
                success: false,
            });
        }

        // Recherche de l'utilisateur par email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Aucun utilisateur trouvé avec cet email.",
                error: true,
                success: false,
            });
        }

        // Hachage du nouveau mot de passe
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(newPassword, salt);

        // Mise à jour du mot de passe dans la base de données
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: user._id },
            { password: hashPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).json({
                message: "Échec de la mise à jour du mot de passe.",
                error: true,
                success: false,
            });
        }

        // Réponse réussie
        return res.json({
            message: "Mot de passe mis à jour avec succès.",
            error: false,
            success: true,
        });
    } catch (error) {
        // Gestion des erreurs
        return res.status(500).json({
            message: error.message || "Erreur interne du serveur.",
            error: true,
            success: false,
        });
    }
}

//refresh token controler
export async function refreshToken(req, res) {
    try {
        // Récupérer le refreshToken depuis les cookies ou les en-têtes
        let refreshToken = req.cookies.refreshToken || req.headers.authorization?.split("Bearer ")[1];

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token is missing",
                error: true,
                success: false,
            });
        }

        try {
            // Vérifier le refreshToken
            const decodedToken = await jwt.verify(
                refreshToken,
                process.env.SECRET_KEY_REFRESH_TOKEN
            );

            const userId = decodedToken.id;

            // Vérifier si l'utilisateur existe et si le refreshToken stocké correspond
            const user = await UserModel.findById(userId);

            if (!user || !user.refresh_token || !bcryptjs.compareSync(refreshToken, user.refresh_token)) {
                return res.status(401).json({
                    message: "Invalid or expired refresh token",
                    error: true,
                    success: false,
                });
            }

            // Générer un nouveau accessToken
            const newAccessToken = await generatedAccessToken(userId);

            // Optionnel : Générer un nouveau refreshToken et le mettre à jour dans la base de données
            const newRefreshToken = await generatedRefreshToken(userId);

            // Mettre à jour le refreshToken dans la base de données
            await UserModel.updateOne(
                { _id: userId },
                { refresh_token: bcryptjs.hashSync(newRefreshToken, 10) } // Hacher le nouveau refreshToken avant de l'enregistrer
            );

            // Configuration des cookies
            const cookiesOption = {
                httpOnly: true,
                secure: true,
                sameSite: "None",
            };

            // Ajouter les nouveaux tokens aux cookies
            res.cookie("accessToken", newAccessToken, cookiesOption);
            res.cookie("refreshToken", newRefreshToken, cookiesOption);

            // Réponse JSON
            return res.json({
                message: "Tokens refreshed successfully",
                error: false,
                success: true,
                data: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                },
            });
        } catch (error) {
            // Gérer les erreurs spécifiques liées au token
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Refresh token has expired",
                    error: true,
                    success: false,
                });
            } else if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    message: "Invalid refresh token",
                    error: true,
                    success: false,
                });
            } else {
                throw error; // Propager l'erreur si nécessaire
            }
        }
    } catch (error) {
        // Gestion des erreurs générales
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false,
        });
    }
}

//get login user details
export  async function userDetails(req, res) {
    try {
        const userId = req.userId

        console.log(userId);
        

        const user = await UserModel.findById(userId).select("-password -refresh_token")

        return res.json({
            message : "User details",
            error : false,
            success : true,
            data : user
        })
    } catch (error) {
        return res.status(500).json({
            message : "Something went wrong",
            error : true,
            success : false
        })
    }
}