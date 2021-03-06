document.addEventListener("DOMContentLoaded", function () {

  //USER FUNCTIONALITY

    console.log("Loaded!");
    const logout = document.getElementById("logout");
    const usernames = document.getElementById("usernames");


    const db = firebase.firestore();

    let userRef = null;


    function getUser(uid) {
      db.collection("Users")
        .doc(uid)
        .get()
        .then(function (doc) {
          usernames.textContent = `Welcome ${doc.data().firstname} ${doc.data().lastname}`
          
        })
        .catch(function (error) {
          console.error(error);
        });
    }

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        userRef = user;
        getUser(user.uid);
      } else {
        window.location = "login.html";
      }
    });

    logout.addEventListener('click', function(){
        firebase.auth().onAuthStateChanged(function (user) {
        console.log("user", user);
        if (user) {
          firebase.auth().signOut();
        }else{
          window.location = "login.html";

        }
      });

    })




//POSTS FUNCTIONALITY

  
    const fileButton = document.getElementById("img");
    const form = document.getElementById("form");
    const messageToPost = document.getElementById("msg");
    const post = document.getElementById("card");
    const progress = document.getElementById("progress");
   
  
    //const db = firebase.firestore();
  
    const fbFolder = "images";
  
    let file = "";
    let filename = "";
    let extension = "";
    let imageName = "";


  
    fileButton.addEventListener("change", function (e) {
      file = e.target.files[0];
      filename = file.name.split(".").shift(); 
      extension = file.name.split(".").pop(); 
      imageName = filename;
    });

    
  
    form.addEventListener("submit", function (event) {
    
      event.preventDefault();

      if (imageName && messageToPost.value) {
        // Create a db id
        const id = db.collection("Posts").doc().id;
  
        // Create a storage ref
        const storageRef = firebase
          .storage()
          .ref(`${fbFolder}/${id}.${extension}`);
  
        const uploadTask = storageRef.put(file);
  
        uploadTask.on(
          "state_changed",
          function (snapshot) {
            progress.value =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          function (error) {
            console.error(error);
          },
          function () {
            console.log("done");
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(function (downloadURL) {
                db.collection("Posts")
                  .doc(id)
                  .set({
                    name: imageName,
                    message: messageToPost.value,
                    id,
                    image: downloadURL,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                  })
                  .then(function () {
                    console.log("Document successfully created!");
                    file = "";
                    filename = "";
                    extension = "";
                    imageName = "";
                    progress.value = "";
                    messageToPost.value = "";
  
                    createPost();
                  })
                  .catch(function (error) {
                    console.error(error);
                  });
              })
              .catch(function (error) {
                console.error(error);
              });
          }
        );
      }
     
    });

    function createPost() {
      post.innerHTML = "";
  
      const listRef = firebase.storage().ref(fbFolder);
      
  
      listRef.listAll().then(function (res) {
        res.items.forEach((itemRef) => {
          itemRef.getDownloadURL().then(function (downloadURL) {

            const imgId = itemRef.name.split(".").shift()
            console.log(imgId)
            const div = document.createElement("div");
            div.classList.add(`card`)

            const img = document.createElement("img");
            img.src = downloadURL;
            img.className = "posted-img"

            const messagediv = document.createElement("div");
            messagediv.className = "posted"

            const span = document.createElement("span");
            span.innerHTML = "&#10005;";
                      

            function getPost(postid) {
            db.collection("Posts")
                .doc(postid)
                .get()
                .then(function (doc) {
                 console.log(doc.data().name)
                 messagediv.textContent = doc.data().message
                })
                .catch(function (error) {
                console.error(error);
                });
            }
            getPost(imgId)

            span.addEventListener("click", function () {
                itemRef
                  .delete()
                  .then(function () {
                    console.log("Successfully deleted from storage");
                    db.collection("Posts")
                      .doc(itemRef.name.split(".").shift())
                      .delete()
                      .then(function () {
                        console.log("Successfully deleted from db");
                        createPost()
                      })
                      
                      .catch(function (error) {
                        console.error(error);
                      });
                  })
                  .catch(function (error) {
                    console.error(error);
                  });
              });

            div.append(span);
            div.append(img);
            div.append(messagediv);
            post.append(div);
            
        
         
          });
        });
      });
    }
   
  
    createPost();
    
  });