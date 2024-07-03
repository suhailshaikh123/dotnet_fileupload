import axios from "axios";
function Pagination(props)
{

    function handleNext()
    {
      let url="http://localhost:5139/api/User/GetAll/"+props.currentPage+1+"/"+props.sortDetails+"/"+props.search;
      console.log(url);
      axios.get(url).then((response)=>
        {

          if(response.data.msg === false)
            {
              alert("please submit the form first")
            }
            else{
              console.log("called pagination")
            console.log(response.data);
          props.setData(response.data);
            }
        }).catch((error)=>
        {
          console.log(error);
        })
      props.setCurrentPage(props.currentPage + 1);
  
      
    }
    function handlePrevious()
    {let url="http://localhost:5139/api/User/GetAll/"+props.currentPage-1+"/"+props.sortDetails+"/"+props.search;
      console.log(url);
      if(props.currentPage!==1)
        {
          
      axios.get(url).then((response)=>
      {
        //console.log(response.data.data);
        if(response.data.msg === false)
          {
            alert("please submit the form first")
          }else
        props.setData(response.data);

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
