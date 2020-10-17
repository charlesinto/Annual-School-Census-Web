// import "./vendor/home.css";
var firebaseConfig = {
  apiKey: "AIzaSyAxHILh6cv0zFAw-luAelQXSEbqpQ4tqRM",
  authDomain: "annual-school-census.firebaseapp.com",
  databaseURL: "https://annual-school-census.firebaseio.com",
  projectId: "annual-school-census",
  storageBucket: "annual-school-census.appspot.com",
  messagingSenderId: "47101596260",
  appId: "1:47101596260:web:8d449aef52186d931e4571",
  measurementId: "G-LGVGLNFHVX",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

$(function () {
  const App = (function () {
    return {
      initApp: function () {
        const $this = this;
        $("#createFromScratch").on("click", function () {
          $("#exampleModal").modal("hide");
          $("#exampleModal2").modal("show");
          // window.location = window.origin + "/src/create-survey.html";
        });
        $("#create-project").on("click", function () {
          const projectName = $("#project-name").val();
          if (projectName.trim() !== "") {
            $this
              .createProject(projectName)
              .then((res) => {
                $("#project-name").val("");
                const name = res.data()["name"];
                window.location =
                  window.origin +
                  `/src/create-survey.html?projectId=${res.id}&projectName=${name}`;
              })
              .catch((err) => console.log("error: ", err));
          } else {
            alert("Project name is required");
          }
        });
      },
      createProject: function (projectName) {
        return new Promise((resolve, reject) => {
          db.collection("projects")
            .add({
              name: projectName,
            })
            .then((res) => {
              db.doc(`projects/${res.id}`)
                .get()
                .then((doc) => {
                  resolve(doc);
                });
            })
            .catch((err) => {
              reject(err);
            });
        });
      },
      getProjects: function () {
        const $this = this;
        db.collection("projects")
          .get()
          .then((querySnapshot) => {
            if (querySnapshot.empty) {
              $(".project-wrapper").css("display", "none");
              $(".empty-project-wrapper").css("display", "block");
            }
            const projects = [];
            querySnapshot.forEach((doc) => {
              projects.push(doc.data());
              $(".projects").append(`
                <div data-id=${doc.id} data-name=${
                doc.data().name
              } class="col-md-12 mb-3 cursor-pointer">
                <div class="container py-2 px-0 bg-white shadow-sm">
                  <div class="row px-2">
                    <div class="col-md-12">
                    <h5 class="mb-0">Name</h5>
                    </div>
                  </div>
                  <hr />
                  <div class="row px-2">
                      <div class="col-md-12">
                        <h6>${doc.data().name}</h6>
                      </div>
                  </div>
                </div>
                </div>
              `);

              $(".report-count").text(projects.length);
              $(`[data-id=${doc.id}]`).on("click", function (e) {
                $this.viewProject(e, this);
              });
            });
          })
          .catch((err) => {});
        db.collection("responses")
          .get()
          .then((querySnapshot) => {
            const projects = [];
            querySnapshot.forEach((doc) => {
              projects.push(doc.data());
            });
            $(".response-count").text(projects.length);
          })
          .catch((err) => {
            console.log(err);
          });
      },
      viewProject: function (e, $this) {
        const projectId = $($this).data("id");
        const projectName = $($this).data("name");
        window.location =
          window.origin +
          `/src/create-survey.html?projectId=${projectId}&projectName=${projectName}`;
      },
    };
  })();

  App.initApp();
  App.getProjects();
});
