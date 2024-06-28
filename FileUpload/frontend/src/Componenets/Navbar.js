import { Link } from "react-router-dom";
import axios from "axios";
function Navbar(props) {
    function handleSort(event)
    {
        const selectedValue = event.target.value;
        props.setSortDetails(selectedValue)
        
        axios.post("http://localhost:3002/fetch",{currentPage:1,sort:selectedValue,search:props.search}).then((response)=>
            {
              if(response.data.msg === false)
                {
                  alert("please submit the form first")
                }
                else{
              console.log(response.data.data);
              props.setData(response.data.data);
                }
            }).catch((error)=>
            {
              console.log(error);
            })
          props.setCurrentPage(1);
    }

    function handleSearch(event)
    {

      event.preventDefault();
      const searchValue=document.querySelector('input[aria-label="Search"]').value;
      props.setSearch(searchValue);
      console.log(searchValue);

      axios.post("http://localhost:3002/fetch",{currentPage:1,sort:props.sortDetails,search:searchValue}).then((response)=>
        {
          
          if(response.data.msg === false)
            {
              alert("please submit the form first")
            }
            else{
              console.log("called")
          console.log(response.data.data);
          props.setData(response.data.data);
            }
        }).catch((error)=>
        {
          console.log(error);
        })

        props.setCurrentPage(1);
    }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" href="#">
          MyUploader
        </Link>
        
        <div className="navbar-collapse mr-auto"  id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link aria-current="page" className="nav-link active" href="#" to="/secondpage/insert">
                Insert
              </Link>
            </li>
       
       
            <li className="nav-item">
              <Link aria-current="page" className="nav-link active" href="#" to="/secondpage/delete">
                Delete
              </Link>
            </li>

            <li className="nav-item dropdown d-flex align-items-center ml-2 mr-2">
              <label for="sort" className="">Sort by: </label>
              <select name="sort by" id="sort" onChange={handleSort}>
              <option>none</option>
                <option >name</option>
                <option >email</option>
                <option >age</option>
              </select>
            </li>

  
          </ul>
          <form className="d-flex">
            <input
              aria-label="Search"
              className="form-control me-2"
              placeholder="Search by Email"
              type="search"
            />
            <button className="btn btn-outline-success" type="button" onClick={handleSearch}>
              Search
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
