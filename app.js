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

// Set authentication persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
        console.error("Error setting auth persistence:", error);
    });

var eventsRef = db.collection("events");
var first = eventsRef.orderBy("golfClub").limit(10);
var isFirstPage = true; // Start on the first page



var firstDocOfCurrentPage = null; // Declare the variable here


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

    // Fetch the user's data from Firestore
    db.collection("users").doc(auth.currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                var userData = doc.data();

                db.collection("events").add({
                    golfClub: golfClub,
                    people: people,
                    dateTime: dateTime,
                    userId: auth.currentUser.uid,
                    userName: userData.name, // Use the user's name from Firestore
                    status: "open", // The status is "open" when the event is created
                    createdAt: firebase.firestore.FieldValue.serverTimestamp() // Add a timestamp here
                })
                    .then((docRef) => {
                        console.log("Event created with ID: ", docRef.id);
                        window.location.href = "profile.html"; // Redirect to the profile page
                    })
                    .catch((error) => {
                        console.error("Error adding document: ", error);
                    });
            } else {
                console.log("No such document!");
            }
        })
        .catch((error) => {
            console.log("Error getting document:", error);
        });
}


var eventsRef = db.collection("events");
var pageSize = 3;
var currentPage = null;

function loadPage(direction = 0) {
    var query = eventsRef.orderBy('createdAt').limit(pageSize);
    if (currentPage) {
        if (direction === 1) query = query.startAfter(currentPage);
        if (direction === -1) query = query.endBefore(currentPage);
    }

    query.get().then((snapshot) => {
        if (snapshot.empty) {
            console.log("No events found");
            return;
        }

        isFirstPage = direction === 0 || (direction === -1 && snapshot.size < pageSize);
        document.getElementById("previous_button").disabled = isFirstPage; // Disable or enable the "Previous" button

        var searchResult = document.getElementById("search_result");
        searchResult.innerHTML = ""; // Clear previous events

        snapshot.forEach((doc) => {
            var data = doc.data();
            var li = document.createElement("li");
            li.setAttribute("data-id", doc.id);

            var golfClub = document.createElement("span");
            golfClub.textContent = `Golf Club: ${data.golfClub}`;
            li.appendChild(golfClub);
            li.appendChild(document.createElement("br"));

            var people = document.createElement("span");
            people.textContent = `People: ${data.people}`;
            li.appendChild(people);
            li.appendChild(document.createElement("br"));

            var creator = document.createElement("span");
            creator.textContent = `Creator: ${data.userName}`;
            li.appendChild(creator);
            li.appendChild(document.createElement("br"));

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

            searchResult.appendChild(li);
        });

        currentPage = snapshot.docs[snapshot.docs.length - 1];

    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
}

function loadNextEvents() {
    loadPage(1);
}

function loadPreviousEvents() {
    loadPage(-1);
}

// Call loadPage initially to load the first page of events
loadPage();




function saveAndContinue(formId) {
    var form = document.getElementById(formId);
    if (form) {
        var name = document.getElementById("name_field").value;
        var yearOfBirth = document.getElementById("year_of_birth_field").value;
        var about = document.getElementById("about_field").value;
        var englishFluency = document.getElementById("english_fluency_field").value;
        var linkedIn = document.getElementById("linkedin_field").value;
        var facebook = document.getElementById("facebook_field").value;
        var golfAssociation = document.getElementById("golf_association_field").value;
        var ghinNumber = document.getElementById("ghin_association_number_field").value;
        var golfIndex = document.getElementById("golf_index_field").value;

        // Basic validation
        if (!name) {
            console.error("Name is required!");
            return;
        }
        // ... Add more validations for required fields if needed ...

        var user = auth.currentUser;
        if (user) {
            user.updateProfile({
                displayName: name
            }).then(() => {
                console.log("Display name set to: " + user.displayName);
                // Save the user data in Firestore
                db.collection("users").doc(user.uid).set({
                    name: name,
                    yearOfBirth: yearOfBirth,
                    about: about,
                    englishFluency: englishFluency,
                    linkedIn: linkedIn,
                    facebook: facebook,
                    golfAssociation: golfAssociation,
                    ghinNumber: ghinNumber,
                    golfIndex: golfIndex
                }).then(() => {
                    console.log("User data saved in Firestore.");
                }).catch((error) => {
                    console.error("Error saving user data in Firestore: ", error);
                });
            }).catch((error) => {
                console.error("Error setting display name: ", error);
            });
        } else {
            console.error("User is not authenticated.");
        }
    } else {
        console.error("Form not found!");
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



async function loadSignupsForReview() {
    const reviewSignups = document.getElementById("review_signups");
    const approved = document.getElementById("approved");

    if (!reviewSignups || !approved) return; // Exit if elements don't exist

    // Clear previous signups
    reviewSignups.innerHTML = "";
    approved.innerHTML = "";

    try {
        const signupsSnapshot = await db.collection("signups").get();
        for (let doc of signupsSnapshot.docs) {
            const signup = doc.data();
            const eventDoc = await db.collection("events").doc(signup.eventId).get();

            if (!eventDoc.exists) {
                console.log("No such event document!");
                continue;
            }

            if (eventDoc.data().userId !== auth.currentUser.uid) continue; // Skip if the current user is not the creator

            const listItem = createSignupListItem(doc, signup, eventDoc.data());
            if (signup.status === "pending") {
                reviewSignups.appendChild(listItem);
            } else if (signup.status === "approved") {
                approved.appendChild(listItem);
            }
        }
    } catch (error) {
        console.log("Error processing signups:", error);
    }
}

function createSignupListItem(doc, signup, event) {
    const li = document.createElement("li");
    li.setAttribute("data-id", doc.id);

    appendElementToParent(li, "span", `Event Name: ${event.golfClub}`);
    appendElementToParent(li, "span", `User Name: ${signup.userName}`);
    appendElementToParent(li, "span", `User Email: ${signup.userEmail}`);
    appendElementToParent(li, "span", `Status: ${signup.status}`);

    if (signup.status === "pending") {
        const approveButton = document.createElement("button");
        approveButton.textContent = "Approve";
        approveButton.onclick = () => approveSignup(doc.id);
        li.appendChild(approveButton);

        const rejectButton = document.createElement("button");
        rejectButton.textContent = "Reject";
        rejectButton.onclick = () => rejectSignup(doc.id);
        li.appendChild(rejectButton);

        // Add the "View User Profile" button
        const viewProfileButton = document.createElement("button");
        viewProfileButton.textContent = "View User Profile";
        viewProfileButton.onclick = () => viewUserProfile(signup.userId);
        li.appendChild(viewProfileButton);
    }

    li.style.marginBottom = "10px"; // Add some space between the signups
    return li;
}


function appendElementToParent(parent, elementType, textContent) {
    const element = document.createElement(elementType);
    element.textContent = textContent;
    parent.appendChild(element);
    parent.appendChild(document.createElement("br"));
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

function searchEvents() {
    var titleField = document.getElementById("event_title_field");
    var searchField = document.getElementById("search_field");
    var dateField = document.getElementById("date_field");
    var searchResult = document.getElementById("search_result");

    if (titleField && searchField && dateField && searchResult) {
        // Clear the previous events
        searchResult.innerHTML = "";

        var titleText = titleField.value.trim().toLowerCase();
        var searchText = searchField.value.trim().toLowerCase();
        var searchDate = dateField.value;

        var eventsRef = db.collection("events");

        if (titleText) {
            eventsRef = eventsRef.where("title", "==", titleText);
        }

        if (searchText) {
            eventsRef = eventsRef.where("golfClub", "==", searchText);
        }

        // Check if a valid date is entered
        if (searchDate) {
            var searchTimestamp = new Date(searchDate);

            if (!isNaN(searchTimestamp)) {
                searchTimestamp.setHours(0, 0, 0, 0);
                var searchISODate = searchTimestamp.toISOString();
                eventsRef = eventsRef.where("dateTime", ">=", searchISODate);
            }
        }

        eventsRef.get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var data = doc.data();

                    if (
                        data.golfClub.toLowerCase().includes(searchText) ||
                        data.people.toString().includes(searchText) ||
                        data.dateTime.includes(searchText)
                    ) {
                        var li = document.createElement("li");

                        var golfClub = document.createElement("span");
                        golfClub.textContent = `Golf Club: ${data.golfClub}`;
                        li.appendChild(golfClub);
                        li.appendChild(document.createElement("br"));

                        var people = document.createElement("span");
                        people.textContent = `People: ${data.people}`;
                        li.appendChild(people);
                        li.appendChild(document.createElement("br"));

                        var dateTime = document.createElement("span");
                        dateTime.textContent = `Date and Time: ${data.dateTime}`;
                        li.appendChild(dateTime);
                        li.appendChild(document.createElement("br"));

                        // Only add the delete button if the current user is the creator of the event
                        if (data.userId === auth.currentUser.uid) {
                            var deleteButton = document.createElement("button");
                            deleteButton.textContent = "Delete";
                            deleteButton.classList.add("button-delete");
                            deleteButton.onclick = function () {
                                db.collection("events").doc(doc.id).delete().then(() => {
                                    console.log("Event successfully deleted!");
                                    li.remove();
                                }).catch((error) => {
                                    console.error("Error removing document: ", error);
                                });
                            };
                            li.appendChild(deleteButton);
                        } else {
                            // The current user is not the creator, add the signup button
                            var signupButton = document.createElement("button");
                            signupButton.textContent = "Sign Up";
                            signupButton.classList.add("button-signup");
                            signupButton.onclick = function () {
                                signupForEvent(doc.id);
                            };
                            li.appendChild(signupButton);
                        }

                        searchResult.appendChild(li);
                    }
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }
}

function viewUserProfile(userId) {
    db.collection("users").doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                var userData = doc.data();
                // Update the following line to set the data inside the modal
                document.getElementById('userProfileContent').innerHTML = `Name: ${userData.name}<br>Email: ${userData.email}<br>...`;
                showUserProfile();
            } else {
                alert("No such user!");
            }
        })
        .catch((error) => {
            console.error("Error fetching user profile: ", error);
        });
}

function showUserProfile() {
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error("Could not find user profile modal in the DOM.");
    }
    // You can populate the user's data here if needed
    // e.g., document.getElementById('profileInfo').innerHTML = 'User Data';
}


function closeUserProfile() {
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.style.display = 'none';
    } else {
        console.error("Could not find user profile modal in the DOM.");
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
        loadPage(); // updated this line
        loadSignups(); // Load the signups when the user signs in
        loadSignupsForReview(); // Load the signups for review when the user signs in
        loadUpcomingEvents(); // Load the upcoming events when the user signs in
    } else {
        // User is signed out
        // ...
    }
});


