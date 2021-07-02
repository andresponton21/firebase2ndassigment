document.addEventListener("DOMContentLoaded", function () {
    console.log("Loaded!");
  
    const fileButton = document.getElementById("img");

    const form = document.getElementById("form");
    const msg = document.getElementById("msg");
    const post = document.getElementById("card");
    const progress = document.getElementById("progress");
   
  
    const db = firebase.firestore();
  
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

      if (msg.value) {
        addPost(msg.value);
        msg.value = "";
      }
    
  
    

      if (imageName) {
        // Create a db id
        const id = db.collection("Images").doc().id;
  
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
                db.collection("Images")
                  .doc(id)
                  .set({
                    name: imageName,
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

    function addPost(msgValue) {
        db.collection("Post")
          .add({
            msg: msgValue,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(function (docRef) {
            console.log("Document written with ID:", docRef.id);
          })
          .catch(function (error) {
            console.error("Error adding document", error);
          });
      }
      function deletePost(id) {
          db.collection("Post")
            .doc(id)
            .delete()
            .then(function () {
              console.log("Document successfully deleted!");
            })
            .catch(function (error) {
              console.log("Error deleting doucment.", error);
            });
        }
  
    function createPost() {
      post.innerHTML = "";
  
      const listRef = firebase.storage().ref(fbFolder);
  
      listRef.listAll().then(function (res) {
        res.items.forEach((itemRef) => {
          itemRef.getDownloadURL().then(function (downloadURL) {

            db.collection("Post")
            .orderBy("timestamp", "asc")
            .onSnapshot(function (querySnapshot) {
              
              querySnapshot.forEach((doc) => {
                const div = document.createElement("div");
                div.classList.add(`card`)
                div.innerHTML = ` 
                <div><img src=${downloadURL} alt="postedimg" class="posted-img"></div>
                <div><div class="posted">${doc.data().msg}</div></div>`;
      
                // const img = document.createElement("img");
                // img.src = downlodURL;
                // img.width = 200;
                // img.height = 200;
      
                // const span = document.createElement("span");
                // span.innerHTML = "x";
                // span.className = "delete_icon";
                const span = document.createElement("span");
                span.innerHTML = "&#10005;";
                span.style = `margin: auto;
                color: grey; cursor: pointer;
                position:absolute;
                border: 1px solid grey;
                border-radius: 0.15em;`;
    
                span.addEventListener("click", function () {
                  itemRef
                    .delete()
                    .then(function () {
                      console.log("Successfully deleted from storage");
                      db.collection("Images")
                        .doc(itemRef.name.split(".").shift())
                        .delete()
                        .then(function () {
                          console.log("Successfully deleted from db");
                          createPost()
                        })
                        .then(function () {
                            deletePost(doc.id)
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
                post.append(div);
                
              });
            });
            
         
          });
        });
      });
    }
   
  
    createPost();
    
  });