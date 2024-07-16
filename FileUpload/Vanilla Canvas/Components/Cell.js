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
  }

  draw() {
    
    if (this.selected) {
      this.context.fillStyle = "rgba(0, 120, 215, 0.3)"; // Light blue highlight
      this.context.fillRect(this.topX, this.topY, this.width, this.height);
      this.context.fillStyle = "#E1E1E1"; // Reset to default fill color
    }
    else{
        this.context.clearRect(this.topX,this.topY,this.width,this.height);
        this.context.strokeRect(this.topX, this.topY, this.width, this.height);
        this.DrawText();
    }
  }
  containsPoint(x, y) {
    return x >= this.topX && x <= this.topX + this.width && y >= this.topY && y <= this.topY + this.height;
}
  AddText(text) {
    this.text = text;
    this.context.fillText(text, this.topX + 20, this.topY + 20);
  }
  DrawText() {
    this.context.fillText(this.text, this.topX + 20, this.topY + 20);
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
