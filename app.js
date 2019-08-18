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






app.listen(3001, function(){
    console.log("SERVER STARTED")
});