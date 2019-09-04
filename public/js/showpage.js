
document.getElementById('comment_textarea').onkeyup = function () {
    if(this.value.length>0){
        document.getElementById("comment_btn").disabled=false;
        document.getElementById("comment_btn").style.opacity="1";}
    else{

        document.getElementById("comment_btn").disabled=true;
        document.getElementById("comment_btn").style.opacity="0.5";
        
        
    }};


 