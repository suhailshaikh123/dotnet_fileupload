class Cell {
  constructor(context, topX, topY, height, width, X, Y) {
    this.context = context;
    this.topX = topX;
    this.topY = topY;
    this.height = height;
    this.width = width;
    this.X = X;
    this.Y = Y;
    this.text = "";
    this.isRow = false;
    this.isColumn = false;
  }

  draw() {
    
    if (this.selected) {

      this.context.clearRect(this.topX,this.topY,this.width,this.height);

      this.context.fillStyle = "rgba(0, 120, 215, 0.3)"; // Light blue highlight
      // this.context.strokeStyle = "red"
      
      this.context.fillRect(this.topX, this.topY, this.width, this.height);
      // this.context.strokeRect(this.topX,this.topY,this.width,this.height);
      this.context.fillStyle = "black";
      this.context.strokeStyle = "#E1E1E1";
    }
    else{
        this.context.strokeStyle = "#E1E1E1";
        this.context.clearRect(this.topX,this.topY,this.width,this.height);
        this.context.strokeRect(this.topX, this.topY, this.width, this.height);
    }
    this.DrawText();
  }
  containsPoint(x, y) {
    return x >= this.topX && x <= this.topX + this.width && y >= this.topY && y <= this.topY + this.height;
}
  AddText(text) {
    this.text = text;
    this.context.font = "12px Arial";
    this.context.fillText(this.getWrapedText(text,this.width), this.topX + 12, this.topY + 20);
  }
  getWrapedText(text, width) {
    let fontSize = 12;
    let textWidth = text.length * fontSize
    let wrappedText = text
    if (textWidth >= width) {
        wrappedText = text.substring(0,( width / fontSize)+2)
    }
    return wrappedText
}
  DrawText() {
    this.context.font = "12px Arial";
    this.context.fillText(this.getWrapedText(this.text,this.width), this.topX + 12, this.topY + 20);
  }

  isPointNearBorder(x, y) {
    const margin = 3;
    return Math.abs(x - (this.topX + this.width)) < margin;
  }

  resize(newWidth) {
    this.width = newWidth;
  }
  select() {
    this.selected = true;
    this.draw();
  }

  deselect() {
    console.log("deselect has been caled")
    this.selected = false;
    this.draw();
  }
}

export default Cell;
