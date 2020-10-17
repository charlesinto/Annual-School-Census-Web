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
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("projectId");
    const projectName = urlParams.get("projectName");
    const $this = this;
    const state = {};
    return {
      initPage: function () {
        $("#survey-name").text(projectName);
      },
      registerEvents: function () {
        const $this = this;
        $(".tab").on("click", function (e) {
          $(".tab.active").removeClass("active");

          $(this).addClass("active");
          const id = $(this).attr("id");
          $(".form-survey.active").removeClass("active");
          $(`[data-id=${id}]`).addClass("active");
          $this.getResponses();
        });
        $(".add-section-pad").on("click", () =>
          $("#exampleModal").modal("show")
        );
        $(".add-options").on("click", function (e) {
          $(".options").append(`<input
            type="text"
            class="form-control mt-2"
            name="select-options"
            aria-describedby="emailHelp"
          />`);
        });
        // $("#close-add-quuestion").on("click", (e) => {
        //   $(".sections").empty();
        //   this.getSection();
        // });
        $("#type").on("change", function (e) {
          const selectedValue = e.target.value;
          if (selectedValue === "single-select") {
            $(".options").css("display", "block");
          } else {
            $(".options").css("display", "none");
          }
        });
        $("#create-section").on("click", this.createSection.bind(this));
      },
      createSection: function () {
        const sectioNameField = $("#section-name");

        if (sectioNameField.val().trim() !== "") {
          //save to firebase
          const sectionId = uuidv4();
          state[sectionId] = 0;
          const sectionName = sectioNameField.val();
          $(".loader-wrapper").css("display", "block");

          db.doc(`projects/${projectId}`)
            .get()
            .then((doc) => {
              if (doc.exists) {
                const data = doc.data();
                let surveys = [];
                if (data.survey) {
                  surveys = data.survey;
                  surveys.push({
                    id: sectionId,
                    name: sectionName,
                  });
                } else {
                  surveys.push({
                    id: uuidv4(),
                    name: sectionName,
                  });
                }
                db.doc(`projects/${projectId}`)
                  .update({
                    survey: surveys,
                  })
                  .then(() => {
                    sectioNameField.val("");
                    this.renderSection(sectionName, sectionId, 0);
                    $(".loader-wrapper").css("display", "none");
                    Swal.fire(
                      "Section Created",
                      "New section added successfuly",
                      "success"
                    );
                  });
              }
            });
          //   this.getSections(sectioName.val().trim());
          // clear the input
        }
      },
      getSection: function () {
        this.getProject().then((doc) => {
          if (doc.exists) {
            if (doc.data().survey) {
              doc.data().survey.forEach((ele) => {
                state[ele.id] = ele.data ? ele.data.length : 0;
                this.renderSection(ele.name, ele.id, state[ele.id]);
              });
            }
          }
        });
      },
      getProject: function () {
        return new Promise((resolve, reject) => {
          db.doc(`projects/${projectId}`)
            .get()
            .then((doc) => {
              return resolve(doc);
            })
            .catch((err) => {
              return reject(err);
            });
        });
      },
      renderSection: function (sectionName, id, count) {
        $(".sections").append(`<div class="row mb-2">
          <div class="col-md-12 bg-white shadow-sm py-2">
          <div class="d-flex justify-content-between">
          <h5>${sectionName}</h5>
          <button data-name=${sectionName
            .split(" ")
            .join(
              "__"
            )} data-id=${id} type="button" class="btn btn-danger add-question">
          Add Question <span data-section=${id} class="badge badge-light">${count}</span>
        </button>
          </div>
          </div>
        </div>`);
        const $this = this;
        $(`[data-id=${id}]`).on("click", function (e) {
          $this.addQuestionToSection(e, this);
        });
      },
      addQuestionToSection: function (e, $this) {
        e.preventDefault();
        console.log("called here");
        const sectionId = $($this).data("id");
        const sectionName = $($this).data("name");
        $("#section-name-modal").text(sectionName.split("__").join(" "));

        this.getProject()
          .then((doc) => {
            if (doc.exists) {
              if (doc.data().survey) {
                const index = doc
                  .data()
                  .survey.findIndex((ele) => ele.id === sectionId);
                if (index !== -1) {
                  const section = doc.data().survey[index];
                  let questions = [];
                  if (section.data) {
                    questions = section.data;
                  }
                  const dtEntry = [];
                  questions.forEach((ele) => {
                    dtEntry.push([
                      ele.question,
                      ele.type,
                      ele.required ? ele.required : false,
                      ele.hint,
                    ]);
                  });
                  console.log("data entries: ", dtEntry);
                  const table = $("#example").DataTable();
                  table.clear();
                  table.rows.add(dtEntry).draw(false);
                  $("#save-question").on(
                    "click",
                    this.saveQuestion.bind(this, e, sectionId)
                  );
                  $("#addQuestionToSection").modal("show");
                }
              }
            }
          })
          .catch((err) => {
            console.log("errors is: ", err);
          });
      },
      saveQuestion: function (e, sectionId) {
        e.preventDefault();
        const questionNameField = $("#question-name");
        const hintField = $("#hint");
        const typeField = $("#type");
        const requiredField = $("#required");
        $(".loader-wrapper").css("display", "block");
        if (
          questionNameField.val().trim() !== "" &&
          typeField.val().trim() !== ""
        ) {
          const options = [];
          Array.from(document.querySelectorAll(".options input")).forEach(
            (ele) => {
              options.push(ele.value);
            }
          );

          const data = {
            question: questionNameField.val(),
            hint: hintField.val(),
            required: requiredField.attr("checked") ? true : false,
            type: typeField.val(),
            options,
            id: uuidv4(),
          };
          console.log(data);
          this.getProject().then((doc) => {
            if (doc.exists) {
              if (doc.data().survey) {
                const index = doc
                  .data()
                  .survey.findIndex((ele) => ele.id === sectionId);
                if (index !== -1) {
                  const section = doc.data().survey[index];
                  let questions = [];
                  if (section.data) {
                    questions = section.data;
                  }
                  questions.push(data);
                  //replace questions
                  section.data = questions;
                  const survey = doc.data().survey;
                  //remove survey
                  survey.splice(index, 1);
                  //replace survey
                  survey.push(section);
                  // update database
                  db.doc(`projects/${projectId}`)
                    .update({
                      survey,
                    })
                    .then(() => {
                      state[sectionId] = state[sectionId] + 1;
                      $(`[data-section=${sectionId}]`).text(state[sectionId]);
                      const table = $("#example").DataTable();
                      table.row
                        .add([
                          data.question,
                          data.type,
                          data.required,
                          data.hint,
                        ])
                        .draw(false);
                      $(".loader-wrapper").css("display", "none");
                      Swal.fire(
                        "Question Added",
                        "New question added successfuly",
                        "success"
                      );
                    });
                }
              }
            }
          });
        }
      },
      getResponses: function () {
        db.collection("responses")
          .where("id", "==", projectId)
          .orderBy("createdAt", "desc")
          .get()
          .then((docSnapshot) => {
            const dt = [];
            docSnapshot.forEach((doc) => {
              dt.push(doc.data());
            });
            this.renderResponses(dt);
          });
      },
      renderResponses: function (data) {
        console.log(data);
        const surveys = [];
        $("#survey-responses").empty();
        data.forEach((res) => {
          console.log("res", res);
          surveys.push(res.survey);
          let responses = [];
          res.survey.forEach((doc, i) => {
            responses.push(doc.data);
            //   $("#accordion").append(`
            //   <div class="card">
            //   <div class="card-header" id="headingOne">
            //     <h5 class="mb-0">
            //       <button class="btn btn-link" data-toggle="collapse" data-target="#${i}" aria-expanded="true" aria-controls=${i}>
            //         ${doc.name}
            //       </button>
            //     </h5>
            //   </div>

            //   <div id=${i} class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
            //     <div class="card-body">

            //     </div>
            //   </div>
            // </div>

            //   `);
          });
          let flattenedResponses = Array.prototype.concat.apply([], responses);
          console.log("flateened Responses: ", flattenedResponses);

          $("#survey-responses").append(`
         
          <h5>Date Recorded: <span>${
            res.createdAt ? new Date(res.createdAt).toLocaleString() : ""
          }<span></h5>
          <p>
          <span class="py-2 response-id font-weight-bold">Response ID: ${
            res.responseId
          }</span>
          </p>
          <table
          id="table-response-${res.responseId}"
          class="table table-striped table-bordered mt-3 analytics-report mb-3"
          style="width: 100%"
        >
          <thead>
            <tr></tr>
          </thead>
          <tbody>
            <tr></tr>
          </tbody>
          <tfoot></tfoot>
        </table>
          `);
          flattenedResponses.forEach((data) => {
            $(`#table-response-${res.responseId} thead tr`).append(`
              <th>${data.question}</th>
            `);
            $(`#table-response-${res.responseId} tbody tr`).append(`
              <td>${data.response}</td>
            `);
          });
        });
        const tableAnalystics = $(".analytics-report").DataTable({
          responsive: true,
        });
        console.log(tableAnalystics);
      },
    };
  })();
  App.initPage();
  App.registerEvents();
  App.getSection();
});
