class Line {
  constructor(context, canvas, x1, y1, x2, y2) {
    this.context = context;
    this.canvas = canvas;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.isVertical = false;
    this.isHorizontal = false;
  }

  drawLine() {
    this.context.fillStyle = "black";
    this.context.strokeStyle = "#E1E1E1";
    this.context.lineWidth = 1;
    this.context.beginPath();
    this.context.moveTo(this.x1 + 0.5, this.y1);
    this.context.lineTo(this.x2 + 0.5, this.y2);
    // this.context.strokeFill("red");
    this.context.stroke();
  }
  isNearBorder(x, y) {
    let margin = 3;

    return Math.abs(x - this.x1) <= margin || Math.abs(y - this.y1) <= margin;
  }
}

export default Line;
