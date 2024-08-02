import { canvas, ctx as context } from "./Components/GetCanvasContext.js";
import Table from "./Components/Table.js";

const rect = document.getElementById("navbar").getBoundingClientRect();

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - rect.height - 20;

context.fillStyle = "black";
context.strokeStyle = "#E1E1E1";

let columns = 30;
let rows = 100;
let table = new Table(context, columns, rows, canvas);
table.draw();
// appendElements()
canvas.addEventListener("mousedown", (event) => table.handleMouseDown(event));
canvas.addEventListener("mousemove", (event) => table.handleMouseMove(event));
canvas.addEventListener("mouseup", (event) => table.handleMouseUp(event));
canvas.addEventListener("dblclick", (event) => table.handleDoubleClick(event));
window.addEventListener("keydown", (event) => table.handleKeyPress(event));
window.addEventListener("keyup", (event) => table.handleKeyUp(event));
canvas.addEventListener("wheel", (event) => table.handleScroll(event));
window.addEventListener("resize", (event) => table.handleResize(event));
document.getElementById("uploadForm").addEventListener("submit", uploadCsv);

async function fetchData() {
  let url = "http://localhost:5139/api/User/GetAll/1/none/none";
  try {
    const response = await fetch(url, {
      method: "GET",
    });
    const data = await response.json();
    console.log(data);
    table.drawCsv(data);
  } catch (error) {
    console.log(error);
  }
  appendElements();
}
function appendElements() {
  const form = document.getElementById("uploadForm");
 
  function appendDelete()
  {
    const div = document.createElement("div");
    div.classList.add("delete");

    const i = document.createElement("i");
    i.classList.add("fa-solid");
    i.classList.add("fa-trash");
    
    const p = document.createElement("p");
    p.innerHTML = "Delete"

    div.appendChild(i);
    div.appendChild(p);

    form.appendChild(div);

    div.addEventListener("click",()=>table.handleDelete());
  }
  function appendSearching()
  {
    const div = document.createElement("div");
    div.classList.add("search-bar");

    const input = document.createElement("input");
    input.classList.add("input-email");
    input.type = "text";
    input.placeholder = "Search by email";

    const button = document.createElement("button");
    button.classList.add("btn-search");
    button.type = "button";
    button.innerHTML = "Search";
    form.appendChild(div);
    div.appendChild(input);
    div.appendChild(button);
    button.addEventListener("click", () => table.handleSearching());
  }
  function appendSort()
  {
    const div = document.createElement("div");
    div.classList.add("sort");

    const i = document.createElement("i");
    i.classList.add("fa-solid");
    i.classList.add("fa-arrow-down-1-9");
    
    const p = document.createElement("p");
    p.innerHTML = "Sort"

    div.appendChild(i);
    div.appendChild(p);

    form.appendChild(div);

    div.addEventListener("click",()=>{table.handleSort()})
  }
  appendSearching();
  appendDelete();
  appendSort();
}
async function uploadCsv(event) {
  event.preventDefault();

  let fileInput = document.getElementById("file");
  let file = fileInput.files[0];
  if (!file) {
    alert("Please select a file");
    console.error("No file selected");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      "http://localhost:5139/UploadCsv/fasterupload",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    console.log(data);

    await fetchStatus(data.fileId);
  } catch (error) {
    console.error("Error:", error);
    alert(data);
  }
}

async function fetchStatus(fileId) {
  let totalBatches = null;
  let successfullyUploadedBatches = null;
  let progressBar = document.getElementById("myBar");
  progressBar.style.display = "block";
  let myInterval = setInterval(async () => {
    let url = "http://localhost:5139/FileController/GetProgresss?id=" + fileId;
    console.log(url);
    try {
      const response = await fetch(url, {
        method: "GET",
      });
      const data = await response.json();
      console.log(data);
      totalBatches = data.totalBatches;
      successfullyUploadedBatches = data.successfullyUploadedBatches;
      let percentage = (successfullyUploadedBatches / totalBatches) * 100;
      progressBar.style.width = percentage + "%";
      if (totalBatches && successfullyUploadedBatches) {
        console.log("hello world");
        if (totalBatches == successfullyUploadedBatches) {
          clearInterval(myInterval);
          progressBar.style.display = "none";
          progressBar.style.width = "0%";
          fetchData();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, 2000);
  // alert("data is send");
  // fetchData();
  console.log("hello world");
}
