import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import "./styles/stylesKanban.css"
import { User } from "./models/User";
import { generateTestUser } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";
import { setTaskField } from "./services/taskField";
import { setNoAccess } from "./services/noAccess";
import { addUser, showAdmin } from "./services/task";

export const appState = new State();
appState.isAdmin = false;

// export const documentHTML = function () {
//   return document;
// }

const loginForm = document.querySelector("#app-login-form");

generateTestUser(User);

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");

  if (authUser(login, password)) {
    setTaskField(document);
    if (appState.isAdmin == true) {
      console.log(appState.isAdmin)
      showAdmin();
      addUser();
    }


  } else {
    setNoAccess(document);
  }

});

export const clickOut = function (e) {
  appState._currentUser = null;
  document.querySelector("#content").innerHTML = '<p id="content">Please Sign In to see your tasks!</p>';
  for (let i = 0; i < 2; i++) {
    document.querySelectorAll('.form-control')[i].style.display = "block";
  }
  document.querySelector('#app-login-btn').style.display = "block";
  document.querySelector('#app-out-btn').style.display = "none";
};
