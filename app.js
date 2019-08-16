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
    var pets=[
        {
            name:"Something 1",
            image:"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
            description:"This is a great dog"
        },
        {
            name:"Something 2",
            image:"https://images.pexels.com/photos/6886/dog-puppy-tumblr-puppylove.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
            description:"I love this dog so much!!!!!!!"
        },
        {
            name:"Something 2",
            image:"https://images.pexels.com/photos/69372/pexels-photo-69372.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
            description:"dog dog dog dog dog dog dog"
        }
    ];

    res.render("landing", {pets:pets})
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
    res.send("you tried to add")
})



app.listen(3001, function(){
    console.log("SERVER STARTED")
});