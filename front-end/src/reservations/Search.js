import React, { useState } from "react";
import { cancelReservation, listReservations } from "../utils/api";
import { formatAsDate, formatAsTime } from "../utils/date-time";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

function Search() {
    const [reservations, setReservations] = useState([])
    const [number, setNumber] = useState('')
    function changeHandler(event) {
        setNumber(event.target.value)
    }

    function submitHandler(event) {
        event.preventDefault()
        listReservations({mobile_number: number})
        .then(setReservations)
    }

    async function cancelReservationHandler(reservation) {
        if (window.confirm("Do you want to cancel this reservation? This cannot be undone.")) {
          console.log(reservation.reservation_id, reservation.reservation_date)
          await cancelReservation(reservation)
          listReservations({mobile_number: number})
          .then(setReservations)
          console.log(setReservations)
        }
      }
      

const displayReservations = reservations.map((reservation) => {
    const href = `/reservations/${reservation.reservation_id}/seat`;
    return <li
    key={reservation.reservation_id}
    className="list-group-item list-group-item-action flex-column align-items-start"
  >
    <div className="d-flex w-100 justify-content-between">
    <span className="mb-1"><b>Name:</b> {reservation.last_name}, {reservation.first_name}</span>
  <span><b>Mobile:</b> {reservation.mobile_number}</span>
<span className="mb-1"><b>Date:</b> {formatAsDate(reservation.reservation_date)}</span>
<span className="mb-1"><b>Time:</b> {formatAsTime(reservation.reservation_time)}</span>
<span className="mb-1"><b>Party Size:</b> {reservation.people}</span>
    <span data-reservation-id-status={reservation.reservation_id}>{reservation.status}</span> 
    {reservation.status ==='booked' && <a className="btn btn-primary" href={href}>Seat</a>}
<a className="btn btn-secondary" href= {`/reservations/${reservation.reservation_id}/edit`}>Edit</a>
{reservation.status !== 'cancelled' && <button className="btn btn-danger" data-reservation-id-cancel={reservation.reservation_id} onClick={() => cancelReservationHandler(reservation)}>Cancel</button>}
    </div>
  </li>
  })

  
    return (
        <div>
             <h1>Search Reservation</h1>
             <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">
              <span className="oi oi-home"></span> Home
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
         Search
          </li>
        </ol>
      </nav>
     
        <form className="d-flex justify-content-center mb-2" onSubmit={submitHandler}>
            <input name="mobile_number" onChange={changeHandler} value={number} placeholder="Enter a customer's phone number" />
            <button type='submit' className="btn btn-success mx-2">Find</button>
        </form>
        {!reservations.length && <p className='d-flex justify-content-center mb-2'>No reservations found</p>}
        <ul>
            {displayReservations}
        </ul>
        </div>
    )
}

export default Search