function tagSub() {
    
    if( document.getElementById("subs").innerHTML == "Subscribe") {
        document.getElementById("subs").innerHTML = "Unsubscribe";
    } else {
        document.getElementById("subs").innerHTML = "Subscribe";
    }
}