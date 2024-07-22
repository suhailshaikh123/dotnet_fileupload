import Cell from './Cell.js';
class Header {
  constructor(context, columns,columns_width,data) {
    this.context = context;
    this.columns = columns;
    this.columns_width = columns_width;
    this.data = data;
  }
  draw(scrollY) {
    
    let text = "";
    let column_counter = "a";
    let topX = 0;
    let topY = scrollY;
    let width = 130;
    let height = 30;

    this.columns_width[0] = 130;
    console.log(this.columns_width)
    // this.data[0] = new Array(this.columns);
    for(let i= 0;i<this.columns;i++)
    {
        text = column_counter;
        column_counter = String.fromCharCode(column_counter.charCodeAt() + 1);
        let cell;
        if(i!= 0)
        {
            cell = new Cell(this.context, topX, topY, 30, this.columns_width[i], 0,i);            
         }
        else{
        cell = new Cell(this.context, topX, topY, 30, this.columns_width[i], 0,i);
        text = "";
        column_counter = "a";
        }
      cell.draw();
    
      cell.AddText(text);
      cell.isColumn = true;
      cell.AddText(text);
      this.data[0][i] = cell;
      topX += this.columns_width[i];
    }


    // for (let i = 0; i < this.columns; i++) {
    //   text = column_counter;
    //   column_counter = String.fromCharCode(column_counter.charCodeAt() + 1);
    //   let cell = new Cell(this.context, topX, topY, 30,this.columns_width[i], 0,i);

    //   cell.draw();
    //   cell.AddText(text);
    //   topX += width;
    // }
  }
  reDraw()
  {
    let text = "";
    let column_counter = "a";

    this.columns_width[0] = 130;
    console.log(this.columns_width)
    
    for(let i= 0;i<this.columns;i++)
    {

        text = column_counter;
        column_counter = String.fromCharCode(column_counter.charCodeAt() + 1);
        let cell = this.data[0][i];
        cell.draw();
    }
  }
}


export default Header;