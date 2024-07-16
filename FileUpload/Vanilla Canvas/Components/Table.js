import Cell from "./Cell.js";
import Headers from "./Headers.js";
import Indexing from "./Indexing.js";
class Table {
  constructor(context, columns, rows, canvas) {
    this.context = context;
    this.columns = columns;
    this.rows = rows;
    this.data = new Array(this.rows);
    this.isResizing = false;
    this.resizeColumnIndex = -1;
    this.startX = 0;
    this.initialWidth = 0;
    this.canvas = canvas;
    this.columns_width = new Array(this.columns.length);
    this.indexing = new Indexing(this.context, this.rows);
    this.selectedCell = false;
  }

  draw() {
    let width = 130;
    let height = 30;
    let topX = width;
    let topY = height;
    for (let i = 1; i < this.rows; i++) {
      let text = "";
      this.data[i] = new Array(this.columns);
      for (let j = 1; j < this.columns; j++) {
        text = "suhai shaikh";
        let cell = new Cell(this.context, topX, topY, height, width, i, j);
        this.columns_width[j] = width;
        cell.draw();
        cell.AddText(text);
        this.data[i][j] = cell;
        topX += width;
      }
      topX = width;
      topY += height;
    }

    this.getData();
  }

  getColumnsWidth() {
    return this.columns_width;
  }

  getData() {
    return this.data;
  }
  redraw() {
    for (let i = 1; i < this.data.length; i++) {
      for (let j = 1; j < this.data[i].length; j++) {
        if (j != 1) {
          this.data[i][j].topX =
            this.data[i][j - 1].topX + this.data[i][j - 1].width;
        }
        this.data[i][j].draw();
        // this.data[i][j].DrawText();
      }
    }

    let header = new Headers(this.context, this.columns, this.columns_width);

    header.draw(0);
    this.indexing.draw();
  }
  handleDoubleClick(event) {
    console.log('Double clicked');
    const { clientX, clientY } = event;
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = 1; i < this.rows; i++) {
      for (let j = 1; j < this.columns; j++) {
        let cell = this.data[i][j];
        if (cell.containsPoint(x, y)) {
          this.createInputField(event,cell);
          break;
        }
      }
    }
  }
 
 
  createInputField(event,cell) {
    console.log("create input field");

    console.log(this.canvas.offsetLeft + " " + this.canvas.offsetTop)
    const input = document.createElement("input");
    input.type = "text";
    input.value = cell.text;
    input.style.position = "absolute";
    input.style.left = `${cell.topX + this.canvas.offsetLeft}px`;
    input.style.top = `${cell.topY + this.canvas.offsetTop}px`;
    input.style.width = `${cell.width - 2}px`;
    input.style.height = `${cell.height - 2}px`; 
    input.style.fontSize = "12px"; 
    input.style.border = "1px solid #rgb(221,221,221)";
  
    input.style.boxSizing = "border-box";



    input.addEventListener("focus", () => {
      console.log("I am in foucs")
      // input.style.backgroundColor = "#0B57D0";
      input.style.borderColor = "red";
    });
    
    input.addEventListener("blur", () => {
      cell.text = input.value;
      document.body.removeChild(input);
      cell.deselect(); // Ensure the cell is properly redrawn
      // cell.draw();
      // cell.AddText(cell.text);
    });

    document.body.appendChild(input);
    input.focus();
    input.select();
  }

  handleMouseDown(event) {
    console.log("mouse move down: ");
    const { clientX, clientY } = event;
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    for (let i = 1; i < this.rows; i++) {
      for (let j = 1; j < this.columns; j++) {
        let cell = this.data[i][j];
        if (cell.isPointNearBorder(x, y)) {
          this.canvas.style.cursor = "col-resize";
          this.isResizing = true;
          this.resizeColumnIndex = j;
          this.startX = x;
          this.initialWidth = cell.width;
          break;
        }
      }
      if (this.isResizing) break;
    }
  
    this.selectCell(x, y);
  }

  handleMouseMove(event) {
    
    if (this.isResizing) {
      console.log("mouse moving ");
      const { clientX } = event;
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const newWidth = this.initialWidth + (x - this.startX);
      console.log("newWidth: " + newWidth);
      if (newWidth > 30) {
        for (let i = 1; i < this.rows; i++) {
          this.data[i][this.resizeColumnIndex].resize(newWidth);
        }
        this.columns_width[this.resizeColumnIndex] = newWidth;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.redraw();
      }
    }
  }

  handleMouseUp(event) {
    console.log("Mouse UP ");
    this.canvas.style.cursor = "default";
    this.isResizing = false;
    this.resizeColumnIndex = -1;
  }
  selectCell(x, y) {
    // Deselect previously selected cell
    if (this.selectedCell) {
      this.selectedCell.deselect();
      this.selectedCell = false;
    }

    // Find and select the new cell
    for (let i = 1; i < this.rows; i++) {
      for (let j = 1; j < this.columns; j++) {
        let cell = this.data[i][j];
        if (cell.containsPoint(x, y)) {
          cell.select();
          this.selectedCell = cell;
          return;
        }
      }
    }
  }
}

export default Table;
