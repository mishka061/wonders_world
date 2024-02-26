document.addEventListener("DOMContentLoaded", function () {
  let registrationButton = document.querySelector(".registrationButton");
  let authorizationButton = document.querySelector(".authorizationButton");
  let exit = document.querySelector("#exit");
  let indexButton = document.querySelector(".indexButton");
  let addWondersButton = document.querySelector(".addWondersButton");
  let addWondersButton1 = document.querySelector(".addWondersButton1");

  if (registrationButton || authorizationButton) {
    registrationButton.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = "/admin/registration";
    });

    authorizationButton.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = "/admin/authorization"; 
    });
  } else {

    exit.addEventListener("click", function (event) {
      fetch("/logout", { method: "POST" }).then((response) => {
        if (response.ok) {
          console.log("fetch ok");
          event.preventDefault();
          window.location.reload(); 
        } else {
          console.log("fetch no");
        }
      });
    });
  }


  function indexButtonNone() {
    if (window.location.pathname === "/index") {
      indexButton.style.display = "none";
    } else {
      indexButton.style.display = "block"; 
      indexButton.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "/index"; 

      });
    }
  }
  indexButtonNone();
  
  function addWondersButtonNone() {
    let addWondersButton = document.querySelector(".addWondersButton");
    if (addWondersButton) {
      addWondersButton.style.display =
        window.location.pathname === "/addWonders" ? "none" : "block";
    }
  }

  addWondersButtonNone();


  if (addWondersButton) {
    addWondersButton.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = "/addWonders";
    });
  }

  if (addWondersButton1) {
    addWondersButton1.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = "/index/posts";
    });
  }
  document
    .querySelector("#uploadButton")
    .addEventListener("click", function () {
      document.querySelector("#fileInput").click();
    });


  document.querySelector("#fileInput").addEventListener("change", function () {
    const fileInput = document.querySelector("#fileInput");
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      console.log("new FileReader ");
      reader.onload = function (e) {
        console.log("reader.onload");
      };

      reader.readAsDataURL(fileInput.files[0]); 
      console.log("reader.readAsDataURL");
    }
  });


  document.querySelector("#formElem").onsubmit = async (e) => {
    e.preventDefault();
    let formData = new FormData();
    let fileInput = document.querySelector("#fileInput");
    let file = fileInput.files[0];
    console.log("fileInput.files");

    if (file) {
      formData.append(
        "addWomdersInp",
        document.querySelector("#addWomdersInp").value
      );
      formData.append(
        "addWomdersTextarea",
        document.querySelector("#addWomdersTextarea").value
      );
      formData.append("fileInput", file);
      console.log("formData.append");

      fetch("/addWonders", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
          } else {
            window.location.href = "/index/posts";
          }
        });
    } else {
      console.log("Файл не выбран");
    }
  };

    
});

document.addEventListener("DOMContentLoaded", function () {
  const editingButtons = document.querySelectorAll(".editingBtn");
  editingButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const postId = button.getAttribute("data-id");
      window.location.href = `/edit/${postId}`;
    });
  });
});


