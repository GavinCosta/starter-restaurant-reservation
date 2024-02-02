import React, { useState } from "react";
import { listReservations } from "../utils/api";
import { formatAsDate, formatAsTime } from "../utils/date-time";

function Search() {
    const [reservations, setReservations] = useState([])
    const [number, setNumber] = useState('')
    function changeHandler(event) {
        setNumber(event.target.value)
    }

    function submitHandler(event) {
        event.preventDefault()
        console.log(number)
        listReservations({mobile_number: number})
        .then(setReservations)
    }
console.log(reservations)
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
    {status ==='booked' && <a href={href}>Seat</a>}
    </div>
  </li>
  })

  
    return (
        <div>
        <form onSubmit={submitHandler}>
            <input name="mobile_number" onChange={changeHandler} value={number} placeholder="Enter a customer's phone number" />
            <button type='submit'>Find</button>
        </form>
        {!reservations.length && <p>No reservations found</p>}
        <ul>
            {displayReservations}
        </ul>
        </div>
    )
}

export default Search