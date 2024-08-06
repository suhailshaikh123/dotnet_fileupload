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


