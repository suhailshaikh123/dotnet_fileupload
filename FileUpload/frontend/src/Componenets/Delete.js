import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
function Delete() {
    const Navigate = useNavigate();
    function handleDelete(event)
    {
        event.preventDefault();
        const email = document.getElementById("email").value;
        axios.post("http://localhost:3002/delete",{email:email}).then((response)=>
        {
            if(response.data.msg === "success")
                {
                    alert("Data Deleted Successfully");
                    Navigate(-1);
                   
                }
                else{
                    alert("Email Does Not Exist")
                }
        })
    }

  return (
    <form className='insert-form' enctype="multipart/form-data">
    <h1>Enter Email You want to delete.</h1>
    <div>
   
    <input type="text" id="email" name="email" />
    </div>
  
 
    <button onClick={handleDelete} type="button" value="button" className='btn btn-primary'>Submit </button>
</form>
  )
}

export default Delete