document.addEventListener("DOMContentLoaded", function () {

    // Safely set innerHTML of an element
    function safelySetInnerHTML(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
        } else {
            console.error(`Element with ID ${elementId} not found!`);
        }
    }

    // Close user profile modal function
    function closeUserProfile() {
        const modal = document.getElementById('userProfileModal');
        if (modal) {
            modal.style.display = 'none';
        } else {
            console.error("Could not find user profile modal in the DOM.");
        }
    }

    // Attach event listeners to all "View Profile" buttons
    const viewProfileButtons = document.querySelectorAll('.viewProfileButton');
    viewProfileButtons.forEach(button => {
        button.addEventListener('click', function () {
            const userId = this.getAttribute('data-userid');
            if (userId) {
                viewUserProfile(userId); // This function is from your app.js
            } else {
                console.error("User ID not found for View Profile button.");
            }
        });
    });

    closeUserProfile();  // Call the function here to hide the modal when the page loads

    // Check and attach event listener for login form submission
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent the form from being submitted normally
            login();
        });
    }

    // Check and attach event listeners for pagination buttons
    const previousButton = document.getElementById("previous_button");
    const nextButton = document.getElementById("next_button");
    if (previousButton) {
        previousButton.addEventListener("click", loadPreviousEvents);
    }
    if (nextButton) {
        nextButton.addEventListener("click", loadNextEvents);
    }

    // Attach event listener to close modal button
    const closeModalButton = document.getElementById('closeUserProfileModal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeUserProfile);
    }

    // Example use of safelySetInnerHTML function
    // safelySetInnerHTML("yourElementId", "Your new content");
});
