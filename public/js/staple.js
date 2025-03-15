const register_btn = document.getElementById('register-btn');

function copyLink(url) {
    navigator.clipboard.writeText(url);
    $('#copyLinkModal').modal('show');

    setTimeout(function() {
        $('#copyLinkModal').modal('hide');
    }, 1500)
}



function convertDateToTxt() {
    const date = new Date();
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
    
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();

    // Format the date
    let formattedDate = monthNames[month] + " " + day + ", " + year;
    
    return formattedDate;

}

$("#username").on('keyup', async function (){
    const getUsername = $("#username").val();
    const response = await fetch ('/findUser?user=' + getUsername, {
        method: 'GET'
    });

    if (response.status == 400){
        $("#username-msg").css('display','block');
        $('#username-msg').addClass('alert-danger');
        $("#username-msg").text('Username is already in use');
        register_btn.ariaDisabled = true;
        register_btn.disabled = true;
    } else if (response.status == 200){
        $("#username-msg").css('display','none');
        register_btn.ariaDisabled = false;
        register_btn.disabled = false;
    }
});

$("#email-reg").on('keyup', async function (){
    const getEmail = $("#email-reg").val();
    const response = await fetch ('/verifyEmail?email=' + getEmail, {
        method: 'GET'
    });
    
    switch (response.status){
        case 400: 
            $("#email-msg").css('display','block');
            $('#email-msg').addClass('alert-danger');
            $("#email-msg").text('Email is already in use');
            register_btn.ariaDisabled = true;
            register_btn.disabled = true;
            break;
        case 422: 
            $("#email-msg").css('display','block');
            $('#email-msg').addClass('alert-danger');
            $("#email-msg").text('Invalid email.');
            register_btn.ariaDisabled = true;
            register_btn.disabled = true;
            break;
        case 200:
            $("#email-msg").css('display','none');
            register_btn.ariaDisabled = false;
            register_btn.disabled = false;
            break;
    }
});


$("#toggle-pass-log").click(function () {
    if($("#password-log").prop('type') == 'text'){
        $("#password-log").prop("type", "password");
        $('#toggle-pass-log').addClass( "fa-eye-slash" );
        $('#toggle-pass-log').removeClass( "fa-eye" );
    }else if($("#password-log").prop('type') == 'password'){
        $("#password-log").prop("type", "text");
        $('#toggle-pass-log').removeClass( "fa-eye-slash" );
        $('#toggle-pass-log').addClass( "fa-eye" );
    }
});


$("#toggle-pass-reg").click(function () {
    if($("#password-reg").prop('type') == 'text'){
        $("#password-reg").prop("type", "password");
        $('#toggle-pass-reg').addClass( "fa-eye-slash" );
        $('#toggle-pass-reg').removeClass( "fa-eye" );
    }else if($("#password-reg").prop('type') == 'password'){
        $("#password-reg").prop("type", "text");
        $('#toggle-pass-reg').removeClass( "fa-eye-slash" );
        $('#toggle-pass-reg').addClass( "fa-eye" );
    }
});

$("#toggle-pass-con").click(function () {
    if($("#confirm-password").prop('type') == 'text'){
        $("#confirm-password").prop("type", "password");
        $('#toggle-pass-con').addClass( "fa-eye-slash" );
        $('#toggle-pass-con').removeClass( "fa-eye" );
    }else if($("#confirm-password").prop('type') == 'password'){
        $("#confirm-password").prop("type", "text");
        $('#toggle-pass-con').removeClass( "fa-eye-slash" );
        $('#toggle-pass-con').addClass( "fa-eye" );
    }
});

$('#password-reg, #confirm-password').on('keyup', function () {

    if ($('#password-reg').val() == $('#confirm-password').val() && $('#password-reg').val() != "") {
        $('#pass-msg').css('display', 'none');
        $('#pass-msg').removeClass('alert-danger');
        register_btn.ariaDisabled = false;
        register_btn.disabled = false;
    } else  {
        $('#pass-msg').css('display', 'block');
        $('#pass-msg').addClass('alert-danger');
        $('#pass-msg').text('Not matching password');
        register_btn.ariaDisabled = true;
        register_btn.disabled = true;
    }
  });


