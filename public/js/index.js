// Get all post containers
const postContainers = document.querySelectorAll(".col-11");
console.log(postContainers);




document.addEventListener("DOMContentLoaded", function() {
    // Get the query parameter from the URL
    var queryParams = new URLSearchParams(window.location.search);
    var msg = queryParams.get("msg");
    // Check if the message is "logout" and display the logout message
    if (msg === "logout") {
        $('#logoutModal').modal('show');

        setTimeout(function() {
            $('#logoutModal').modal('hide');
        }, 1500)
    }
});

function redirectToPage(url) {
    window.location.href = url;
}

// For upvotes, downvotes and vote amount
// Attach event listeners to each post container
postContainers.forEach((container) => {

    const upvoteBtn = container.querySelector(".upvote-btn");
    const downvoteBtn = container.querySelector(".downvote-btn");
    const upvoteAmnt = container.querySelector("#upvote-amnt");
    const downvoteAmnt = container.querySelector("#downvote-amnt");
    const styleUpvoteAmnt = container.querySelector("#upvote-amnt");
    const styleDownvoteAmnt = container.querySelector("#downvote-amnt");

    upvoteBtn.addEventListener("click", function () {
        
    $.ajax({
        url: '/home/up/'+ $(this).closest(".votes-cont").find("#this_post_id").val(), 
        method: 'POST',
        success: function(data) {
         console.log(data.message);

         if (downvoteBtn.classList.contains('fa-solid')) {
            downvoteAmnt.textContent = parseInt(downvoteAmnt.textContent) - 1;
            upvoteAmnt.textContent = parseInt(upvoteAmnt.textContent) + 1;

            upvoteBtn.classList.remove("fa-regular");
            upvoteBtn.classList.add("fa-solid");
            downvoteBtn.classList.add("fa-regular");
            downvoteBtn.classList.remove("fa-solid");
        } else if (upvoteBtn.classList.contains('fa-regular')) {
            upvoteAmnt.textContent = parseInt(upvoteAmnt.textContent) + 1;
            upvoteAlready = true;

            upvoteBtn.classList.remove("fa-regular");
            upvoteBtn.classList.add("fa-solid");
            downvoteBtn.classList.add("fa-regular");
            downvoteBtn.classList.remove("fa-solid");
        }
        else {
            upvoteAmnt.textContent = parseInt(upvoteAmnt.textContent) - 1;
            upvoteAlready = false;

            upvoteBtn.classList.remove("fa-solid");
            upvoteBtn.classList.add("fa-regular");
        }

        styleUpvoteAmnt.style.fontWeight = "bold";
        styleDownvoteAmnt.style.fontWeight = "bold";
        },
        error: function(error) {
          console.error('Error submitting form:', error);
        }

    });
        
    });

    downvoteBtn.addEventListener("click", function () {
              
            $.ajax({
                url: '/home/down/'+ $(this).closest(".votes-cont").find("#this_post_id").val(), 
                method: 'POST',
                success: function(data) {
                console.log(data.message);
                if (upvoteBtn.classList.contains('fa-solid')) {
                    upvoteAmnt.textContent = parseInt(upvoteAmnt.textContent) - 1;
                    downvoteAmnt.textContent = parseInt(downvoteAmnt.textContent) + 1;
                    downvoteAlready = true;
                    upvoteAlready = false;

                    downvoteBtn.classList.remove("fa-regular");
                    downvoteBtn.classList.add("fa-solid");
                    upvoteBtn.classList.add("fa-regular");
                    upvoteBtn.classList.remove("fa-solid");
                } else if (downvoteBtn.classList.contains('fa-regular')) {
                    downvoteAmnt.textContent = parseInt(downvoteAmnt.textContent) + 1;
                    downvoteAlready = true;

                    downvoteBtn.classList.remove("fa-regular");
                    downvoteBtn.classList.add("fa-solid");
                    upvoteBtn.classList.add("fa-regular");
                    upvoteBtn.classList.remove("fa-solid");
                }
                else {
                    downvoteAmnt.textContent = parseInt(downvoteAmnt.textContent) - 1;
                    downvoteAlready = false;

                    downvoteBtn.classList.remove("fa-solid");
                    downvoteBtn.classList.add("fa-regular");
                }
                styleUpvoteAmnt.style.fontWeight = "bold";
                styleDownvoteAmnt.style.fontWeight = "bold";
            }, error: function(error) {
                console.error('Error submitting form:', error);
              }
         });
    });
});