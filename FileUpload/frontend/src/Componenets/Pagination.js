import axios from "axios";
function Pagination(props)
{

    function handleNext()
    {
      axios.post("http://localhost:3002/fetch",{currentPage:props.currentPage+1,sort:props.sortDetails,search:props.search}).then((response)=>
        {

          if(response.data.msg === false)
            {
              alert("please submit the form first")
            }
            else{
              console.log("called pagination")
          console.log(response.data.data);
          props.setData(response.data.data);
            }
        }).catch((error)=>
        {
          console.log(error);
        })
      props.setCurrentPage(props.currentPage + 1);
  
      
    }
    function handlePrevious()
    {
      if(props.currentPage!==1)
        {
          
      axios.post("http://localhost:3002/fetch",{currentPage:props.currentPage-1,sort:props.sortDetails,search:props.search}).then((response)=>
      {
        //console.log(response.data.data);
        if(response.data.msg === false)
          {
            alert("please submit the form first")
          }else
        props.setData(response.data.data);

        console.log("called pagination")
      }).catch((error)=>
      {
        console.log(error);
      })
      
      props.setCurrentPage(props.currentPage - 1);
    }
  
    }

    return (
        <nav aria-label="Page navigation example">
            <ul className="pagination">
                <li><button className="btn btn-primary" onClick={handlePrevious}>Previous</button></li>
                <li><button className="btn btn-primary disabled" onClick={handleNext}>{props.currentPage}</button></li>
                <li><button className="btn btn-primary" onClick={handleNext}>Next</button></li>
                
            </ul>
        
</nav>
    )
}

export default Pagination;
