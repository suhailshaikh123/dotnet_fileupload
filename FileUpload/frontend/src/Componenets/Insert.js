import React from 'react'
import axios from "axios"
import { useNavigate } from 'react-router-dom';
function Insert() {
    const Navigate = useNavigate();
    function handleInsert() {
        let name = document.getElementById("name").value;
        let email = document.getElementById("email").value;
        let age = document.getElementById("age").value;
        let address = document.getElementById("address").value;
        console.log(name+" "+age+" "+address+" "+email);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("age", age);
        formData.append("address", address);

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
          }
        axios.post("http://localhost:3002/insert",formData)
        .then((response)=>
        {
            if(response.data.msg === "success")
                {
                    alert("Data Inserted Successfully");
                    Navigate(-1);
                }
                else{
                    alert("Data Insert Failed");
                }
        })
    }
    
  return (
    <form className='insert-form' enctype="multipart/form-data">
        <div>
        <label for="name">Name: </label>
        <input type="text" id="name" name="name" />
        </div>
        <div>
        <label for="email">email: </label>
        <input type="text" id="email" name="email" />
        </div>
        <div>
        <label for="age">age: </label>
        <input type="number" id="age" name="age" />
        </div>
        <div>
        <label for="address">address: </label>
        <input type="text" id="address" name="address" />
        </div>
        <button onClick={handleInsert} type="button" value="button" className='btn btn-primary'>Submit </button>
    </form>

  )
}

export default Insert