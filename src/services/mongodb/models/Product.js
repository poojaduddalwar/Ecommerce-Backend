import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    listPrice: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    compatibleWith: [
        {
            type: String
        }
    ],
    category: {
        type: mongoose.Types.ObjectId,
        //this says that type is going to be a type of mongodb's object
        //if you are referencing other schema or document from other collection , the id of the document so in that case we'll have type to be set as objectId 
        ref: 'Category'
    },
    imageUrl: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    // reviews: [
    //     {
    //         type: mongoose.Types.ObjectId,
    //         ref: "reviews"
    //     }
    // ]
})

const Product = mongoose.model("Product", ProductSchema)

export default Product