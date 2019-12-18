const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//Schema needs to be exported so we assign new Schema to it.
const CategorySchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    caption:{
        type:String,
        maxlength:50,
    }
});
module.exports = mongoose.model('categories', CategorySchema);
// this posts can be replaced by Post
// but mongoose will use posts inside the JSON document