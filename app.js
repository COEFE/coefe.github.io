// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAUiT9QFqvFXV3hIDzvmEiTiuGbvzfiGIY",
    authDomain: "test-project1-94897.firebaseapp.com",
    projectId: "test-project1-94897",
    storageBucket: "test-project1-94897.appspot.com",
    messagingSenderId: "484667057950",
    appId: "1:484667057950:web:2ac69f2fe61d2087b2cb0f",
    measurementId: "G-JD82DNZ99P"
};

// Initialize Firebase
var app = firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();

function signup() {
    var email = document.getElementById("email_field_signup").value;
    var password = document.getElementById("password_field_signup").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            var user = userCredential.user;
            // Redirect to the information form
            window.location.href = "form.html";
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
        });
}

function submitInfo() {
    console.log("submitInfo called")
    var name = document.getElementById("name_field").value;
    var age = document.getElementById("age_field").value;
    var email = auth.currentUser.email;  // Get email from the current user

    db.collection("users").doc(auth.currentUser.uid).set({
        name: name,
        age: age,
        email: email  // Add email to the submitted information
    })
        .then(() => {
            // Information saved, redirect to user profile page
            console.log("Information saved successfully");
            window.location.replace("profile.html");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
}

function searchUsers() {
    var searchField = document.getElementById("search_field").value.toLowerCase();
    var searchResult = document.getElementById("search_result");

    // Clear previous search results
    searchResult.innerHTML = "";

    db.collection("users")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var data = doc.data();
                // Check if the name contains the search term
                if (data.name.toLowerCase().includes(searchField)) {
                    // doc.data() is never undefined for query doc snapshots
                    var li = document.createElement("li");
                    li.innerHTML = `<strong>Name:</strong> ${data.name}<br> 
                                    <strong>Age:</strong> ${data.age}<br> 
                                    <strong>Email:</strong> ${data.email}`;
                    searchResult.appendChild(li);
                }
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

function login() {
    var email = document.getElementById("email_field").value;
    var password = document.getElementById("password_field").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            // Store the user's email in the local storage
            localStorage.setItem('userEmail', user.email);
            // Check if the user's information exists
            db.collection("users").doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        // The user's information exists, redirect to the profile page
                        window.location.href = "profile.html";
                    } else {
                        // The user's information doesn't exist, show the information form
                        var infoFormDiv = document.getElementById("info_form_div");
                        var loginDiv = document.getElementById("login_div");
                        if (infoFormDiv) infoFormDiv.style.display = "block";
                        if (loginDiv) loginDiv.style.display = "none";
                    }
                })
                .catch((error) => {
                    console.error("Error getting document: ", error);
                });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
        });
}

function logout() {
    auth.signOut().then(() => {
        // Signed out, show the login div
        var userDiv = document.getElementById("user_div");
        var infoFormDiv = document.getElementById("info_form_div");
        var loginDiv = document.getElementById("login_div");
        if (userDiv) userDiv.style.display = "none";
        if (infoFormDiv) infoFormDiv.style.display = "none";
        if (loginDiv) loginDiv.style.display = "block";
    }).catch((error) => {
        // An error happened.
        alert(error.message);
    });
}
