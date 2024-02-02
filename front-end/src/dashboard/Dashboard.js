import React, { useEffect, useState } from "react";
import { deleteSeatFromTable, listReservations} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { previous, next, today } from "../utils/date-time";
import { Link} from "react-router-dom/cjs/react-router-dom.min";
import { formatAsTime, formatAsDate } from "../utils/date-time";
import { listTables } from "../utils/api";
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

async function finishHandle(tableId) {
  if (window.confirm("Is this table ready to seat new guests? This cannot be undone.")) {
    await deleteSeatFromTable(tableId)
    loadDashboard(date)
  }
}

  
  useEffect(() => loadDashboard(date), [date]);

  function loadDashboard(date) {
    const abortController = new AbortController();
    setReservationsError(null);
    setTablesError(null)
    listReservations({date}, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables(abortController.signal)
      .then(setTables)
      .catch(setTablesError)
    return () => abortController.abort();
  }

//if table.reservation_id set booked to seated for reservation.reservation_id
//conditional Seat to be booked and seat

const displayReservations = reservations.map(({status, first_name, last_name, mobile_number, reservation_date, reservation_time, reservation_id, people}) => {
  const href = `/reservations/${reservation_id}/seat`;
  return <li
  key={reservation_id}
  className="list-group-item list-group-item-action flex-column align-items-start"
>
  <div className="d-flex w-100 justify-content-between">
    <span className="mb-1">Name: {last_name}, {first_name}</span>
    <span>Mobile: {mobile_number}</span>
  <span className="mb-1">Date: {formatAsDate(reservation_date)}</span>
  <span className="mb-1">Time: {formatAsTime(reservation_time)}</span>
  <span className="mb-1">Party Size: {people}</span>
  <span data-reservation-id-status={reservation_id}>{status}</span> 
  {status==='booked' && <a href={href}>Seat</a>}
  </div>
</li>
})

const displayTables = tables.map((table) => {
  return <li
  key={table.table_id}
  className="list-group-item list-group-item-action flex-column align-items-start"
>
  <div className="d-flex w-100 justify-content-between">
    <span className="mb-1">Name: {table.table_name}</span>
    <span className="mb-1">Capacity: {table.capacity}</span>
    <span data-table-id-status={table.table_id} className="mb-1">{table.reservation_id ? "Occupied" : "Free"}</span>
    {table.reservation_id &&<button data-table-id-finish={table.table_id} onClick={() => finishHandle(table.table_id)}> Finish</button>}
  </div>
</li>
})
//Must create route of /dashboard?{date} (query params) - displays all reservations on that date
//include today, next, and previous buttons that change date
//sort listed reservations by time
//date defaulted to today
//  /dashboard?date=${today}
  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <ul>{displayReservations}</ul>
      <ul>{displayTables}</ul>
      <Link to={`/dashboard?date=${previous(date)}` }>Previous</Link> 
      <Link to={`/dashboard?date=${today()}`}>Today</Link> 
      <Link to={`/dashboard?date=${next(date)}`}>Next</Link> 
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />

    </main>
  );
}

export default Dashboard;

//add buttons for previous and next date