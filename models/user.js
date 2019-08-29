var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");
var UserSchema=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    picture:String,
    firstname:String,
    lastname:String,
    pets:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Pets"
    }]
    
});
UserSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User", UserSchema);