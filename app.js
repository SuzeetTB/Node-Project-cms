const express = require('express');
const exphb = require('express-handlebars');
const app = express();
const port = process.env.PORT || 4545;
const path = require('path');
const mongoose = require('mongoose');
const {mongoDbUrl} = require('./config/database');

const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const cookieParser = require('cookie-parser');
//mongoose.Promise = global.Promise; //if mongoose promise is depricated
//Database Connection 1
mongoose.connect(mongoDbUrl,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(db=>{       // this is a promise
    console.log(`Database Connected`);
}).catch(error=>console.log(`COULD NOT CONNECT |`+ error));

// folder structure 1
app.use(express.static(path.join(__dirname, '/public/')));

//Load ViewEngine- Handlebars helper functions
const {select,generateTime,paginate} = require('./helpers/handlebars-helpers');
//Initiate ViewEngine 2
app.set('view engine', 'handlebars');
app.engine('handlebars', exphb({defaultLayout:'home-layout', helpers:{select:select,generateTime:generateTime, paginate:paginate}}));

// file Upload Middleware 5
app.use(upload());
//Body Parser 4
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//Method Override 5
app.use(methodOverride('_method'));

//Load Sesion and Flash
app.use(cookieParser('suzeetsTweet'));
app.use(session({
    secret:'suzeetsTweet',
    resave: true,
    saveUninitialized: true,
}));
app.use(flash());
//Passport
app.use(passport.initialize());
app.use(passport.session());

//Middleware  based local variable creation
app.use((req,res,next)=>{
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

// Loads the routes 3
const home_routes = require('./routes/home/home-routes'); 
const admin_routes = require('./routes/admin/admin-routes'); 
const posts_routes = require('./routes/admin/posts-routes'); 
const category_routes = require('./routes/admin/category-routes'); 
const comments_routes = require('./routes/admin/comments-routes'); 
// uses the routes 3
app.use('/', home_routes); 
app.use('/admin', admin_routes);
app.use('/admin/posts', posts_routes);
app.use('/admin/categories', category_routes);
app.use('/admin/comments', comments_routes);

//Server Active 0
app.listen(port,()=>{
    console.log(
        `
        Server is Active |
        try localhost:${port}
        `
        );
});


