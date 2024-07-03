import axios from "axios";
import { useNavigate } from "react-router-dom";
function Form(props) {
  const navigate = useNavigate();
  function handleClick(event) {
    event.preventDefault();
    const formData = new FormData(); // Create a FormData object
    const fileInput = document.getElementById("myfile"); // Get the file input element
    formData.append("file", fileInput.files[0]);
    console.log("file",formData.get("myfile"));
    props.setLoad(true);
    axios
      .post("http://localhost:5139/UploadCsv/fasterupload", formData, {
        onUploadProgress: (progressEvent) => {
          
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // Update your state or UI with the progress here
          props.setBar(()=>percentCompleted)
          console.log(`Upload progress: ${percentCompleted}%`);
         
        },
      })
      .then((response) => {
        console.log("called from form");
        // props.setData(response.data);
        console.log(response.data);
        props.setLoad(false);
      })
      .catch((error) => console.log(error));
    console.log("hello world");

    navigate("/secondpage");
  }
  return (
    <form enctype="multipart/form-data" onSubmit={handleClick}>
      <input type="file" id="myfile" name="myfile" accept=".csv" />
      <button type="submit">
        submit
      </button>
    </form>
  );
}

export default Form;
