const mongoose = require('mongoose')

const toySchema = new mongoose.Schema({
    toyid:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:true
    }
})

// creating a model
const Toys = mongoose.model('Toys',toySchema)

// exporting
module.exports = {Toys}