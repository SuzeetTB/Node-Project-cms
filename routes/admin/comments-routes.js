const express = require('express');
const router = express.Router();

const Post= require('../../models/Post');
const Comment = require('../../models/Comment');

const {userAuthenticated} = require('../../helpers/authenticate-helpers');
router.all('/*',  userAuthenticated ,(req, res, next)=>{
    req.app.locals.layout = 'admin-layout';
    next();
});

router.get('/',(req,res)=>{

    Comment.find({user:req.user.id}).populate('user').then(comments=>{
        res.render('admin/comments/index-comments', {comments:comments});  
    });
    
});


router.post('/approve-comment',(req,res)=>{
    Comment.findByIdAndUpdate(req.body.id, {$set:{approveComment:req.body.approveComment}},(err,result)=>{
    if(err) return err;
    res.send(result);
    });
    
});


router.post('/',(req,res)=>{
    Post.findOne({_id:req.body.id}).then(post=>{
        const newComment = new Comment({
            user:req.user.id,
            body:req.body.body,
        });
        post.comments.push(newComment);
        post.save().then(savedPost=>{
            newComment.save().then(savedComment=>{
                req.flash('success_message','You made your comment, will be posted after review.')
                res.redirect(`/post/${post.id}`);
            });
        });
    });
});

router.delete('/:id',(req,res)=>{
    Comment.findByIdAndDelete(req.params.id).then(deletedItem=>{
        Post.findOneAndUpdate({comments:req.params.id},{$pull:{comments:req.params.id}},(err,data)=>{
            //This is where we delete comments refrence form array of comments from the post
            if(err) console.log(err);
            res.redirect('/admin/comments');
        });
    });
});

module.exports = router;