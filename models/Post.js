const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const URLSlugs = require('mongoose-url-slugs');
//PostSchema needs to be exported so we assign new Schema to it.
const PostSchema = new Schema({
    user:{
         type:Schema.Types.ObjectId,
         ref:'users',
        // here we are going to have either Object Document or  the  refrence of the users to indicate relationships

    },
    category:{
        type:Schema.Types.ObjectId,
        ref:'categories',
    },
    comments:[{ //this is an array of objects
        type:Schema.Types.ObjectId,
        ref:'comments',
    }],
    slug:{
        type:String,
    },
    title:{
        type: String,
        required: true,
    },
    subtitle:{
        type: String,
        required: true,
    },
    status:{
        type: String,
        default: 'public',
    },
    allowComments:{
        type: Boolean,
        required: true,
    },
    body:{
        type: String,
        required: true,
    },
    file:{
        type: String,
        
    },
    date:{
        type:Date,
        default:Date.now(),
    }
}
    //use this if MongoError Unhandled Error: PushAll...
    //,{usePushEach:true}
);
PostSchema.plugin(URLSlugs('title',{field:'slug'}));
module.exports = mongoose.model('posts', PostSchema);
// this posts can be replaced by Post
// but mongoose will use posts inside the JSON document