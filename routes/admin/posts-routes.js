// Imports
const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');


const {isEmpty, uploadDir} = require('../../helpers/upload-helper');
const {userAuthenticated} = require('../../helpers/authenticate-helpers');
const fs= require('fs');
//const path = require('path');

// all the routes in this route-file follows specifics of this file
router.all('/*', userAuthenticated, (req, res, next)=>{
    req.app.locals.layout = 'admin-layout';
    next();

});
// GET methods
router.get('/',(req, res)=>{
    Post.find({})
    .populate('category')
    .populate({path:'user', model:'users'})
    .then(posts=>{
        res.render('admin/posts/index-posts', {posts:posts});
    });
});
router.get('/my-posts',(req,res)=>{
    Post.find({user:req.user.id})
    .populate('category')
    .then(posts=>{
        res.render('admin/posts/my-posts', {posts:posts});
    });
});
router.get('/create',(req, res)=>{
    Category.find({}).then(categories=>{
        res.render('admin/posts/create-posts', {categories:categories});
    });
    
});
router.get('/edit/:id',(req, res)=>{
    //res.send(req.param.id);
    Post.findOne({_id:req.params.id}).populate('category').then(post=>{
        Category.find({}).then(categories=>{
            res.render('admin/posts/edit-posts', {post:post, categories:categories});
        });
    });
    //res.render('admin/posts/edit-posts');
});

//POST Methods
let allowComments = true;
router.post('/create',(req,res)=>{
    let errors =[];
    if(!req.body.title) errors.push({message:'Please Add Title.'});
    if(!req.files) errors.push({message:'Please Add a File!'});
    if(errors.length>0){
        res.render('admin/posts/create-posts',{
            errors:errors
        });
    }
    else{
        //file Processing
        let filename = 'fnof.jpg';
        if(!isEmpty(req.files)){
            console.log('File Present');
            let file = req.files.file;
            filename = Date.now()+'-'+file.name;
            let dirUploads = './public/uploads/';
            file.mv(dirUploads+filename, (err)=>{
                if(err) throw err;
            });//console.log(req.files);
        }else console.log(`No File`);
        //Since allowComments is a check box it's value is either on or undefined
        //To convert it into the boolean value
        if(req.body.allowComments){
            allowComments=true;
        }
        else{
            allowComments = false;
        }
        //res.send(`Worked`)
        //console.log(req.body)
        const newPost = new Post({
            user: req.user.id,
            title:req.body.title, 
            subtitle:req.body.subtitle,
            body: req.body.body,
            file: filename,
            allowComments:allowComments,
            status: req.body.status,
            category:req.body.category,
        });
        newPost.save().then(savedPost=>{
            console.log(savedPost);
            req.flash('success_message', `${savedPost.title}`+`Post successfully created!`);
            //req.toastr.success(`${savedPost.title}`+`Post successfully created!`);
            //res.render('/admin/posts');
            res.redirect('/admin/posts');
        }).catch(Error=>{
            errors.push({message:'Not Saved For certain reasons. Please Try Again'});
            console.log(`NOt Saved | `+ error);
        }); 
    }  
});

router.put('/edit/:id',(req,res)=>{
    Post.findOne({_id:req.params.id}).then(
        post=>{
            //checking Comments checkbox
            if(req.body.allowComments){
                allowComments=true;
            }else{
                allowComments = false;
            }
            post.user = req.user.id;
            post.title=req.body.title;
            post.subtitle=req.body.subtitle;
            post.body=req.body.body;
            post.status=req.body.status;
            post.category = req.body.category;
            post.allowComments=allowComments;
            // file Check and processing
            if(!isEmpty(req.files)){
                console.log('File Present');
                let file = req.files.file;
                filename = Date.now()+'-'+file.name;
                post.file = filename;
                let dirUploads = './public/uploads/';
                file.mv(dirUploads+filename, (err)=>{
                    if(err) throw err;
                });//console.log(req.files);
            }else console.log(`No File Uploaded! hence remains same`);

            post.save().then(updatedPost=>{
                req.flash('success_message','Post is updated!');
                /* req.toastr.success(`${updatedPost.title}`+` - Post successfully Edited!`);
                
                res.render('/admin/posts'); */
                res.redirect('/admin/posts/my-posts');
            });
    });
    //res.send(   `It Worked`)
});

router.delete('/:id',(req,res)=>{
    Post.findOne({_id: req.params.id}).populate('comments').then(post=>{
        fs.unlink(uploadDir+post.file,(err)=>{

            //console.log(post.comments);
            if(!post.comments.length < 1){//here comments is a reference from Post model 
                post.comments.forEach(comment => {
                    comment.remove();
                });
            }
            //req.toastr.success(`${post.title}`+` - Post successfully Deleted!`);
            post.remove().then(postRemoved=>{
                req.flash('success_message', 'post was deleted successfully');
                res.redirect('/admin/posts/my-posts');
            });
        })
        
    });
});

module.exports = router;