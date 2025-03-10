const userPostContainers = document.querySelectorAll(".post-user");
const userCommentContainers = document.querySelectorAll(".post-comment");

var imageSrc = ""; 

var loadFile = function (event) {
    var image = document.getElementById("edit-pfp");
    image.src = URL.createObjectURL(event.target.files[0]);
    document.getElementById("edit-pfp-bg").style.backgroundImage = "url(" + URL.createObjectURL(event.target.files[0]) + ")"
    imageSrc = URL.createObjectURL(event.target.files[0]);
};

var backLoad = function (event) {

    var image = document.getElementById("edit-pfp");
    image.src =  $("#upfp").attr('src')
    document.getElementById("edit-pfp-bg").style.backgroundImage = "url("+$("#upfp").attr('src')+")"
    document.getElementById("bio-area").value = $("#bio-user").text();
};


// For upvotes, downvotes and vote amount
// Attach event listeners to each post container
userPostContainers.forEach((container) => {

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

// For upvotes, downvotes and vote amount
// Attach event listeners to each post container
userCommentContainers.forEach((container) => {

  const upvoteBtn = container.querySelector(".upvote-btn");
  const downvoteBtn = container.querySelector(".downvote-btn");
  const upvoteAmnt = container.querySelector("#upvote-amnt");
  const downvoteAmnt = container.querySelector("#downvote-amnt");
  const styleUpvoteAmnt = container.querySelector("#upvote-amnt");
  const styleDownvoteAmnt = container.querySelector("#downvote-amnt");

  upvoteBtn.addEventListener("click", function () {
    var form = {"comment_id":  $(this).closest(".votes-cont").find("#this_comment_id").val()};

  $.ajax({
      url: '/post/up_comment', 
      method: 'POST',
      data: form,
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
            
    var form = {"comment_id":  $(this).closest(".votes-cont").find("#this_comment_id").val()};
    
          $.ajax({
              url: '/post/down_comment', 
              method: 'POST',
              data: form,
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


$("#edit-profile-btn").click(function (e) {
    // if (imageSrc !== "") {  // Check if an image URL is present
    //     var image = document.getElementById("upfp");
    //     image.src = imageSrc;  // Set the image source to the stored URL
    //   }
    //   document.getElementById("bio-user").textContent = document.getElementById("bio-area").value;

    e.preventDefault();

    // Create a new FormData object
    var formData = new FormData();

    formData.append('bio_area', $('#bio-area').val());
  
    var fileInput = $('#getImg')[0].files[0];
    if (fileInput) {
      formData.append('getImg', fileInput);
    }
      // Send the form data to the server using AJAX
      $.ajax({
        url: '/user/'+$('#username-edit').val(), 
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
         if(data.message == 'success') {
            if (data.profile_image) {
                $('#upfp').attr('src', data.profile_image);
              }
        
              // Update the profile bio if it exists in the response
              if (data.profile_bio) {
                $('#bio-user').text(data.profile_bio);
              }
         } 
        },
        error: function(error) {
          console.error('Error submitting form:', error);
        }
      });
   
});

var logoutButton = document.getElementById("logout-btn");

$(document).ready(function() {
    $('.tag-group').click(function() {
      window.location.href = 'view-tag.html';
    });
});