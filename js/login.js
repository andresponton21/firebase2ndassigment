document.addEventListener("DOMContentLoaded", function () {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const login = document.getElementById("login");
    const displaymsg = document.getElementById("displaymsg");

 

    login.addEventListener("click", function (event) {

     event.preventDefault();

      if (email.value && password.value) {
        firebase
          .auth()
          .signInWithEmailAndPassword(email.value, password.value)
          .then(function (data) {
            const user = firebase.auth().currentUser;
          })
          .catch(function (error) {
            console.error(error);
            displaymsg.textContent = error
          });
      }
      firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
       
        window.location = "home.html";
      }
    });
    });

    
  });