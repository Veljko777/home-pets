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
var Like=require("./models/likes")
var methodOverride=require("method-override");
var images={image:"/public/images/cat-2489845_960_720.jpg"}


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



//=================================
//INDEX PAGE (show all posts)
//=================================
app.get("/", function(req, res){
    Pets.find({} , function(err, allPets){
        
        if(err){
            console.log(err);
        } else{
            res.render("landing", {pets:allPets})
        }
    })
    
});

app.get("/dogs", function(req,res){
    Pets.find({species:"Dog"}, function(err, allDogs){
        if(err){
            console.log(err)
        }else{
            res.render("dogs", {dogs:allDogs})
            
        }
    })
})
app.get("/cats", function(req,res){
    Pets.find({species:"Cat"}, function(err, allCats){
        if(err){
            console.log(err)
        }else{
            res.render("cats", {cats:allCats})
            
        }
    })
})
app.get("/rabbits", function(req,res){
    Pets.find({species:"Rabbit"}, function(err, allRabbits){
        if(err){
            console.log(err)
        }else{
            res.render("rabbits", {rabbits:allRabbits})
            
        }
    })
})
app.get("/parrots", function(req,res){
    Pets.find({species:"Parrot"}, function(err, allParrots){
        if(err){
            console.log(err)
        }else{
            res.render("parrots", {parrots:allParrots})
            
        }
    })
})
app.get("/other", function(req,res){
    Pets.find({species:"Other"}, function(err, allOther){
        if(err){
            console.log(err)
        }else{
            res.render("other", {others:allOther})
            
        }
    })
})

//=================================
//PROFILE ROUT
//=================================
app.get("/profile/:user_id", function(req,res){
    User.findById(req.params.user_id).populate("pets").exec( function(err, foundUser){
        if(err){
            console.log(err)
        }else{
            res.render("profile", {user:foundUser})
        }
        
        
    })
})



app.get("/profile/:user_id/edit",checkProfileOwnerships, function(req,res){
    User.findById(req.params.user_id, function(err,foundUser){
        res.render("editProfile", {user:foundUser})
    })
})


app.put("/profile/:user_id", checkProfileOwnerships, function(req,res){
    
    var email=req.body.email;
    var picture=req.body.picture;
    var firstname=req.body.firstname;
    var lastname=req.body.lastname;
    var userdata={ email:email, picture:picture, firstname:firstname, lastname:lastname}
    User.findByIdAndUpdate(req.params.user_id, userdata, function(err, updatedUser){
        res.redirect("/profile/"+ req.params.user_id)
    })        
})


//=================================
//CREATE POST ROUT
//=================================

app.get("/profile/:user_id/create", checkProfileOwnerships, function(req,res){
    User.findById(req.params.user_id, function(err, user){
        if(err){
            console.log(err)
        }else{
            res.render("create", {user:user})
        }
    })
    
});

app.post("/profile/:user_id/pets", checkProfileOwnerships, function(req,res){
    User.findById(req.params.user_id, function(err, user){
        if(err){
            console.log(err)
        } else{
            var name=req.body.name;
            var species=req.body.species;
            var breed=req.body.breed;
            var image=req.body.image;
            var description=req.body.description;
            var author={
                id:req.user._id,
                username:req.user.username
            };
            var newPet={name:name, species:species, breed:breed, image:image, description:description, author:author}
            Pets.create(newPet, function(err,pet){
                if(err){
                    console.log(err);
                }else{
                    user.pets.push(pet)
                    user.save()
                    res.redirect("/profile/"+ req.params.user_id)
                }
                })
            }
})
})

//=================================
//SHOW ONE POST ROUT
//=================================
app.get("/show/:id", function(req,res){
    Pets.findById(req.params.id).populate("comments").populate("likes").exec( function(err,foundPet){
        if(err){
            console.log(err)
        } else{
            res.render("show", {pet:foundPet})
        }
    })
    
});

//=================================
//EDIT POST ROUT
//=================================
app.get("/show/:id/edit", checkPostOwnerships, function(req,res){
    Pets.findById(req.params.id, function(err,foundPet){
        res.render("editPost", {pet:foundPet})
        
    });
});

//=================================
//UPDATE POST ROUT
//=================================
app.put("/show/:id", checkPostOwnerships,  function(req,res){
    var data={name:req.body.name, species:req.body.species, breed:req.body.breed, image:req.body.image, description:req.body.description};
    Pets.findByIdAndUpdate(req.params.id, data, function(err, updatePet){
        res.redirect("/show/"+req.params.id)
    })
})

//=================================
//DELETE POST ROUT
//=================================
app.delete("/show/:id", checkPostOwnerships, function(req,res){
    Pets.findByIdAndRemove(req.params.id, function(err){
        res.redirect("/");
    })
})

//=================================
//LIKES
//=================================
app.post("/show/:id/like", isLoggedIn, function(req,res){
    Pets.findById(req.params.id).populate("likes").exec( function(err,pet){
        if(err){
            console.log(err);
        }else{
            var currentUser=req.user.username;
            var found=false;
            pet.likes.forEach(function(like){
                if(like.author.username===currentUser){
                    found=true
                } 
            })
            if(found===false){
                var author={
                    id:req.user._id,
                    username:req.user.username}
                var newLike={author:author}
                Like.create(newLike, function(err, like){
                    if(err){
                        console.log(err)
                    }else{
                        pet.likes.push(like);
                        pet.save();
                        res.redirect("back") 
                    }
                }) 
            }else{
                res.redirect("back")
            }
        }
    })
})



//=================================
//LOGIN ROUT
//=================================
app.get("/login", function(req,res){
    res.render("login",{images:images});
});

app.post("/login", passport.authenticate("local", {
    successRedirect:"/",
    failureRedirect:"/login"
}), function(req,res){
});



//=================================
//LOGOUT ROUT
//=================================
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/")
})

//=================================
//REGISTER ROUT
//=================================

app.post("/register", function(req,res){
    var newUser=new User({username:req.body.username, email:req.body.email, picture:"",firstname:"", lastname:""})
    User.register(newUser, req.body.password, function(err, newUser){
        if(err){
            console.log(err);
            res.render("login")
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            });
        }
    });
});


//=================================
//COMMENT
//=================================
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
//=================================
//EDIT COMMENT ROUT
//=================================
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

//=================================
//DELETE COMMENT ROUT
//=================================
app.delete("/show/:id/comments/:comment_id", checkCommentOwnerships, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        res.redirect("/show/"+req.params.id);
    })
})





//=================================
//MIDDLEWARE
//=================================
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

function checkIfLiked(req,res,next){
    Pets.findById(req.params.pet_id, function(err, foundPet){
            foundPet.likes.find({}, function(err, foundLike){
                console.log(foundLike)
            })
            
        })
    
}

function checkProfileOwnerships(req,res,next){
    if(req.isAuthenticated()){
        User.findById(req.params.user_id, function(err, foundUser){
            if(err){
                console.log(err)
            }else{
                if(!foundUser){
                    return res.redirect("back")
                }if(foundUser._id.equals(req.user._id)){
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



app.listen(3000, function(){
    console.log("SERVER STARTED")
});