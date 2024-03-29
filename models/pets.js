var mongoose=require("mongoose");
var petSchema=new mongoose.Schema({
    name: String,
    date:String,
    species:String,
    breed:String,
    image:String,
    description:String,
    author:{
       id:{
             type:mongoose.Schema.Types.ObjectId,
            ref:"User"
            },
        username:String},
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }],
    
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Like"
    }]
    
    
})
module.exports=mongoose.model("Pets",petSchema);