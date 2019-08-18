var mongoose=require("mongoose");
var petsSchema=new mongoose.Schema({
    name: String,
    image:String,
    description:String,
    // author:{
    //         id:{
    //             type:mongoose.Schema.Types.ObjectId,
    //             ref:"User"
    //             }
    //         }
})
module.exports=mongoose.model("Pets",petsSchema);