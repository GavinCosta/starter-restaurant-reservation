//import resources
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ErrorAlert from "../layout/ErrorAlert";
import TableForm from "./TableForm";
import { createTable } from "../utils/api";
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view Tables.
 * @returns {JSX.Element}
 */
function NewTable() {
  
  const history = useHistory()

//where am i getting 'data' from
//createTable function?
const [error, setError] = useState(null)
//format date then push that
  function handleNewTable(table) {
    const abortController = new AbortController()
    setError(null)
    console.log(table, "TABLEEEEEEEEEEEEE***")
    createTable(table, abortController.signal)
    .then(() => history.push('/dashboard'))
    .catch(setError)
    return () => abortController.abort()
  }

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">
              <span className="oi oi-home"></span> Home
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            New Table
          </li>
        </ol>
      </nav>
      <h1>New Table</h1>
      <ErrorAlert error={error}/>
        <TableForm onSubmit={handleNewTable} />     
    </>
  );
}

export default NewTable;
//write function returning required html
//perform create function
//export component, using it in routes