import "./App.css";
import { lazy, Suspense } from "react";
import Form from "./Componenets/Form";
// import Table from "./Componenets/Table";
import Pagination from "./Componenets/Pagination";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Componenets/Navbar";
import Loader from "./Componenets/Loader";
import Insert from "./Componenets/Insert";
import Delete from "./Componenets/Delete";
const Table = lazy(() => import("./Componenets/Table"));

function App() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [load, setLoad] = useState(false);
  const [sortDetails, setSortDetails] = useState("none");
  const [search, setSearch] = useState("none");
  const [bar, setBar] = useState(0);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="form-container">
                <Form
                  data={data}
                  setData={setData}
                  load={load}
                  setLoad={setLoad}
                  sortDetails={sortDetails}
                  setSortDetails={setSortDetails}
                  bar={bar}
                  setBar={setBar}
                />
              </div>
            </>
          }
        />
        <Route
          path="/secondpage"
          element={
            <>
              <Navbar
                sortDetails={sortDetails}
                setSortDetails={setSortDetails}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setData={setData}
                search={search}
                setSearch={setSearch}
              />
              <div className="container mt-1">
                {load && <Loader bar={bar} setBar={setBar} />}
              </div>

              <div className="container">
                <Suspense>
                  <Table data={data} load={load} setLoad={setLoad} />
                </Suspense>
                <Pagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  setData={setData}
                  load={load}
                  setLoad={setLoad}
                  sortDetails={sortDetails}
                  setSortDetails={setSortDetails}
                  search={search}
                  setSearch={setSearch}
                />
              </div>
            </>
          }
        />
        <Route path="/secondpage/insert" element={<Insert />} />
        <Route path="/secondpage/delete" element={<Delete />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
