import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";
import { createReservation } from "../utils/api";
import { formatAsDate } from "../utils/date-time";
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function NewReservation() {
  
  const history = useHistory()

//where am i getting 'data' from
//createReservation function?
const [error, setError] = useState(null)
//format date then push that
  function handleNewReservation(reservation) {
    const abortController = new AbortController()
    //console.log("*************handle", reservation)
    setError(null)
    createReservation(reservation, abortController.signal)
    .then((savedReservation) => history.push(`/dashboard?date=${formatAsDate(savedReservation.reservation_date)}`))
    .catch(setError)
    return () => abortController.abort()
  }

  return (
    <>
        <h1>New Reservation</h1>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">
              <span className="oi oi-home"></span> Home
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            New Reservation
          </li>
        </ol>
      </nav>
  
      <ErrorAlert error={error}/>
        <ReservationForm onSubmit={handleNewReservation} />     
    </>
  );
}

export default NewReservation;