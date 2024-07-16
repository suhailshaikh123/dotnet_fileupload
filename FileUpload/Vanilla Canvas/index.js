import { canvas, ctx as context } from "./Components/GetCanvasContext.js";
import Cell from "./Components/Cell.js";
import Table from "./Components/Table.js";
import AddListener from "./Components/AddListener.js";
import Headers from "./Components/Headers.js";
import Indexing from "./Components/Indexing.js";

canvas.width = 5000;
canvas.height = 3000;

context.fillStyle = "black";
context.strokeStyle = "#E1E1E1";



let columns = 20;
let rows = 100;

let table = new Table(context, columns, rows,canvas);
table.draw();
let columns_width = table.getColumnsWidth();
let headers = new Headers(context, columns,columns_width);
let indexing = new Indexing(context, rows);
headers.draw(0,columns_width);
indexing.draw();


canvas.addEventListener("mousedown", (event) => table.handleMouseDown(event));
canvas.addEventListener("mousemove", (event) => table.handleMouseMove(event));
canvas.addEventListener("mouseup", (event) => table.handleMouseUp(event));
canvas.addEventListener("dblclick",(event) => table.handleDoubleClick(event));


