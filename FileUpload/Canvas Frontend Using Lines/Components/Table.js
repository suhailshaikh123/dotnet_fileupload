import Cell from "./Cell.js";
import Headers from "./Headers.js";
import Indexing from "./Indexing.js";
import Line from "./Line.js";
class Table {
  constructor(context, columns, rows, canvas) {
    this.context = context;
    this.columns = columns;
    this.rows = rows;
    this.data = new Array(this.rows);
  
    this.isResizing = false;
    this.resizeColumnIndex = -1;
    this.resizeRowIndex = -1;
    this.startX = 0;
    this.initialWidth = 0;
    this.canvas = canvas;
    this.columns_width = new Array(this.columns);
    this.columns_width.fill(130);
    this.rows_width = new Array(this.rows);
    this.rows_width.fill(30);
    this.indexing = new Indexing(this.context, this.rows, this.data);
    this.selectedCell = [];
    this.isSelecting = false;
    this.verticalLines = new Array(this.columns);
    this.horizontalLines = new Array(this.rows);
    this.endX = 0;
    this.endY = 0;
    this.startX = 0;
    this.startY = 0;
    this.scrollY = 0;
    this.currentRow = 0;
    for (let i = 0; i < this.rows; i++) {
      this.data[i] = new Array(this.columns);
      for (let j = 0; j < this.columns; j++) {
        this.data[i][j] = new Cell(this.context, 0, 0, 0, 0,0,0,this.columns_width,this.rows_width);
        
      }
    }
 
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
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawVerticalLines();
    this.drawHorizontalLines();
    this.drawHeaders();
    this.drawIndex();
    this.drawCells();
    console.log(this.data)
  }
  drawCsv(csvData) {
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
    this.draw();
  }
  drawHeaders() {
    let column_counter = "a";
    for (let i = 1; i < this.columns; i++) {
      this.data[0][i].text = column_counter;
      column_counter = String.fromCharCode(column_counter.charCodeAt() + 1);
      // this.data[0][i].draw();
    }
    for(let i =1 ;i<this.verticalLines.length;i++)
    {
      // this.verticalLines - > columns
      this.data[0][i].topX = this.verticalLines[i].x1;
      this.data[0][i].topY = this.horizontalLines[0].y1;
      this.data[0][i].X = 0;
      this.data[0][i].Y = i;

      this.data[0][i].draw();
    }
  }
  drawIndex() {
    for (let i = this.currentRow; i < this.rows; i++) {
      this.data[i][0].text = i;
      
    }
  }
  drawCells() {
    for (let i = this.currentRow + 1; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.data[i][j].topX = this.verticalLines[j].x1;
        this.data[i][j].topY = this.horizontalLines[i].y1;
        this.data[i][j].X = i;
        this.data[i][j].Y = j;
        this.data[i][j].draw();
      }
    }
  }
  
  drawHorizontalLines() {
    let temp = 0;
    let l;
    for (let i = this.currentRow; i < this.rows_width.length; i++) {
      l = new Line(this.context, this.canvas, 5, temp, this.canvas.width, temp);
      temp += this.rows_width[i];
      l.isHorizontal = true;
      this.horizontalLines[i] = l;
      l.drawLine();
    }
  }
  
  drawVerticalLines() {
 
    let temp = 0;
    for (let i = 0; i < this.columns; i++) {
      let l = new Line(
        this.context,
        this.canvas,
        temp,
        0,
        temp,
        this.canvas.height
      );
      temp = temp + this.columns_width[i];
      this.verticalLines[i] = l;
      l.drawLine();
    }
  }

  handleMouseDown(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    // checking for a line
    let flag = false;
    for (let i = 1; i < this.verticalLines.length; i++) {
      if (this.verticalLines[i].isNearBorder(x, y)) {
        this.canvas.style.cursor = "col-resize";
        flag = true;
        this.resizeColumnIndex = i;
        this.isResizing = true;
        this.startX = x;
        this.initialWidth = this.columns_width[this.resizeColumnIndex - 1];
        break;
      }
    }
    if (!flag) {
      for (let i = this.currentRow + 1; i < this.horizontalLines.length; i++) {
        if (this.horizontalLines[i].isNearBorder(x, y)) {
          this.canvas.style.cursor = "row-resize";
          this.isResizing = true;
          this.resizeRowIndex = i;
          this.startY = y;
          this.initialHeight = this.rows_width[this.resizeRowIndex - 1];
          break;
        }
      }
    }
    if (!this.isResizing) {
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
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    if (this.isResizing) {
      if (this.resizeColumnIndex != -1) {
        const newWidth = this.initialWidth + (x - this.startX);
        if (newWidth > 30) {
          this.columns_width[this.resizeColumnIndex - 1] = newWidth;
          this.draw();
        }
      }
      if (this.resizeRowIndex != -1) {
        const newHeight = this.initialHeight + (y - this.startY);
        if (newHeight > 30) {
          this.rows_width[this.resizeRowIndex - 1] = newHeight;
          this.draw();
        }
      }
    } else if (this.isSelecting) {
      this.clearMetaData();
      this.clearSelect();
      this.endX = x;
      this.endY = y;
  
      this.updateSelect();
    }
  }
  
  handleDoubleClick(event) {

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    let {rowIndex,colIndex} = this.searchCell(x,y);
    if(rowIndex != 0 && colIndex != 0)
    {
      let cell = this.data[rowIndex][colIndex];
      this.createInputField(event, cell);
    }

  }
  createInputField(event, cell) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = cell.text;
    input.style.position = "absolute";
    input.style.left = `${cell.topX + this.canvas.offsetLeft}px`;
    input.style.top = `${cell.topY + this.canvas.offsetTop}px`;
    input.style.width = `${this.columns_width[cell.Y] - 2}px`;
    input.style.height = `${this.rows_width[cell.X] - 2}px`;
    input.style.fontSize = "12px";
    input.style.border = "1px solid #rgb(221,221,221)";
  
    input.style.boxSizing = "border-box";
  
    input.addEventListener("focus", () => {
      // input.style.backgroundColor = "#0B57D0";
      input.style.borderColor = "red";
    });
  
    input.addEventListener("blur", () => {
      console.log(cell);
      cell.text = input.value;
      console.log(cell.text)
      console.log(cell);
      document.body.removeChild(input);
      cell.deselect();
      this.draw();
    });
  
    document.body.appendChild(input);
    input.focus();
    input.select();
  }
  handleMouseUp(event) {
    this.canvas.style.cursor = "default";
    this.isResizing = false;
    this.resizeColumnIndex = -1;
    this.resizeRowIndex = -1;
    this.startX = 0;
    this.isSelecting = false;
    console.log(this.metaData);
  }
  handleKeyUp(event) {
    const keyUp = event.key;
    if (keyUp == "Control") {
      this.ctrlPressed = false;
    }
  }
  handleScroll(event) {
  const deltaY = event.deltaY;
  this.scrollY+=deltaY;
  this.scrollY = Math.max(0,this.scrollY);
  let temp = 0;
  console.log("scroll")
  for(let i = 0;i<this.rows_width.length;i++)
  {
    temp += this.rows_width[i];
    if(this.scrollY < temp)
    {
      this.currentRow = i;
      console.log("rowNumber is "+ i);
      this.draw();
      break;
    }
  }
  
  }
  async handleKeyPress(event) {
    const keyPressed = event.key;
    if (keyPressed == "Control") {
      this.ctrlPressed = true;
    }
    if (this.isSelecting == false && this.selectedCell.length <= 3) {
      let current_cell = this.selectedCell[0];
      let next_cell = null;
      let row_cell;
      let col_cell;
      if (this.ctrlPressed) {
        if (keyPressed == "c") {
          navigator.clipboard.writeText(current_cell.text);
        } else if (keyPressed == "v") {
          const pastedValue = await navigator.clipboard.readText();
          current_cell.text = pastedValue;
          this.draw();
        }
        return;
      }
      if (keyPressed == "ArrowRight") {
        console.log(current_cell.Y + " " + this.columns)
        if (current_cell.Y + 1 < this.columns) {
          console.log("ArrowRight")
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
        this.draw()
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

    for (let i = this.currentRow; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        let cell = this.data[i][j];
        const cellRight = cell.topX + this.columns_width[cell.Y];
        const cellBottom = cell.topY + this.rows_width[cell.X];

        if (
          cell.topX < maxX &&
          cellRight > minX &&
          cell.topY < maxY &&
          cellBottom > minY
        ) {
          if (cell.X == 0) {
            this.updateColumnSelect(cell.Y);
          } else if (cell.Y == 0) {
            this.updateRowSelect(cell.X);
          } else {
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
    this.draw();
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
    console.log(this.selectedCell)
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
    if (rowIndex == -1 || colIndex == -1) return;

    if (rowIndex == 0) {
      this.updateColumnSelect(colIndex);
    } else if (colIndex == 0) {
      this.updateRowSelect(rowIndex);
    } else if (
      rowIndex >= this.currentRow + 1 &&
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
    this.draw();
  }


  // Helper function
  searchCell(x, y) {
    let colIndex = -1;
    let rowIndex = -1;

    // Find the column index based on x coordinate
    for (let j = 0; j < this.columns; j++) {
      let colStartX = this.data[0][j].topX;
      let colEndX = colStartX + this.columns_width[j];
      if (x >= colStartX && x < colEndX) {
        colIndex = j;
        break;
      }
    }

    // Find the row index based on y coordinate
    for (let i = this.currentRow; i < this.rows; i++) {
      let rowStartY = this.data[i][0].topY;
      let rowEndY = rowStartY + this.rows_width[i];
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


// redraw() {
//   console.log("Redraw Has Been Called");
//   for (let i = 0; i < this.data.length; i++) {
//     for (let j = 1; j < this.data[i].length; j++) {
//       if (j != 1) {
//         this.data[i][j].topX =
//           this.data[i][j - 1].topX + this.data[i][j - 1].width;
//       }

//       this.data[i][j].draw();
//     }
//   }

//   this.indexing.draw();
// }


