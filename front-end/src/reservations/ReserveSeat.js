import React, { useEffect, useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { Link, useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import { listTables, seatTable } from "../utils/api";
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Seats() {
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState()
  const [tablesError, setTablesError] = useState(null);
  
  useEffect(loadTables, []);
  const {reservation_id} = useParams()
//console.log(useParams(), 'paramssss')
  const history = useHistory()

  function onCancel() {
    history.goBack()
  }

  async function onSubmit(event) {
    event.preventDefault()
    console.log('submitted?', Number(tableId), reservation_id)
    const AC = new AbortController()
   // setTablesError(null)
   try{
    console.log(reservation_id, tableId)
    await seatTable(reservation_id, Number(tableId), AC.signal)
    history.push('/')
    } catch(error){
      setTablesError(error)
    }
    return () => AC.abort()
  }

  function loadTables() {
    const abortController = new AbortController();
   // setTablesError(null)
    listTables(abortController.signal)
      .then(setTables)
      .catch(setTablesError)
    return () => abortController.abort();
  }
  console.log('Tables', tables)

function onChangeHandler(event) {
  console.log(event.target.value, "Before")
  //on select track value in useState
  setTableId(event.target.value)
  console.log(event.target.value, "After")

}

  const displayTables = tables.map((table) => {
    return  <option value={table.table_id} key={table.table_id}>{table.table_name} - {table.capacity}</option>
  })

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
            Seat
          </li>
        </ol>
      </nav>
      <h1>Reserve Seat</h1>
      <form onSubmit={onSubmit}>

      <label htmlFor='table-select'>Choose a table:</label>
      <select onChange={onChangeHandler} name='table_id' id='table-select'><option value='default'>Select Table</option>{displayTables}</select>
      <button
                className="btn btn-secondary mr-2"
                onClick={onCancel}
                type="button"
                >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Submit
              </button>
                </form>
      <ErrorAlert error={tablesError} />
    </>
  );
}

export default Seats;
