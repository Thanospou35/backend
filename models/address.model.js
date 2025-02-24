import mongoose from "mongoose";

const addressShema = new mongoose.Schema({
    address_shema: {
        type : String,
        default : ""
    },
    city : {
        type : String,
        default : ""
    },
    state : {
        type : String,
        default : ""
    },
    pincode : {
        type : String,
    },
    country : {
        type : String,
    },
    mobile : {
        type : Number,
        default : null
    },
    status : {
        types : Boolean,
        default : true
    }
}, {
    timestamps : true
})

const AdressModal = mongoose.model("address", addressShema)

export default AdressModal