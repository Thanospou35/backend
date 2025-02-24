import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name : {
        type : String,
    },
    image : {
        type : Array,
        default : []
    },
    category : [
        {
            type : mongoose.Schema.ObjectId,
            ref : "Category"
        }
    ],
    subCategory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : "subCategory"
        }
    ],
    price : {
        type : Number,
    },
    description : {
        type : String,
        default : ""
    },
    quantity : {    
        type : Number,
        required : [true, "Provide quantity"]
    },
    stock : {
        type : Number,
        default : 0
    },
    price500g : {
        type : Number,
    },
    price1kg : {
        type : Number,
    },
    weight : {
        type : String,
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    updatedAt : {
        type : Date,
        default : Date.now()
    },
    discount : {
        type : Number,
        default : null,
    }
},{
    timestamps : true
})
const ProductModel = mongoose.model('product', productSchema)
export default ProductModel