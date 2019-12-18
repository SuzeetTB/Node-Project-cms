const express = require('express');
const router = express.Router();
const Category= require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authenticate-helpers');

// all the routes in this route-file follows specifics of this file
router.all('/*',userAuthenticated,(req, res, next)=>{
    req.app.locals.layout = 'admin-layout';
    next();
});


router.get('/',(req, res)=>{
    Category.find({}).then(categories=>{
        res.render('admin/categories/index-category', {categories:categories});
    });
    
});

router.get('/edit/:id',(req, res)=>{
    Category.findOne({_id:req.params.id}).then(category=>{
        res.render('admin/categories/edit-category',{category:category});
    });
});

//post Routes
router.post('/create',(req,res)=>{
    const newCategory = new Category({
        name: req.body.name,
        caption:req.body.caption,
    });
    newCategory.save().then(savedCategory=>{
        res.redirect('/admin/categories');
    }).catch(err=>{
        console.log(err);
    })
});

router.put('/edit/:id',(req, res)=>{
    Category.findOne({_id:req.params.id}).then(category=>{
        category.name = req.body.name;
        category.caption = req.body.caption;
        category.save().then(savedCategory=>{
            res.redirect('/admin/categories');
        });
    });
});

router.delete('/:id',(req, res)=>{
    Category.remove({_id: req.params.id}).then(result=>{
        res.redirect('/admin/categories');
    });
});

module.exports = router;