import Cell from "./Cell.js";
import Headers from "./Headers.js";
import Indexing from "./Indexing.js";
import Line from "./Line.js";

class Table {
  constructor(context, columns, rows, canvas) {
    this.context = context;
    this.columns = columns;
    this.rows = rows;

    this.isResizing = false;
    this.resizeColumnIndex = -1;
    this.resizeRowIndex = -1;
    this.startX = 0;
    this.initialWidth = 0;
    this.canvas = canvas;
    this.columns_width = new Array();
    for (let i = 0; i < this.columns; i++) this.columns_width.push(130);

    this.rows_width = new Array();
    for (let i = 0; i < this.rows; i++) this.rows_width.push(30);
    this.indexing = new Indexing(this.context, this.rows, this.data);
    this.selectedCell = [];
    this.isSelecting = false;
    this.verticalLines = new Array();
    for (let i = 0; i < this.columns; i++) this.verticalLines.push(30);
    this.horizontalLines = new Array();
    for (let i = 0; i < this.rows; i++) this.horizontalLines.push(30);
    this.endX = 0;
    this.endY = 0;
    this.startX = 0;
    this.startY = 0;
    this.scrollY = 0;
    this.scrollX = 0;
    this.currentRow = 0;
    this.currentColumn = 0;
    this.data = new Array();
    for (let i = 0; i < this.rows; i++) {
      this.data.push(new Array());
      for (let j = 0; j < this.columns; j++) {
        this.data[i].push(
          new Cell(
            this.context,
            0,
            0,
            0,
            0,
            0,
            0,
            this.columns_width,
            this.rows_width
          )
        );
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
    this.isShftPressed = false;
    this.isFileUploaded = false;
    this.csvData = [];
    this.dataMark = 0;
    this.currentPage = 1;
    this.searchInput = "none";
    this.sortInput = "none";
    this.isDataThere = true;
    this.isDeleteValid = false;
    this.isSortValid = false;
    this.headersCode = {};

  }

  reset() {
    for (let i = 0; i < this.columns; i++) this.columns_width.push(130);

    for (let i = 0; i < this.rows; i++) this.rows_width.push(30);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        let cell = this.data[i][j];
        cell.text = "";
      }
    }
    this.currentPage = 1;
    this.scrollY = 0;
    this.scrollX = 0;
    this.isDataThere = true;
    this.dataMark = 0;
  }
  // Draw Functions
  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawVerticalLines();
    this.drawHorizontalLines();
    this.drawIndex();
    this.drawHeaders();
    this.drawCells();
  }
  async fetchCsv() {
    console.log("I am inside fetchCSv");
    let url =
      "http://localhost:5139/api/User/GetAll/" +
      this.currentPage +
      "/" +
      this.sortInput +
      "/" +
      this.searchInput;
    try {
      const response = await fetch(url, {
        method: "GET",
      });
      const data = await response.json();

      this.drawCsv(data);
    } catch (error) {
      console.log(error);
    }
  }
  async handleSearching() {
    console.log("I am here to handle search ");
    const input = document.getElementsByClassName("input-email")[0];
    if (input.value == "") {
      this.searchInput = "none";
    } else {
      this.searchInput = input.value;
    }
    this.reset();
    this.fetchCsv();
  }

  async handleDelete() {
    if (this.isDeleteValid) {
      let top_cell = this.selectedCell[0];
      let UserId = this.data[top_cell.X][1].text;
      let url = "http://localhost:5139/api/User/Delete/" + UserId;
      try {
        const response = await fetch(url, {
          method: "GET",
        });
        const data = await response.json();
        console.log(data);
        alert(data.msg);
        this.reset();
        this.fetchCsv();
      } catch (error) {
        alert(data.msg);
      }
      console.log("can be deleted");
    } else {
      alert("Please select single row");
    }
  }
  async handleSort() {
    if (this.isSortValid) {
      console.log("can be sorted");
      let top_cell = this.selectedCell[0];
      let column_name = this.data[1][top_cell.Y].text;

      this.sortInput = column_name;
      console.log("sorting by " + column_name);
      this.reset();
      this.fetchCsv();
    } else {
      alert("Please select single column");
    }
  }
  drawCsv(csvData) {
    console.log("I am inside drawCsv " + this.dataMark, csvData.length);
    this.isFileUploaded = true;

    if (csvData.length != 0) {
      this.csvData = csvData;
      let keys = Object.keys(csvData[0]);

      //adding column name
      if (this.currentPage == 1) {
        for (let j = 1; j <= keys.length; j++) {
          let text = keys[j - 1];
          this.data[this.dataMark + 1][j].text = text;
        }
        this.dataMark++;
      }
      for (let i = 1; i <= csvData.length; i++) {
        let text = "";

        for (let j = 1; j <= keys.length; j++) {
          text = csvData[i - 1][keys[j - 1]];

          if (i + this.dataMark >= this.data.length) {
            console.log(i, this.data.length);
            this.appendRows();
            this.draw();
          }
          this.data[i + this.dataMark][j].text = text;
        }
      }
    } else {
      this.isDataThere = false;
    }
    this.currentPage++;
    this.dataMark += csvData.length;
    this.draw();
  }
  getVisibleHeight() {
    let canvas_height = this.canvas.height;
    let temp = 0;
    for (let i = this.currentRow; i < this.rows; i++) {
      if (temp > canvas_height) {
        return i;
      }
      temp += this.rows_width[i];
    }
    return Infinity;
  }
  drawHeaders() {
    for (let i = this.currentColumn +1; i < this.columns; i++) {
      if(this.headersCode[i] == undefined)
      {
        this.calculateHeadersCode(i);
      }
      let text = this.headersCode[i];
      this.data[0][i].text = text;
      this.data[0][i].topX = this.verticalLines[i].x1;
      this.data[0][i].topY = this.horizontalLines[0].y1;
      this.data[0][i].X = 0;
      this.data[0][i].Y = i;
      this.data[0][i].draw();
    }
  }
  calculateHeadersCode(columnNumber)
  {
    let columnName = [];
    let temp = columnNumber;
    while (columnNumber > 0) {
        // Find remainder
        let rem = columnNumber % 26;

        // If remainder is 0, then a
        // 'Z' must be there in output
        if (rem == 0) {
            columnName.push("Z");
            columnNumber = Math.floor(columnNumber / 26) - 1;
        }
        else // If remainder is non-zero
        {
            columnName.push(String.fromCharCode((rem - 1) + 'A'.charCodeAt(0)));
            columnNumber = Math.floor(columnNumber / 26);
        }
    }

    // Reverse the string and print result
    this.headersCode[temp] = columnName.reverse().join("");
    console.log(this.headersCode[temp]);
    
  }
  drawIndex() {
    const endRow = Math.min(this.getVisibleHeight(), this.rows);
    for (let i = this.currentRow + 1; i < endRow; i++) {
      this.data[i][0].text = i;
      this.data[i][0].topX = this.verticalLines[0].x1;
      this.data[i][0].topY = this.horizontalLines[i].y1;
      this.data[i][0].X = i;
      this.data[i][0].Y = 0;
      this.data[i][0].draw();
    }
  }
  drawCells() {
    const endRow = Math.min(this.getVisibleHeight(), this.rows);
    for (let i = this.currentRow + 1; i < endRow; i++) {
      for (let j = this.currentColumn + 1; j < this.columns; j++) {
        this.data[i][j].topX = this.verticalLines[j].x1;
        this.data[i][j].topY = this.horizontalLines[i].y1;
        this.data[i][j].X = i;
        this.data[i][j].Y = j;
        this.data[i][j].draw();
      }
    }
  }
  appendRows() {
    let rows_to_add = 500;
    this.rows += rows_to_add;
    while (rows_to_add > 0) {
      this.data.push(new Array());
      for (let j = 0; j < this.columns; j++) {
        this.data[this.data.length - 1].push(
          new Cell(
            this.context,
            0,
            0,
            0,
            0,
            0,
            0,
            this.columns_width,
            this.rows_width
          )
        );
      }
      this.rows_width.push(30);
      this.horizontalLines.push(30);
      rows_to_add--;
    }
  }
  appendColumns()
  {
    let columns_to_add = 50;
    this.columns += columns_to_add;
  
    for(let i =0;i<this.rows;i++)
    {
      columns_to_add = 50;
      while(columns_to_add > 0)
      {
        this.data[i].push(
          new Cell(
            this.context,
            0,
            0,
            0,
            0,
            0,
            0,
            this.columns_width,
            this.rows_width
          )
      
        );
        columns_to_add--;
        if(i == 0)
        {
          this.columns_width.push(130);
      this.verticalLines.push(30);
        }
        
      }
    }
    console.log(this.data)
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
    for (let i = this.currentColumn; i < this.columns_width.length; i++) {
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

    let { rowIndex, colIndex } = this.searchCell(x, y);
    if (rowIndex != 0 && colIndex != 0) {
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

    input.addEventListener("blur", () => {
      const formObject = {};
      const self = this; // Store reference to 'this'

      if (this.isFileUploaded) {
        let text = input.value;
        let csv_columns = Object.keys(this.csvData[0]).length;
        if (this.data[1][cell.Y].text == "email") {
          for (let i = 1; i < csv_columns; i++) {
            if (cell.Y == i) {
              formObject[this.data[1][i].text] = text;
            } else {
              formObject[this.data[1][i].text] = this.data[cell.X][i].text;
            }
          }
          UpdateEmail(formObject);
        } else {
          for (let i = 2; i < csv_columns; i++) {
            console.log("hello world ");
            if (cell.Y == i) {
              formObject[this.data[1][i].text] = text;
              console.log(this.data[1][i].text, text);
            } else {
              formObject[this.data[1][i].text] = this.data[cell.X][i].text;
              console.log(this.data[1][i].text, this.data[cell.X][i].text);
            }
          }

          UpdateData(formObject);
        }
      } else {
        cell.text = input.value;
        document.body.removeChild(input);
        cell.deselect();
        self.draw();
      }

      async function UpdateData(formObject) {
        try {
          const response = await fetch(
            "http://localhost:5139/api/User/Create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(formObject),
            }
          );
          const data = await response.json();
          console.log(data);

          if (response.status === 200) {
            cell.text = input.value;
          } else {
            alert(data.msg);
          }
          document.body.removeChild(input);
          cell.deselect();
          self.draw();
        } catch (error) {
          console.log("Error while updating data", error);
        }
      }

      async function UpdateEmail(formObject) {
        try {
          const response = await fetch(
            "http://localhost:5139/api/User/UpdateEmail",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(formObject),
            }
          );
          const data = await response.json();
          console.log(data);

          if (response.status === 200) {
            cell.text = input.value;
          } else {
            alert(data.msg);
          }
          document.body.removeChild(input);
          cell.deselect();
          self.draw();
        } catch (error) {
          console.log("Error while updating data", error);
        }
      }
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
    if (keyUp == "Shift") {
      this.isShftPressed = false;
    }
  }
  handleResize(event) {
    const rect = document.getElementById("navbar").getBoundingClientRect();
    this.canvas.width = window.innerWidth - 20;
    this.canvas.height = window.innerHeight - rect.height - 20;
    this.draw();
  }
  handleScroll(event) {
    const deltaY = event.deltaY;
    if (!this.isShftPressed) {
      this.scrollY += deltaY;
      this.scrollY = Math.max(0, this.scrollY);
      let temp = 0;
      for (let i = 0; i < this.rows_width.length; i++) {
        temp += this.rows_width[i];
        if (this.scrollY < temp) {
          console.log(this.data.length, this.dataMark);
          if (
            this.isFileUploaded &&
            this.isDataThere &&
            this.dataMark - this.currentRow <= 100
          ) {
            console.log(
              "dataLength is " +
                this.data.length +
                " dataMark is " +
                this.dataMark
            );
            this.fetchCsv();
          } else if (this.data.length - this.currentRow <= 30) {
            console.log("append rows");
            this.appendRows();
          }

          this.currentRow = i;
          this.draw();

          break;
        }
      }
    } else {
      console.log("horizontally scrolling ");
      this.scrollX += deltaY;
      this.scrollX = Math.max(0, this.scrollX);
      let temp = 0;
      for (let i = 0; i < this.columns_width.length; i++) {
        temp += this.columns_width[i];
        if (this.scrollX < temp) {
          if (this.data[0].length - this.currentColumn <= 10) {
            console.log("append columns");
            this.appendColumns();
          }

          this.currentColumn = i;
          console.log("currentcolumn is " + this.currentColumn)
          this.draw();

          break;
        }
      }
    }
  }
  async handleKeyPress(event) {
    const keyPressed = event.key;
    if (keyPressed == "Control") {
      this.ctrlPressed = true;
    }
    if (keyPressed == "Shift") {
      this.isShftPressed = true;
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
        console.log(current_cell.Y + " " + this.columns);
        if (current_cell.Y + 1 < this.columns) {
          console.log("ArrowRight");
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
        if (current_cell.X + 1 <= this.rows) {
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
        this.draw();
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
    this.isDeleteValid = false;
    this.isSortValid = false;
  }

  updateColumnSelect(column) {
    if (this.selectedCell.length == 0) {
      this.isSortValid = true;
    } else {
      this.isSortValid = false;
    }
    for (let i = 1; i < this.rows; i++) {
      this.data[i][column].select();
      this.updateMetaData(this.data[i][column]);
      this.addMetaDataToFrontend();
      this.selectedCell.push(this.data[i][column]);
    }
  }
  updateRowSelect(rowIndex) {
    console.log(this.selectedCell.length + " is");
    if (this.selectedCell.length == 0) {
      this.isDeleteValid = true;
    } else {
      this.isDeleteValid = false;
    }
    for (let i = 0; i < this.columns; i++) {
      this.data[rowIndex][i].select();
      if (i != 0) {
        this.updateMetaData(this.data[rowIndex][i]);
        this.addMetaDataToFrontend();
      }
      this.selectedCell.push(this.data[rowIndex][i]);
    }
  }
  selectCell(x, y) {
    this.clearMetaData();
    let { rowIndex, colIndex } = this.searchCell(x, y);
    if (rowIndex == 0 && colIndex == 0) return;
    console.log(colIndex, rowIndex);
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
    let colIndex = 0;
    let rowIndex = 0;

    // Find the column index based on x coordinate
    for (let j = 0; j < this.columns; j++) {
      let colStartX = this.data[0][j].topX;
      let colEndX = colStartX + this.columns_width[j];
      if (x >= colStartX && x < colEndX) {
        colIndex = j;
        break;
      }
    }
    const endRow = Math.min(this.getVisibleHeight(), this.rows);
    // Find the row index based on y coordinate
    for (let i = this.currentRow; i < endRow; i++) {
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
