function Table(props) {
  console.log(props.data);
    const headers = props.data.length > 0 ? Object.keys(props.data[0]) : [];
 
    return (
      <table className="table">
        <thead className="thead-dark">
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.data.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex}>{item[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
}
export default Table;
