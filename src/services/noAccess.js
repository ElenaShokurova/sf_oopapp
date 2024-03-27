import noAccessTemplate from "../templates/noAccess.html";

export const setNoAccess = function (document) {
  document.querySelector("#content").innerHTML = noAccessTemplate;

  document.querySelector(".btn-success").addEventListener("click", function () {
    document.querySelector(".modal").style.display = 'none';
  });

  document.querySelector(".close").addEventListener("click", function () {
    document.querySelector(".modal").style.display = 'none';
  });
};