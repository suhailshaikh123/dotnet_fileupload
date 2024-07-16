import { useRef, useEffect } from "react";
function Table(props) {
  console.log(props.data);
  const canvasRef = useRef(null);

  useEffect(() => {
    function DrawColumns(x, y, cell_height, cell_width, ctx) {
      const keys = Object.keys(props.data[0]);
      console.log(keys[0]);
      for (var j = 0; j < keys.length; j++) {
        ctx.strokeRect(x, y, cell_width, cell_height);
        // ctx.clearRect(x + 1, y + 1, cell_width - 2, cell_height - 2);
        ctx.fillText(keys[j], x + 20, y + 30);
        x += cell_width;
      }
    }

    function DrawRows(x, y, cell_height, cell_width, ctx) {
      const keys = Object.keys(props.data[0]);
      for (var i = 0; i < props.data.length; i++) {
        for (var j = 0; j < keys.length; j++) {
          ctx.strokeRect(x, y, cell_width, cell_height);
          // ctx.clearRect(x + 1, y + 1, cell_width - 2, cell_height - 2);
          ctx.fillText(props.data[i][keys[j]], x + 20, y + 30);
          x += cell_width;
        }
        x = 0;
        y += cell_height;
      }
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    console.log("helloworld" + props.data[0]);
    if (props.data[0] != null) {
      // const height = 800;
      const width = 1800;
      canvas.height = 800;
      canvas.width = width;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var x = 0;
      var y = 0;
      var cell_height = 60;
      var cell_width = 120;

      ctx.font = "15px Arial";

      DrawColumns(x, y, cell_height, cell_width, ctx);
      x = 0;
      y += cell_height;
      DrawRows(x, y, cell_height, cell_width, ctx);
    }
  }, [props.data]);
  return (
   
      <canvas ref={canvasRef}>Canvas</canvas>
   
  );
}
export default Table;
