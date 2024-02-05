import React, { useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";
import { readReservation, updateReservation } from "../utils/api";
import { formatAsDate } from "../utils/date-time";
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function EditReservation() {
  
  const history = useHistory()
const {reservation_id} = useParams()
  const [reservation, setReservation] = useState(null)
const [error, setError] = useState(null)
//format date then push that
  function handleReservationEdit(reservation) {
    const abortController = new AbortController()
    setError(null)
    updateReservation(reservation, abortController.signal)
    .then((savedReservation) => history.push(`/dashboard?date=${formatAsDate(savedReservation.reservation_date)}`))
    .catch(setError)
    return () => abortController.abort()
  }

  useEffect(() => {
    async function getReservationData() {
      try {
        const response = await readReservation(reservation_id);
        // Format the time to remove seconds
        const formattedTime = response.reservation_time.substring(0, 5);
        // Update the reservation object with the formatted time
        setReservation({
          ...response,
          reservation_time: formattedTime
        });
      } catch (error) {
        console.error("Error fetching reservation data:", error);
        setError(error);
      }
    }

    getReservationData();
  }, [reservation_id]);

  return (
    <>
      <h1>Edit Reservation</h1>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">
              <span className="oi oi-home"></span> Home
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Edit Reservation
          </li>
        </ol>
      </nav>
      <ErrorAlert error={error}/>
        {reservation && <ReservationForm onSubmit={handleReservationEdit} initialUseState={reservation}/>}  
    </>
  );
}

export default EditReservation;