//   $("#logout-btn").click(function (e) {
//     e.preventDefault();

//     $("#logoutModal").modal('show');

//     setTimeout(function() {
//         window.location.href = "/home";
//       }, 2000);
// });

$("#logout-btn").click(function() {
    // Redirect to the logout route to destroy the session
    $.ajax({
      url: '/logout',
      method: 'GET',
      success: function() {
        $("#logoutModal").modal('show');

        // Redirect to the home page after a short delay
        setTimeout(function() {
          window.location.href = "/home";
        }, 2000);
      },
      error: function(error) {
        console.error('Error logging out:', error);
      }
    });
  });


  $("#register-btn").click(function (e) {
    e.preventDefault();
    if ($('#password-reg').val() != $('#confirm-password').val()) {
        $('#pass-msg').addClass('alert-danger');
        $('#pass-msg').removeClass('alert-success');
        $('#pass-msg').text('Ensure your passwords are the same before registering.');
    } else if ($("#register-btn").disabled == true) {
        $('#pass-msg').text('Invalid log-in.');
    }else {
        const formData = $('#register-user').serialize();

        // Send the form data to the server using AJAX
        $.ajax({
          url: '/', 
          method: 'POST',
          data: formData,
          success: function(data) {
            $('#pass-msg').text(data.message); 

            setTimeout(function() {
              window.location = "/user/"+data.username;
            }, 2000);
          },
          error: function(error) {
            console.error('Error submitting form:', error);
          }
        });
     
    }
});

function subUnsub(tagIdValue, action) {

    $.ajax({
        url: '/subscribe',
        method: 'POST',
        data: { 
                subscribe: tagIdValue, 
                action: action},
        success: function(data) {
          console.log("THIS IS", data.message); // Optionally, handle success response
          //if window location at user, add user tag
        },
        error: function(error) {
          console.error('Error subscribing:', error); // Optionally, handle error response
        }
      });
}

$(".tag-subscribe").click(function (e) {
    e.preventDefault();
    
    const tagIdValue = $(this).closest(".tag-subscribe").prev(".tag_pop_id").val();
    const action = $(this).text();
    
    subUnsub(tagIdValue, action);
});

$(".tag-post-hd").click(function (e) {

    e.preventDefault();
    
    const tagIdValue = $("#header-tag-specific").text().replace("#", "");
    const action = $(this).find('#tag-specific-subs').text();
    subUnsub(tagIdValue, action);

    if( document.getElementById("tag-specific-subs").innerHTML == "Subscribe") {
        document.getElementById("tag-specific-subs").innerHTML = "Unsubscribe";
    } else {
        document.getElementById("tag-specific-subs").innerHTML = "Subscribe";
    }

});


// TODO: Implement on the email for logging as well, but with 
// different email validation
$("#login-btn").click(function (e) {
    e.preventDefault();

    const formData = $('#login-user').serialize();

    // Send the form data to the server using AJAX
    $.ajax({
        url: '/', 
        method: 'POST',
        data: formData,
        success: function(data) {     
        $('#login-msg').css('display', 'block');
        $('#login-msg').removeClass('alert-danger');
        $('#login-msg').addClass('alert-success');
        $('#login-msg').text('Successful login. You will be redirected shortly.'); 
        setTimeout(function() {
            // Handle the redirect using JavaScript
            window.location = "/user/" + data.username;
            }, 2000);
            },
        error: function(error) {
        console.error('Error submitting form:', error);
        $('#login-msg').css('display', 'block');
        $('#login-msg').removeClass('alert-success');
        $('#login-msg').addClass('alert-danger');
        $('#login-msg').text('Invalid credentials'); 
        }
    });
     
});


// Get all popular tag containers
const popularTagContainers = document.querySelectorAll(".popular-taglist");

popularTagContainers.forEach((container) => {
    const tag = container.querySelector(".tag-subscribe");

    tag.addEventListener("click", function () {
        if (tag.textContent === "Subscribe") {
            tag.textContent = "Unsubscribe";
        }
        else {
            tag.textContent = "Subscribe";
        }
    });
});