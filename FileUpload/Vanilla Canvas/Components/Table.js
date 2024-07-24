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
    this.indexing = new Indexing(this.context, this.rows, this.data);
    this.selectedCell = [];
    this.isSelecting = false;
    this.endX = 0;
    this.endY = 0;
    this.startX = 0;
    this.startY = 0;
    this.metaData = {
      sum: 0,
      average: 0,
      min: Infinity,
      max: -Infinity,
      count: 0,
      count_numbers: 0,
    };
    this.isCtrlPressed = false;
  }

  // Draw Functions
  draw() {
    let width = 130;
    let height = 30;
    let topX = width;
    let topY = height;
    for (let i = 1; i < this.rows; i++) {
      let text = "";
      this.data[i] = new Array(this.columns);
      for (let j = 1; j < this.columns; j++) {
        text = "";
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
    this.data[0] = new Array(this.columns);
    this.indexing.draw();
  }
  drawCsv(csvData) {
    let width = 130;
    let height = 30;
    let topX = width;
    let topY = height;
    let keys = Object.keys(csvData[0]);
    for (let i = 1; i <= csvData.length; i++) {
      let text = "";

      for (let j = 1; j <= keys.length; j++) {
        if (i == 1) {
          text = keys[j - 1];
        } else {
          text = csvData[i - 1][keys[j - 1]];
        }
        this.data[i][j].text = text;
      }
    }
    this.redraw();
  }

  redraw() {
    console.log("Redraw Has Been Called")
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 1; j < this.data[i].length; j++) {
        if (j != 1) {
          this.data[i][j].topX =
            this.data[i][j - 1].topX + this.data[i][j - 1].width;
        }

        this.data[i][j].draw();
      }
    }

    this.indexing.draw();
  }

  createInputField(event, cell) {
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
  handleDoubleClick(event) {
    const { clientX, clientY } = event;
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = 1; i < this.rows; i++) {
      for (let j = 1; j < this.columns; j++) {
        let cell = this.data[i][j];
        if (cell.containsPoint(x, y)) {
          this.createInputField(event, cell);
          break;
        }
      }
    }
  }
  handleMouseDown(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const delta = [-1, 0, 1];
    let { rowIndex, colIndex } = this.searchCell(x, y);
    for (let i = 0; i < delta.length; i++) {
      for (let j = 0; j < delta.length; j++) {
        let row = rowIndex + delta[j];
        let col = colIndex + delta[i];
        if (row >= 0 && row < this.rows && col >= 0 && col < this.columns) {
          let cell = this.data[row][col];
          if (cell.isPointNearBorder(x, y)) {
            this.canvas.style.cursor = "col-resize";
            this.isResizing = true;
            this.resizeColumnIndex = col;
            this.startX = x;
            this.initialWidth = cell.width;

            break;
          }
        }
      }
      if (this.isResizing) break;
    }

    if (this.isResizing == false) {
      this.clearSelect();
      this.isSelecting = true;

      this.startX = x;
      this.startY = y;
      this.endX = x;
      this.endY = y;
      this.selectCell(x, y);
    }

    
  }

  handleMouseMove(event) {
    const { clientX } = event;
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (this.isResizing) {
      const newWidth = this.initialWidth + (x - this.startX);

      if (newWidth > 30) {
        for (let i = 0; i < this.rows; i++) {
          this.data[i][this.resizeColumnIndex].resize(newWidth);
        }
        this.columns_width[this.resizeColumnIndex] = newWidth;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.redraw();
      }
    } else if (this.isSelecting) {
      this.clearMetaData();
      this.clearSelect();
      this.endX = x;
      this.endY = y;

      this.updateSelect();
    }
 
  }
  handleMouseUp(event) {
    this.canvas.style.cursor = "default";
    this.isResizing = false;
    this.resizeColumnIndex = -1;
    this.isSelecting = false;
    console.log(this.metaData);
  }
  handleKeyUp(event)
  {
    const keyUp = event.key;
    if(keyUp == "Control")
    {
      this.ctrlPressed = false;
    }
  }
  handleScroll(event)
  {
    // console.log("scroll")
    const element  = document.documentElement;
    const scrollTop = element.scrollTop
    const height  = element.scrollHeight;
    const per  = (scrollTop/height)*100
    console.log("percentage is "+per)
    const lower_canvas = document.getElementsByClassName("canvas-lower")[0];
    console.log("height is "+ lower_canvas)  
    if(per >80)
    {
      console.log("condition hit")
    }
    console.log( this.canvas.height)
  }
  async handleKeyPress(event) {
    const keyPressed = event.key;
    if(keyPressed == "Control")
    {
      this.ctrlPressed = true;
    }
    if (this.isSelecting == false && this.selectedCell.length <= 3) {
      let current_cell = this.selectedCell[0];
      let next_cell = null;
      let row_cell;
      let col_cell;
      if(this.ctrlPressed)
      {
        if(keyPressed == "c"){
        navigator.clipboard.writeText(current_cell.text);
        }
        else if(keyPressed == "v")
        {
          const pastedValue  = await navigator.clipboard.readText();
          current_cell.text = pastedValue;
          current_cell.draw();
        }
        return;
      }
      if (keyPressed == "ArrowRight") {
        if (current_cell.Y + 1 < this.columns) {
          next_cell = this.data[current_cell.X][current_cell.Y + 1];
          row_cell = this.data[current_cell.X][0];
          col_cell = this.data[0][current_cell.Y + 1];
        }
      }
      if (keyPressed == "ArrowLeft") {
        if (current_cell.Y - 1 >= 0) {
          next_cell = this.data[current_cell.X][current_cell.Y - 1];
          row_cell = this.data[current_cell.X][0];
          col_cell = this.data[0][current_cell.Y - 1];
        }
      }
      if (keyPressed == "ArrowUp") {
        if (current_cell.X - 1 >= 0) {
          next_cell = this.data[current_cell.X - 1][current_cell.Y];
          row_cell = this.data[current_cell.X - 1][0];
          col_cell = this.data[0][current_cell.Y];
        }
      }
      if (keyPressed == "ArrowDown") {
        if (current_cell.X + 1 <= this.columns) {
          next_cell = this.data[current_cell.X + 1][current_cell.Y];
          row_cell = this.data[current_cell.X + 1][0];
          col_cell = this.data[0][current_cell.Y];
        }
      }
      if (next_cell != null) {
        this.clearSelect();
        this.selectedCell.push(next_cell);
        this.selectedCell.push(row_cell);
        this.selectedCell.push(col_cell);
        next_cell.select();
        row_cell.select();
        col_cell.select();
      }
    }
  }

  updateMetaData(cell) {
    let text = cell.text;
    if (text !== "") this.metaData.count += 1;
    text = Number(text);

    if (text) {
      this.metaData.max = Math.max(this.metaData.max, text);
      this.metaData.min = Math.min(this.metaData.min, text);
      this.metaData.sum += text;
      this.metaData.count_numbers += 1;
      this.metaData.average = (this.metaData.sum / this.metaData.count).toFixed(
        2
      );
    }
  }
  clearMetaData() {
    this.metaData = {
      sum: 0,
      average: 0,
      min: Infinity,
      max: -Infinity,
      count: 0,
      count_numbers: 0,
    };
  }
  // Selection Functions
  updateSelect() {
    const minX = Math.min(this.startX, this.endX);
    const maxX = Math.max(this.startX, this.endX);
    const minY = Math.min(this.startY, this.endY);
    const maxY = Math.max(this.startY, this.endY);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        let cell = this.data[i][j];
        const cellRight = cell.topX + cell.width;
        const cellBottom = cell.topY + cell.height;

        if (
          cell.topX < maxX &&
          cellRight > minX &&
          cell.topY < maxY &&
          cellBottom > minY
        ) {
          if(cell.isColumn)
          {
            this.updateColumnSelect(cell.Y);
          }
          else if(cell.isRow)
          {
            this.updateRowSelect(cell.X);
          }
          else{
          let row_cell = this.data[0][cell.Y];
          let col_cell = this.data[cell.X][0];

          cell.select();
          row_cell.select();
          col_cell.select();

          this.updateMetaData(cell);

          this.selectedCell.push(cell);
          this.selectedCell.push(row_cell);
          this.selectedCell.push(col_cell);
        }
        }
      }
    }
    this.addMetaDataToFrontend();
  }
  addMetaDataToFrontend() {
    let select = document.getElementById("list");
    select.innerHTML = "";
    for (const [key, value] of Object.entries(this.metaData)) {
      let option = document.createElement("option");
      option.text = `${key}:  ${value}`;
      select.appendChild(option);
    }
  }
  clearSelect() {
    for (let i = 0; i < this.selectedCell.length; i++) {
      this.selectedCell[i].deselect();
    }
    this.selectedCell = [];
  }

  updateColumnSelect(column) {
    for (let i = 1; i < this.rows; i++) {
      this.data[i][column].select();
      this.updateMetaData(this.data[i][column]);
      this.addMetaDataToFrontend();
      this.selectedCell.push(this.data[i][column]);
    }
  }
  updateRowSelect(rowIndex) {
    for (let i = 0; i < this.columns; i++) {
      this.data[rowIndex][i].select();
      this.updateMetaData(this.data[rowIndex][i]);
      this.addMetaDataToFrontend();
      this.selectedCell.push(this.data[rowIndex][i]);
    }
  }
  selectCell(x, y) {
    this.clearMetaData();

    let { rowIndex, colIndex } = this.searchCell(x, y);
    if (rowIndex == -1 && colIndex == -1) return;
    if (rowIndex == -1) {
      this.updateColumnSelect(colIndex);
    } else if (colIndex == -1) {
      this.updateRowSelect(rowIndex);
    }
    else if (
      rowIndex >= 1 &&
      rowIndex < this.rows &&
      colIndex >= 1 &&
      colIndex < this.columns
    ) {
      let cell = this.data[rowIndex][colIndex];
      let row_cell = this.data[rowIndex][0];
      let col_cell = this.data[0][colIndex];
      this.updateMetaData(cell);
      this.addMetaDataToFrontend();
      cell.select();
      row_cell.select();
      col_cell.select();

      this.selectedCell.push(cell);
      this.selectedCell.push(row_cell);
      this.selectedCell.push(col_cell);
    }
  }

  // Helper function
  searchCell(x, y) {
    let colIndex = -1;
    let rowIndex = -1;

    // Find the column index based on x coordinate
    for (let j = 1; j < this.columns; j++) {
      let colStartX = this.data[1][j].topX;
      let colEndX = colStartX + this.columns_width[j];
      if (x >= colStartX && x < colEndX) {
        colIndex = j;
        break;
      }
    }

    // Find the row index based on y coordinate
    for (let i = 1; i < this.rows; i++) {
      let rowStartY = this.data[i][1].topY;
      let rowEndY = rowStartY + this.data[i][1].height;
      if (y >= rowStartY && y < rowEndY) {
        rowIndex = i;
        break;
      }
    }

    return { rowIndex, colIndex };
  }

  getData() {
    return this.data;
  }

  getColumnsWidth() {
    return this.columns_width;
  }
}

export default Table;
