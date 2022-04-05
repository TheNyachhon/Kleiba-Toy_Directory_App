const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

// creating a function to verify user
userSchema.statics.findAndAuthenticate = async function (username,password){
    const foundUser = await this.findOne({username})
    if(foundUser){
        const isValid = await bcrypt.compare(password,foundUser.password)  
        return isValid ? foundUser : false
    }
    return false;
}

// creating a model
const Users = mongoose.model('Users',userSchema)

// exporting
module.exports = {Users}