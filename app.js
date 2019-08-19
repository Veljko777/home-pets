var express= require("express");
var app=express();
var passport=require("passport")
var localStrategy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var mongoose=require("mongoose");
var bodyParser=require("body-parser");
var Pets=require("./models/pets");
var Comment=require("./models/comment");
var User=require("./models/user")
var methodOverride=require("method-override");


mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

app.use(require("express-session")({
    secret:"Dogs are the best pets",
    resave:false,
    saveUninitialized:false
}));


mongoose.connect("mongodb://localhost:27017/home-pets", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended:false}));
app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
})

//============
//INDEX PAGE (show all posts)
//============
app.get("/", function(req, res){
    Pets.find({} , function(err, allPets){
        
        if(err){
            console.log(err);
        } else{
            res.render("landing", {pets:allPets})
        }
    })
    
});


//============
//CREATE POST ROUT
//============

app.get("/create", isLoggedIn, function(req,res){
    res.render("create")
});

app.post("/", function(req,res){
    var name=req.body.name;
    var image=req.body.image;
    var description=req.body.description;
    var author={
        id:req.user._id,
        username:req.user.username
    };
    var newPet={name:name, image:image, description:description, author:author}
    Pets.create(newPet, function(err,newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/")
        }
    })

})

//==========
//SHOW ONE POST ROUT
//==========
app.get("/show/:id", function(req,res){
    Pets.findById(req.params.id).populate("comments").exec( function(err,foundPet){
        if(err){
            console.log(err)
        } else{
            res.render("show", {pet:foundPet})
        }
    })
    
});

//===============
//EDIT POST ROUT
//===============
app.get("/show/:id/edit", checkPostOwnerships, function(req,res){
    Pets.findById(req.params.id, function(err,foundPet){
        res.render("editPost", {pet:foundPet})
        
    });
});

//================
//UPDATE POST ROUT
//================
app.put("/show/:id", checkPostOwnerships,  function(req,res){
    var data={name:req.body.name, image:req.body.image, description:req.body.description};
    Pets.findByIdAndUpdate(req.params.id, data, function(err, updatePet){
        res.redirect("/show/"+req.params.id)
    })
})

//===============
//DELETE POST ROUT
//===============
app.delete("/show/:id", checkPostOwnerships, function(req,res){
    Pets.findByIdAndRemove(req.params.id, function(err){
        res.redirect("/");
    })
})

//=============
//REGISTER ROUT
//=============
app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req,res){
    var newUser=new User({username:req.body.username})
    User.register(newUser, req.body.password, function(err, newUser){
        if(err){
            console.log(err);
            res.render("register")
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            });
        }
    });
});



//============
//LOGIN ROUT
//============
app.get("/login", function(req,res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect:"/",
    failureRedirect:"/login"
}), function(req,res){
});



//============
//LOGOUT ROUT
//============
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/")
})



//=============
//COMMENT ROUT
//=============
app.get("/show/:id/comments/new",isLoggedIn, function(req,res){
    Pets.findById(req.params.id, function(err,addComment){
        if(err){
            console.log(err)
        } else{
            res.render("newComment", {pet:addComment})
        }
    })
})

app.post("/show/:id/comments", isLoggedIn, function(req,res){
    Pets.findById(req.params.id, function(err,pet){
        if(err){
            console.log(err);
        } else{
            var text=req.body.text;
            var author={id:req.user._id, username:req.user.username}
            var newComment={text:text, author:author};
            Comment.create(newComment, function(err,comment){
                if(err){
                    console.log(err);
                }else{
                    pet.comments.push(comment);
                    pet.save();
                    res.redirect("/show/"+pet._id)
                }
            })
        }
    })
})
//==================
//EDIT COMMENT ROUT
//===================
app.get("/show/:id/comments/:comment_id/edit", checkCommentOwnerships, function(req,res){
    Comment.findById(req.params.comment_id, function(err,foundComment){
        res.render("editComment", {pet_id:req.params.id, comment:foundComment})
    })
   
})

app.put("/show/:id/comments/:comment_id", checkCommentOwnerships, function(req,res){
    var text=req.body.text
    var editedComment={text:text};
    Comment.findByIdAndUpdate(req.params.comment_id, editedComment, function(err, updatedComment){
        res.redirect("/show/"+req.params.id)
    })
})

//===================
//DELETE COMMENT ROUT
//===================
app.delete("/show/:id/comments/:comment_id", checkCommentOwnerships, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        res.redirect("/show/"+req.params.id);
    })
})


//===========
//MIDDLEWARE
//===========
function checkPostOwnerships(req,res,next){
    if(req.isAuthenticated()){
        Pets.findById(req.params.id, function(err, foundPet){
            if(err){
                console.log(err);
            }else{
                if(!foundPet){
                    return res.redirect("back");
                }
                if(foundPet.author.id.equals(req.user._id)){
                    next()
                }else{
                    res.redirect("back")
                }
            }
        })
    }else{
        res.redirect("back")
    }
};

function checkCommentOwnerships(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err){
                console.log(err)
            }else{
                if(!foundComment){
                    return res.redirect("back")
                }if(foundComment.author.id.equals(req.user._id)){
                    next()
                }else{
                    res.redirect("back")
                }
            }
        })
    }else{
        res.redirect("back")
    }
}


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
    
}

app.listen(3001, function(){
    console.log("SERVER STARTED")
});