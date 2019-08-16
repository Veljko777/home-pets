var express= require("express");
var app=express();
var mongoose=require("mongoose");
var bodyParser=require("body-parser");



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
    res.render("landing")
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



app.listen(3000, function(){
    console.log("SERVER STARTED")
});