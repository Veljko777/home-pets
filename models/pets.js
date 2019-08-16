var mongoose=require("mongoose");
var petsSchema=new mongoose.Schema([
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
])
module.exports=mongoose.model("Pets",petsSchema);