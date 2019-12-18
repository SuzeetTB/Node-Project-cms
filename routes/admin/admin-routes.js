const express = require('express');
const router = express.Router();
const faker = require('faker');
const Post= require('../../models/Post');
const Category = require('../../models/Category');
const Comments = require('../../models/Comment');
const {userAuthenticated} = require('../../helpers/authenticate-helpers');

// all the routes in this route-file follows specifics of this file
router.all('/*', userAuthenticated ,(req, res, next)=>{
    req.app.locals.layout = 'admin-layout';
    next();
});


router.get('/',(req, res)=>{
    const promises = [
        Post.countDocuments().exec(),
        Category.countDocuments().exec(),
        Comments.countDocuments().exec(),
    ];
    Promise.all(promises).then(([postCount,catCount,comCount])=>{
        res.render('admin/index', {postCount:postCount, catCount:catCount, comCount:comCount});
    });
    /* // this is the simple way for multiple queries
    Post.countDocuments({}).then(postCount=>{
        Category.countDocuments({}).then(catCount=>{
            Comments.countDocuments({}).then(comCount=>{
                res.render('admin/index', {postCount:postCount, catCount:catCount, comCount:comCount});
            })
            
        });
        
    }); */
    
});

router.post('/fake-posts',(req, res)=>{
    for(let i=0;i<req.body.qty;i++){
        let post = new Post();
        post.user=req.user.id,
        post.title = faker.name.title();
        post.subtitle = faker.lorem.slug();
        post.status = 'public';
        post.slug = faker.name.title();
        post.allowComments = faker.random.boolean();
        post.body= faker.lorem.paragraph();
        post.file = faker.image.cats();

        post.save(function(err){
           if(err) throw err; 
        });
    }
    res.redirect('/admin/posts');
});

/* //dashboard
router.get('/dashboard',(req, res)=>{
    res.render('admin/dashboard');
}); */

module.exports = router;