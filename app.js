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
    var confirmEmail = document.getElementById("confirm_email_field_signup").value;
    var confirmPassword = document.getElementById("confirm_password_field_signup").value;

    if (email !== confirmEmail) {
        alert("Emails do not match.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

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
    var name = document.getElementById("name_field").value;
    var age = document.getElementById("age_field").value;
    var yearOfBirth = document.getElementById("year_of_birth_field").value;
    var about = document.getElementById("about_field").value;
    var englishFluency = document.getElementById("english_fluency_field").value;
    var linkedin = document.getElementById("linkedin_field").value;
    var facebook = document.getElementById("facebook_field").value;
    var golfAssociation = document.getElementById("golf_association_field").value;
    var ghinAssociationNumber = document.getElementById("ghin_association_number_field").value;
    var golfIndex = document.querySelector('input[name="golf_index"]:checked').value;
    var email = auth.currentUser.email;

    db.collection("users").doc(auth.currentUser.uid).set({
        name: name,
        age: age,
        yearOfBirth: yearOfBirth,
        about: about,
        englishFluency: englishFluency,
        linkedin: linkedin,
        facebook: facebook,
        golfAssociation: golfAssociation,
        ghinAssociationNumber: ghinAssociationNumber,
        golfIndex: golfIndex,
        email: email
    })
        .then(() => {
            console.log("Information saved successfully");
            window.location.href = "profile.html"; // Redirect to the profile page
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
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

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
function searchGolfClubs() {
    var searchField = document.getElementById("search_club_field").value.toLowerCase();
    var searchResult = document.getElementById("search_club_result");

    // Clear previous search results
    searchResult.innerHTML = "";

    var clubs = ["Saint Andrews Golf Club -NY", "North Hills Country Club (NY)", "Cold Springs Country Club (NY)"];

    clubs.forEach((club) => {
        // Check if the club name contains the search term
        if (club.toLowerCase().includes(searchField)) {
            var li = document.createElement("li");
            li.textContent = club;
            li.onclick = function () {
                document.getElementById("search_club_field").value = this.textContent;
            };
            searchResult.appendChild(li);
        }
    });
}

function saveAndContinue(formId) {
    var email = auth.currentUser.email;
    var data = { email: email };

    if (formId === 'form') {
        // Get data from form.html
        data.name = document.getElementById("name_field").value;
        // data.age = document.getElementById("age_field").value; // This line is commented out
        data.yearOfBirth = document.getElementById("year_of_birth_field").value;
        data.about = document.getElementById("about_field").value;
        data.englishFluency = document.getElementById("english_fluency_field").value;
        data.linkedin = document.getElementById("linkedin_field").value;
        data.facebook = document.getElementById("facebook_field").value;
        data.golfAssociation = document.getElementById("golf_association_field").value;
        data.ghinAssociationNumber = document.getElementById("ghin_association_number_field").value;
        data.golfIndex = document.getElementById("golf_index_field").value; // Fetch the value of the "Golf Index" field
    } else if (formId === 'form-2') {
        // Get data from form-2.html
        data.golfClub = document.getElementById("search_club_field").value;
        data.membershipPrivileges = document.getElementById("membership_privileges_field").value;
        data.proximity = document.getElementById("proximity_field").value;
    }


    db.collection("users").doc(auth.currentUser.uid).set(data, { merge: true }) // Use merge: true to avoid overwriting existing data
        .then(() => {
            console.log("Information saved successfully");
            if (formId === "form-2") {
                window.location.href = "review.html"; // Redirect to the review page
            } else {
                // Redirect to the next form
                var nextFormId = getNextFormId(formId);
                if (nextFormId) {
                    window.location.href = nextFormId + ".html";
                } else {
                    console.log("No next form found");
                }
            }
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
}

function getNextFormId(currentFormId) {
    // Define the order of the forms
    var formOrder = ["form", "form-2", "form-3"]; // Add more form IDs if needed

    // Find the index of the current form ID
    var currentIndex = formOrder.indexOf(currentFormId);

    // Return the next form ID if available
    if (currentIndex !== -1 && currentIndex < formOrder.length - 1) {
        return formOrder[currentIndex + 1];
    }

    return null; // Return null if there is no next form
}

function clearSearch() {
    var searchField = document.getElementById("search_field");
    var searchResult = document.getElementById("search_result");

    // Clear the search field and the search results
    searchField.value = "";
    searchResult.innerHTML = "";
}

function sortResults() {
    var sortField = document.getElementById("sort").value;
    var searchResult = document.getElementById("search_result");

    // Get the search results
    var results = Array.from(searchResult.children);

    // Sort the results based on the selected field
    results.sort((a, b) => {
        var aValue = a.querySelector(`strong:contains(${sortField}):`).nextSibling.nodeValue.trim();
        var bValue = b.querySelector(`strong:contains(${sortField}):`).nextSibling.nodeValue.trim();

        if (aValue < bValue) {
            return -1;
        } else if (aValue > bValue) {
            return 1;
        } else {
            return 0;
        }
    });

    // Clear the search results
    searchResult.innerHTML = "";

    // Append the sorted results
    results.forEach((result) => {
        searchResult.appendChild(result);
    });
}

function filterResults() {
    var filterField = document.getElementById("filter").value;
    var searchResult = document.getElementById("search_result");

    // Get the search results
    var results = Array.from(searchResult.children);

    // Filter the results based on the selected field
    results = results.filter((result) => {
        var value = result.querySelector(`strong:contains(${filterField}):`).nextSibling.nodeValue.trim();
        return value !== 'N/A'; // Change this condition based on your requirements
    });

    // Clear the search results
    searchResult.innerHTML = "";

    // Append the filtered results
    results.forEach((result) => {
        searchResult.appendChild(result);
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
                // Check if any field contains the search term
                for (var key in data) {
                    if (data[key].toLowerCase().includes(searchField)) {
                        // doc.data() is never undefined for query doc snapshots
                        var li = document.createElement("li");
                        li.innerHTML = `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${data[key]}`;
                        searchResult.appendChild(li);
                        break; // Break the loop as soon as a match is found
                    }
                }
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the form from being submitted normally
        login();
    });
});
