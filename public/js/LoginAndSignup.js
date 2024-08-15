document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();
        if (this.checkValidity()) {
            logInCapture();
        } else {
            console.log("Form validation failed.");
        }
    });

    document.getElementById("signInForm").addEventListener("submit", function(event) {
        event.preventDefault();
        if (this.checkValidity()) {
            signInCapture();
        } else {
            console.log("Form validation failed.");
        }
    });
});

function signInCapture() {
    var csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    var email = document.getElementById('email').value;
    var lastName = document.getElementById('last_name').value;
    var firstName = document.getElementById('first_name').value;
    var password = document.getElementById('password').value;
    if(email=="" || password=="" || lastName=="" || firstName==""){
        alert("All fields are mandatory");
        return;
    }
    var userData = {
        "emailId": email,
        "lastName": lastName,
        "firstName": firstName,
        "password": password
    };
    $.ajax({
        url: '/vav/users',  // URL for sign-in endpoint
        type: 'POST',
        contentType: 'application/json',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: JSON.stringify(userData),
        success: function(response) {
           location.reload();
        },
        error: function(xhr) {
            alert(xhr.responseJSON.message);
        }
    });
}

function logInCapture() {
    var csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    var email = document.getElementById('login_email').value;
    var password = document.getElementById('login_password').value;
    if(email=="" || password==""){
        alert("Email and password is required");
        return;
    }
    var loginData = {
        "emailId": email,
        "password": password
    };

    $.ajax({
        url: '/vav/users/login',  // URL for login endpoint
        type: 'POST',
        contentType: 'application/json',
        headers: {
            'X-CSRFToken': csrfToken
        },
        data: JSON.stringify(loginData),
        success: function(response) {
            window.location.href = response.baseURL + 'vav/exptracker'
        },
        error: function(xhr) {
            alert(xhr.responseJSON.message);
        }
    });
}

function showLoginForm() {
    document.getElementById('signup_form').style.display = 'none';
    document.getElementById('login_form').style.display = 'block';
}

function showSignInForm() {
    document.getElementById('login_form').style.display = 'none';
    document.getElementById('signup_form').style.display = 'block';
}