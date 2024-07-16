import React from 'react'
import axios from "axios"
import { useNavigate } from 'react-router-dom';
function Insert() {
    const Navigate = useNavigate();
    function handleInsert() {
        let Name = document.getElementById("Name").value;
        let Email = document.getElementById("Email").value;
        let Country = document.getElementById("Country").value;
        let State = document.getElementById("State").value;
        let City = document.getElementById("City").value;
        let Telephone = document.getElementById("Telephone").value;
        let AddressLine1 = document.getElementById("AddressLine1").value;
        let AddressLine2 = document.getElementById("AddressLine2").value;
        let DateOfBirth = document.getElementById("DateOfBirth").value;
        let SalaryFY2019 = document.getElementById("SalaryFY2019").value;
        let SalaryFY2020 = document.getElementById("SalaryFY2020").value;
        let SalaryFY2021 = document.getElementById("SalaryFY2021").value;
        let SalaryFY2022 = document.getElementById("SalaryFY2022").value;
        let SalaryFY2023 = document.getElementById("SalaryFY2023").value;


  

        const formData = new FormData();
        
        var obj={
          Email:Email,
          Name:Name,
          Country:Country,
          State:State,
          City:City,
          Telephone:Telephone,
          AddressLine1:AddressLine1,
          AddressLine2:AddressLine2,
          DateOfBirth:DateOfBirth,
          SalaryFY2019:SalaryFY2019,
          SalaryFY2020:SalaryFY2020,
          SalaryFY2021:SalaryFY2021,
          SalaryFY2022:SalaryFY2022,
          SalaryFY2023:SalaryFY2023
        };
        console.log(obj.Email);
        formData.append("user",obj);
        // formData.append("Name", Name);
        // formData.append("Email", Email);
        
        // formData.append("Country", Country);
        // formData.append("State", State);
        // formData.append("City", City);

        // formData.append("Telephone", Telephone);
        // formData.append("AddressLine1", AddressLine1);
        // formData.append("AddressLine2", AddressLine2);

        // formData.append("DateOfBirth", DateOfBirth);

        // formData.append("SalaryFY2019", SalaryFY2019);
        // formData.append("SalaryFY2020", SalaryFY2020);
        // formData.append("SalaryFY2021", SalaryFY2021);
        // formData.append("SalaryFY2022", SalaryFY2022);
        // formData.append("SalaryFY2023", SalaryFY2023);

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
          }
        axios.post("http://localhost:5139/api/User/Create",formData)
        .then((response)=>
        {
            console.log(response.data)
        }).catch((err)=>{
          console.log(err);
        }
        )
    }
    
  return (
    <form className='insert-form' enctype="multipart/form-data">
        <div>
        <label for="Name">Name: </label>
        <input type="text" id="Name" name="Name" />
        </div>
        <div>
        <label for="Email">Email: </label>
        <input type="email" id="Email" name="Email" />
        </div>

        <div>
        <label for="Country">Country: </label>
        <input type="text" id="Country" name="Country" />
        </div>
        <div>
        <label for="State">State: </label>
        <input type="text" id="State" name="State" />
        </div>
        <div>
        <label for="Telephone">Telephone: </label>
        <input type="text" id="Telephone" name="Telephone" />
        </div>
        <div>
        <label for="City">City: </label>
        <input type="text" id="City" name="City" />
        </div>
        <div>
        <label for="AddressLine1">AddressLine1: </label>
        <input type="text" id="AddressLine1" name="AddressLine1" />
        </div>
        <div>
        <label for="AddressLine2">AddressLine2: </label>
        <input type="text" id="AddressLine2" name="AddressLine2" />
        </div>
        <div>
        <label for="DateOfBirth">DateOfBirth: </label>
        <input type="date" id="DateOfBirth" name="DateOfBirth" />
        </div>
        <div>
        <label for="SalaryFY2019">SalaryFY2019: </label>
        <input type="number" id="SalaryFY2019" name="SalaryFY2019" />
        </div>
        <div>
        <label for="SalaryFY2020">SalaryFY2020: </label>
        <input type="number" id="SalaryFY2020" name="SalaryFY2020" />
        </div>
        <div>
        <label for="DateOfBirth">SalaryFY2020: </label>
        <input type="number" id="DateOfBirth" name="DateOfBirth" />
        </div>
        <div>
        <label for="SalaryFY2021">SalaryFY2021: </label>
        <input type="number" id="SalaryFY2021" name="SalaryFY2021" />
        </div>
        <div>
        <label for="SalaryFY2022">SalaryFY2022: </label>
        <input type="number" id="SalaryFY2022" name="SalaryFY2022" />
        </div>
        <div>
        <label for="SalaryFY2023">SalaryFY2023: </label>
        <input type="number" id="SalaryFY2023" name="SalaryFY2023" />
        </div>
        <button onClick={handleInsert} type="button" value="button" className='btn btn-primary'>Submit </button>
    </form>

  )
}

export default Insert