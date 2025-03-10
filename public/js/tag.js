/*
let upvote = document.querySelector("#upvote-btn");
let downvote = document.querySelector("#downvote-btn");
let vote = document.querySelector(".left-bar-header").innerText;

let upvoteAlready = false;
let downvoteAlready = false;

upvote.addEventListener("click", function(){

    if (downvoteAlready && !upvoteAlready){
        
        document.querySelector("#vote-ctr").innerText = parseInt(vote) + 2;
        upvoteAlready = true;
        downvoteAlready = false;
    }
    else if (!upvoteAlready){
        
        document.querySelector("#vote-ctr").innerText = parseInt(vote) + 1;        
        upvoteAlready = true;
    }

    
    vote = document.querySelector("#vote-ctr").innerText;
    upvote.classList.add("fa-solid");
    upvote.classList.remove("fa-regular");
    downvote.classList.add("fa-regular");
    downvote.classList.remove("fa-solid");
    
    
});


downvote.addEventListener("click", function(){

    if (upvoteAlready && !downvoteAlready){
        document.querySelector("#vote-ctr").innerText = parseInt(vote) - 2;
        upvoteAlready = false;
        downvoteAlready = true;

    }
    else if (!downvoteAlready){
        document.querySelector("#vote-ctr").innerText = parseInt(vote) - 1; 
        downvoteAlready = true;
    }

    vote = document.querySelector("#vote-ctr").innerText;
    downvote.classList.remove("fa-regular");
    downvote.classList.add("fa-solid");
    upvote.classList.add("fa-regular");
    upvote.classList.remove("fa-solid");
    
    
});
*/

// Get all left-bar-header elements
const leftBarHeaders = document.querySelectorAll(".left-bar-header");

// Add event listener to each left-bar-header element
leftBarHeaders.forEach((leftBarHeader) => {
    const upvoteBtn = leftBarHeader.querySelector(".upvote-btn");
    const downvoteBtn = leftBarHeader.querySelector(".downvote-btn");
    const voteAmnt = leftBarHeader.querySelector(".vote-amnt");
    const styleVoteAmnt = leftBarHeader.querySelector(".vote-amnt");


    upvoteBtn.addEventListener("click", async function () {

        $.ajax({
            url: '/tag/up/' + $(this).closest(".left-bar-header").find("#post_id").val(), 
            method: 'POST',
            success: function(data) {
             console.log(data.message);
             if (downvoteBtn.classList.contains('fa-solid')) {
                voteAmnt.textContent = parseInt(voteAmnt.textContent) + 2;
    
                upvoteBtn.classList.remove("fa-regular");
                upvoteBtn.classList.add("fa-solid");
                downvoteBtn.classList.add("fa-regular");
                downvoteBtn.classList.remove("fa-solid");
            } else if (upvoteBtn.classList.contains('fa-regular')) {
                voteAmnt.textContent = parseInt(voteAmnt.textContent) + 1;
    
                upvoteBtn.classList.remove("fa-regular");
                upvoteBtn.classList.add("fa-solid");
                downvoteBtn.classList.add("fa-regular");
                downvoteBtn.classList.remove("fa-solid");
            }
            else {
                voteAmnt.textContent = parseInt(voteAmnt.textContent) - 1;
        
                upvoteBtn.classList.remove("fa-solid");
                upvoteBtn.classList.add("fa-regular");
            }
            },
            error: function(error) {
              console.error('Error submitting form:', error);
            }
          });

       

        styleVoteAmnt.style.fontWeight = "bold";
    });

    downvoteBtn.addEventListener("click", function () {
        
        $.ajax({
            url: '/tag/down/' + $(this).closest(".left-bar-header").find("#post_id").val(), 
            method: 'POST',
            success: function(data) {
             console.log(data.message);

             if (upvoteBtn.classList.contains('fa-solid')) {
                voteAmnt.textContent = parseInt(voteAmnt.textContent) - 2;
                downvoteBtn.classList.remove("fa-regular");
                downvoteBtn.classList.add("fa-solid");
                upvoteBtn.classList.add("fa-regular");
                upvoteBtn.classList.remove("fa-solid");
            } else if (downvoteBtn.classList.contains('fa-regular')) {
                voteAmnt.textContent = parseInt(voteAmnt.textContent) - 1;
                downvoteAlready = true;
    
                downvoteBtn.classList.remove("fa-regular");
                downvoteBtn.classList.add("fa-solid");
                upvoteBtn.classList.add("fa-regular");
                upvoteBtn.classList.remove("fa-solid");
            }
            else {
                voteAmnt.textContent = parseInt(voteAmnt.textContent) + 1;
                downvoteAlready = false;
    
                downvoteBtn.classList.remove("fa-solid");
                downvoteBtn.classList.add("fa-regular");
            }
    
            styleVoteAmnt.style.fontWeight = "bold";
            },
            error: function(error) {
              console.error('Error submitting form:', error);
            }
          });

       
    });
});