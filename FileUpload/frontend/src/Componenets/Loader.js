import React from "react";

function Loader(props) {
  return (
    // <div class="spinner-grow" role="status">
    //   <span class="sr-only">Loading...</span>
    // </div>
    <div className="progress" >
      <div
        className="progress-bar"
        role="progressbar"
        style={{ width: props.bar+"%" }}
        aria-valuenow={25}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={"Progress: "+props.bar+"%"} // Accessible name for the progress bar
      >
        {props.bar+"%"}
      </div>
    </div>
  );
}

export default Loader;
