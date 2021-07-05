document.addEventListener("DOMContentLoaded", function () {
    console.log('Loaded')
  const firstname = document.getElementById("firstname");
  const lastname = document.getElementById("lastname");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const register = document.getElementById("register");
  const errormsg = document.getElementById("errormsg");


  const db = firebase.firestore();

  function addUser(uid, first, last) {
    db.collection("Users")
      .doc(uid)
      .set({
        firstname: first,
        lastname: last,
        user: uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(function () {
        console.log("User added to database!");
      }).then(function () {
        firebase.auth().onAuthStateChanged(function (user) {
        console.log("user", user);
        if (user) {
          firebase.auth().signOut();
        }else{
          window.location = "pages/login.html";
        }
});
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  register.addEventListener("click", function (event) {
      event.preventDefault();
      
    if (email.value && password.value) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email.value, password.value)
        .then(function (data) {
          const user = firebase.auth().currentUser;

          addUser(user.uid, firstname.value, lastname.value);
          

        })
        .catch(function (error) {
          console.error(error);
          errormsg.textContent = error

        });
    }
   
    
  });
 
  
});