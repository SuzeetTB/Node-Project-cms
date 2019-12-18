const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
});

UserSchema.methods.userDefinedMethod = function(){
    console.log('this is a user defined method')
};

module.exports = mongoose.model('users', UserSchema);