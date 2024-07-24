import Cell from './Cell.js';
class Indexing {
  constructor(context, row,data) {
    this.context = context;
    this.row = row;
    this.data = data;
  }
  draw() {
    let text = "";
    let row_counter = 1;
    let height = 30;
    let width = 130;
    let topX = 0;
    let topY = 0;
    

    for (let i = 0; i < this.row; i++) {
      text = row_counter;
      row_counter+=1;
      let cell = new Cell(this.context, topX, topY, 30, 130, i, 0);
      if( i == 0)
      {
        text  = "";
        row_counter =1;
      }
      cell.draw();
      cell.isRow = true;
      cell.AddText(text);
      this.data[i][0] = cell;
      topY +=height;
    }
  }
}
export default Indexing;