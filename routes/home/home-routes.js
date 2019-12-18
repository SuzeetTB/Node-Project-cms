//fundamental packages
const express = require('express');
const router = express.Router();
//Model packages
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
//logic packages
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// all the routes in this route-file follows specifics of this file
router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'home-layout';
    next();
});
//load landing page Home
router.get('/', (req,res)=>{

    const perPage = 3;
    const page = req.query.page || 1;

    Post.find({})
        .skip((perPage*page)-perPage)
        .limit(perPage)
        .then(posts=>{
            Post.countDocuments().then(postCount=>{
                Category.find({}).then(categories=>{
                    res.render('home/index',{
                        posts:posts, 
                        categories:categories,
                        current:parseInt(page),
                        pages:Math.ceil(postCount/perPage),
                    });
                });
            });
        
    }).catch(err=>{
        console.log(err);
    });
});

//load About Page
router.get('/about', (req,res)=>{
    //res.send(`It is working`);
    res.render('home/about');
});
//load Login page

router.get('/login', (req,res)=>{
    //res.send(`It is working`);
    res.render('home/login');
});
//load Register page
router.get('/register', (req,res)=>{
    //res.send(`It is working`);
    res.render('home/register');
});

router.get('/post/:slug', (req,res)=>{
    Post.findOne({slug:req.params.slug})
    .populate('user')
    .populate({path:'comments',match:{approveComment:true}, populate:{path:'user',model:'users'}}).then(post=>{
        Category.find({}).then(categories=>{
            res.render('home/singlePost',{post:post, categories:categories});
        });
    });
   
});

router.get('/logout',(req,res)=>{
    req.logOut();
    res.redirect('/login');
});
//post routes
//register routes Submit
router.post('/register', (req,res)=>{
    let errors=[];
    if(!req.body.firstName) errors.push({message:'You can\'t have no NAME'});
    if(!req.body.lastName) errors.push({message:'You can\'t have no NAME'});
    if(!req.body.email) errors.push({message:'You can\'t leave this empty'});
    if(!req.body.password || (req.body.password !== req.body.passwordConfirm)) errors.push({message:'Sth Wrong About Password Here'});
    if(errors.length>0){
        res.render('home/register',{
            errors:errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        });
    }else{
        User.findOne({email:req.body.email}).then(user=>{
            if(!user){
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                });
                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(newUser.password,salt,(err,hash)=>{
                        newUser.password = hash;
                        newUser.save().then(savedUser=>{
                            req.flash('success_message',`Registration Successful \n ${newUser.firstName} \n Try Logging in.`);
                            res.redirect('/login');
                        });
                    });
                });
            }
            else{
                req.flash('error_message','That email exists already');
                res.redirect('/login');
            }
        });
        
    }
    
    //res.render('home/register');
});


//login submit
router.post('/login', (req,res, next)=>{
    passport.authenticate('local',{
        successRedirect:'/admin',
        failureRedirect:'/login',
        failureFlash:true,
    })(req,res, next);
});


//login Authenticate
passport.use(new LocalStrategy({usernameField:'email'},(email,password,done)=>{
    //console.log(email);
    User.findOne({email:email}).then(user=>{
        //user.userDefinedMethod();
        if(!user) return done(null, false, {message:'User Not Found'});
        bcrypt.compare(password,user.password,(err,matched)=>{
            if(err) return err;
            if(matched) return done(null,user);
            else return done(null,false,{message:'Password Not Matched'});
        });
    })
}))
//login Credentials mgmt
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
module.exports = router;
