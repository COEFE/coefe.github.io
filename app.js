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

auth.onAuthStateChanged((user) => {
    if (!user && !window.location.href.endsWith('login.html')) {
        // User is not signed in and the current page is not the login page, redirect to the login page
        window.location.href = "login.html";
    }
});

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

function createGolfEvent() {
    var golfClub = document.getElementById("golf_club_field").value;
    var people = document.getElementById("people_field").value;
    var dateTime = document.getElementById("date_time_field").value;

    db.collection("events").add({
        golfClub: golfClub,
        people: people,
        dateTime: dateTime,
        userId: auth.currentUser.uid,
        userName: currentUserData.name, // Include the user's name
        status: "open" // The status is "open" when the event is created
    })
        .then((docRef) => {
            console.log("Event created with ID: ", docRef.id);
            window.location.href = "profile.html"; // Redirect to the profile page
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
}

function loadEvents() {
    var searchResult = document.getElementById("search_result");
    var pendingReview = document.getElementById("pending_review");
    var approved = document.getElementById("approved");

    // Check if the search_result element exists
    if (searchResult && pendingReview && approved) {
        // Clear the previous events
        searchResult.innerHTML = "";
        pendingReview.innerHTML = "";
        approved.innerHTML = "";

        db.collection("events")
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var data = doc.data();
                    var li = document.createElement("li");
                    li.setAttribute("data-id", doc.id); // Assign the document ID to the li element

                    var golfClub = document.createElement("span");
                    golfClub.textContent = `Golf Club: ${data.golfClub}`;
                    li.appendChild(golfClub);
                    li.appendChild(document.createElement("br"));

                    var people = document.createElement("span");
                    people.textContent = `People: ${data.people}`;
                    li.appendChild(people);
                    li.appendChild(document.createElement("br"));

                    // Remove this line to not show the date and time
                    // var dateTime = document.createElement("span");
                    // dateTime.textContent = `Date and Time: ${data.dateTime}`;
                    // li.appendChild(dateTime);

                    // Add this line to show the creator of the event
                    var creator = document.createElement("span");
                    creator.textContent = `Creator: ${data.userName}`;
                    li.appendChild(creator);

                    li.style.marginBottom = "10px"; // Add some space between the events

                    // Only add the delete button if the current user is the creator of the event
                    if (data.userId === auth.currentUser.uid) {
                        var deleteButton = document.createElement("button");
                        deleteButton.textContent = "Delete";
                        deleteButton.classList.add("button-delete");
                        deleteButton.onclick = function () {
                            db.collection("events").doc(doc.id).delete().then(() => {
                                console.log("Event successfully deleted!");
                                li.remove(); // Remove the event from the list
                            }).catch((error) => {
                                console.error("Error removing document: ", error);
                            });
                        };
                        li.appendChild(deleteButton);
                    } else {
                        // The current user is not the creator of the event, add the signup button
                        var signupButton = document.createElement("button");
                        signupButton.textContent = "Sign Up";
                        signupButton.classList.add("button-signup");
                        signupButton.onclick = function () {
                            signupForEvent(doc.id);
                        };
                        li.appendChild(signupButton);
                    }

                    // Add the event to the appropriate section based on its status
                    if (data.status === "open") {
                        searchResult.appendChild(li);
                    } else if (data.status === "pending") {
                        pendingReview.appendChild(li);
                    } else if (data.status === "approved") {
                        approved.appendChild(li);
                    }
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }
}


function saveAndContinue(formId) {
    var form = document.getElementById(formId);
    if (form) {
        var name = document.getElementById("name_field").value;
        var user = auth.currentUser;
        if (user) {
            user.updateProfile({
                displayName: name
            }).then(() => {
                console.log("Display name set to: " + user.displayName);
                // Save the name in Firestore
                db.collection("users").doc(user.uid).set({
                    name: name
                    // Add here other fields from the form
                }).then(() => {
                    console.log("User data saved in Firestore.");
                }).catch((error) => {
                    console.error("Error saving user data in Firestore: ", error);
                });
            }).catch((error) => {
                console.error("Error setting display name: ", error);
            });
        }
    }
}

function signupForEvent(eventId) {
    db.collection("signups").add({
        eventId: eventId,
        userId: auth.currentUser.uid,
        status: "pending"
    })
        .then((docRef) => {
            console.log("User signed up for event with ID: ", docRef.id);
            // You can add code here to update the UI or navigate to a different page
        })
        .catch((error) => {
            console.error("Error signing up for event: ", error);
        });
}
function loadSignups() {
    var pendingReview = document.getElementById("pending_review");

    // Check if the pending_review element exists
    if (pendingReview) {
        // Clear the previous signups
        pendingReview.innerHTML = "";

        db.collection("signups")
            .where("userId", "==", auth.currentUser.uid)
            .where("status", "==", "pending")
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var data = doc.data();

                    // Fetch the event document
                    db.collection("events").doc(data.eventId).get()
                        .then((eventDoc) => {
                            if (eventDoc.exists) {
                                var eventData = eventDoc.data();
                                var li = document.createElement("li");
                                li.setAttribute("data-id", doc.id); // Assign the document ID to the li element

                                var eventName = document.createElement("span");
                                eventName.textContent = `Event Name: ${eventData.golfClub}`; // Use the event name here
                                li.appendChild(eventName);
                                li.appendChild(document.createElement("br"));

                                var status = document.createElement("span");
                                status.textContent = `Status: ${data.status}`;
                                li.appendChild(status);

                                li.style.marginBottom = "10px"; // Add some space between the signups

                                pendingReview.appendChild(li);
                            } else {
                                console.log(`No such document! Document ID: ${data.eventId}`);
                            }
                        })
                        .catch((error) => {
                            console.log("Error getting document:", error);
                        });
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }
}
function signupForEvent(eventId) {
    db.collection("events").doc(eventId).get()
        .then((doc) => {
            var eventUserId = doc.data().userId;
            db.collection("signups").add({
                eventId: eventId,
                eventUserId: eventUserId, // The ID of the user who created the event
                userId: auth.currentUser.uid, // The ID of the user who is signing up
                userEmail: auth.currentUser.email, // The email of the user who is signing up
                userName: auth.currentUser.displayName, // The name of the user who is signing up
                status: "pending"
            })
                .then((docRef) => {
                    console.log("User signed up for event with ID: ", docRef.id);
                    loadSignups(); // Reload the signups after a new signup is created
                })
                .catch((error) => {
                    console.error("Error signing up for event: ", error);
                });
        })
        .catch((error) => {
            console.error("Error getting event: ", error);
        });
}



function loadSignupsForReview() {
    var reviewSignups = document.getElementById("review_signups");
    var approved = document.getElementById("approved");

    // Check if the review_signups element exists
    if (reviewSignups && approved) {
        // Clear the previous signups
        reviewSignups.innerHTML = "";
        approved.innerHTML = "";

        db.collection("signups")
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var data = doc.data();

                    // Fetch the event document
                    db.collection("events").doc(data.eventId).get()
                        .then((eventDoc) => {
                            if (eventDoc.exists) {
                                var eventData = eventDoc.data();

                                // Only show the signup if the current user is the creator of the event
                                if (eventData.userId === auth.currentUser.uid) {
                                    var li = document.createElement("li");
                                    li.setAttribute("data-id", doc.id); // Assign the document ID to the li element

                                    var eventName = document.createElement("span");
                                    eventName.textContent = `Event Name: ${eventData.golfClub}`; // Use the event name here
                                    li.appendChild(eventName);
                                    li.appendChild(document.createElement("br"));

                                    var userName = document.createElement("span");
                                    userName.textContent = `User Name: ${data.userName}`; // Use the user's name here
                                    li.appendChild(userName);
                                    li.appendChild(document.createElement("br"));

                                    var userEmail = document.createElement("span");
                                    userEmail.textContent = `User Email: ${data.userEmail}`; // Use the user's email here
                                    li.appendChild(userEmail);
                                    li.appendChild(document.createElement("br"));

                                    var status = document.createElement("span");
                                    status.textContent = `Status: ${data.status}`;
                                    li.appendChild(status);

                                    if (data.status === "pending") {
                                        var approveButton = document.createElement("button");
                                        approveButton.textContent = "Approve";
                                        approveButton.onclick = function () {
                                            approveSignup(doc.id);
                                        };
                                        li.appendChild(approveButton);

                                        var rejectButton = document.createElement("button");
                                        rejectButton.textContent = "Reject";
                                        rejectButton.onclick = function () {
                                            rejectSignup(doc.id);
                                        };
                                        li.appendChild(rejectButton);

                                        li.style.marginBottom = "10px"; // Add some space between the signups
                                        reviewSignups.appendChild(li);
                                    } else if (data.status === "approved") {
                                        li.style.marginBottom = "10px"; // Add some space between the signups
                                        approved.appendChild(li);
                                    }
                                }
                            } else {
                                console.log("No such document!");
                            }
                        })
                        .catch((error) => {
                            console.log("Error getting document:", error);
                        });
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }
}



function approveSignup(signupId) {
    db.collection("signups").doc(signupId).update({
        status: "approved"
    })
        .then(() => {
            console.log("Signup approved with ID: ", signupId);
            loadSignupsForReview();
            loadUpcomingEvents();
        })
        .catch((error) => {
            console.error("Error approving signup: ", error);
        });
}



function rejectSignup(signupId) {
    db.collection("signups").doc(signupId).update({
        status: "rejected"
    })
        .then(() => {
            console.log("Signup rejected with ID: ", signupId);
            loadSignupsForReview(); // Reload the signups for review after a signup is rejected
        })
        .catch((error) => {
            console.error("Error rejecting signup: ", error);
        });
}
function loadUpcomingEvents() {
    var upcomingEvents = document.getElementById("upcoming_events");

    // Check if the upcoming_events element exists
    if (upcomingEvents) {
        // Clear the previous events
        upcomingEvents.innerHTML = "";

        db.collection("signups")
            .where("userId", "==", auth.currentUser.uid)
            .where("status", "==", "approved") // Only get signups that are approved
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var data = doc.data();

                    // Fetch the event document
                    db.collection("events").doc(data.eventId).get()
                        .then((eventDoc) => {
                            if (eventDoc.exists) {
                                var eventData = eventDoc.data();
                                var a = document.createElement("a");
                                a.setAttribute("data-id", doc.id); // Assign the document ID to the a element
                                a.href = `event-details.html?eventId=${data.eventId}`; // Set the href to link to the event details page

                                var eventName = document.createElement("span");
                                eventName.textContent = `Event Name: ${eventData.golfClub}`; // Use the event name here
                                a.appendChild(eventName);
                                a.appendChild(document.createElement("br"));

                                var status = document.createElement("span");
                                status.textContent = `Status: ${data.status}`;
                                a.appendChild(status);

                                a.style.marginBottom = "10px"; // Add some space between the signups

                                upcomingEvents.appendChild(a);
                            } else {
                                console.log(`No such document! Document ID: ${data.eventId}`);
                            }
                        })
                        .catch((error) => {
                            console.log("Error getting document:", error);
                        });
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }
}

let currentUserData = null; // Add this line at the top of your script


auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        db.collection("users").doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    currentUserData = doc.data(); // Store the user's data in the global variable
                    var profileInfo = document.getElementById("profile_info");
                    if (profileInfo) {
                        profileInfo.innerHTML = `Name: ${currentUserData.name}<br>Email: ${user.email}`;
                    }
                } else {
                    console.log("No such document!");
                }
            })
            .catch((error) => {
                console.log("Error getting document:", error);
            });

        // Call all the necessary functions here
        loadEvents();
        loadSignups(); // Load the signups when the user signs in
        loadSignupsForReview(); // Load the signups for review when the user signs in
        loadUpcomingEvents(); // Load the upcoming events when the user signs in
    } else {
        // User is signed out
        // ...
    }
});


document.addEventListener("DOMContentLoaded", function () {
    var loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent the form from being submitted normally
            login();
        });
    }
});



