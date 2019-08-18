var express= require("express");
var app=express();
var mongoose=require("mongoose");
var bodyParser=require("body-parser");
var Pets=require("./models/pets")





mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);


mongoose.connect("mongodb://localhost:27017/home-pets", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended:false}));
app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));

//==============
//LANDING PAGE
//==============
app.get("/", function(req,res){
   Pets.find({}, function(err, pets){
       if(err){
           console.log(err)
       }else{
        res.render("landing", {pets:pets})
       }
   })
    
});

//=================
//SHOW ROUT
//=================
app.get("/show",function(req,res){
    res.render("show")
});

//================
//LOGIN ROUTE
//================
app.get("/login", function(req,res){
    res.render("login")
});

//===============
//REGISTER ROUTE
//===============
app.get("/register", function(req,res){
    res.render("register")
});

//===============
//CREATE POST ROUTE
//===============
app.get("/create", function(req,res){
    res.render("create")
});

app.post("/",function(req,res){
    var name=req.body.name;
    var image=req.body.image;
    var description=req.body.description;
    // var author={
    //             id:req.user._id,
    //             username:req.user.username
    //             };
    var newPet={name:name, image:image, description:description};
    Pets.create(newPet, function(err, newCreated){
        if(err){
            log("err")
        } else{
            res.redirect("/");
        }
    });

})



app.listen(3001, function(){
    console.log("SERVER STARTED")
});