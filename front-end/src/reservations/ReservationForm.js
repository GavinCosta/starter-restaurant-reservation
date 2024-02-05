import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import React, { useState } from "react";

function ReservationForm({
  onSubmit,
  initialUseState = {first_name: "", last_name: "", mobile_number: "", reservation_date: "", reservation_time: "09:30", people: 0}
}) {
    const history = useHistory()
    
    function onCancel() {
        history.goBack()
    }

    const [reservation, setReservation] = useState(initialUseState)

    function submitHandle(event) {
        event.preventDefault()
       // console.log("**********submitHandle")
        onSubmit(reservation)
    }

    function changeHandle(event) {
      const { name, value } = event.target;
      let parsedValue = value;
  
      // Check if the input field name is 'people' and parse its value to a number
      if (name === 'people') {
          parsedValue = parseFloat(value); // Parse the string value to a float
      }
      setReservation(reservation => ({
          ...reservation,
          [name]: parsedValue,
      }));
  }

  const formattedDate = reservation.reservation_date ? new Date(reservation.reservation_date).toISOString().split('T')[0] : '';
  

    return (
        <div>
          <form className='reservation-form my-4' onSubmit={submitHandle}>
            <fieldset>
              <div className="form-group">
                <label htmlFor="first-name">First Name</label>
                <input
                  className="form-control"
                  required
                  type="text"
                  placeholder="First Name"
                  value={reservation.first_name}
                  onChange={changeHandle}
                  name="first_name"
                  id="first-name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="last-name">Last Name</label>
                <input
                  className="form-control"
                  required
                  type="text"
                  placeholder="Last Name"
                  value={reservation.last_name}
                  onChange={changeHandle}
                  name="last_name"
                  id="last-name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="Mobile Number">Mobile Number</label>
                <input
                  className="form-control"
                  rows="4"
                  type="text"
                  required
                  placeholder="(123)456-7890"
                 // pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  value={reservation.mobile_number}
                  onChange={changeHandle}
                  name="mobile_number"
                  id="mobile-number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="Reservation Date">Reservation Date</label>
                <input
                  className="form-control"
                  rows="4"
                  type="date"
                  required
                  placeholder="YYYY-MM-DD"
                  pattern="\d{4}-\d{2}-\d{2}"
                  value={formattedDate}
                  onChange={changeHandle}
                  name="reservation_date"
                  id="reservation-date"
                />
              </div>
              <div className="form-group">
                <label htmlFor="Reservation Time">Reservation Time</label>
                <input
                  className="form-control"
                  rows="4"
                  type="time" 
                  placeholder="HH:MM" 
                  pattern="[0-9]{2}:[0-9]{2}"
                  required
                  value={reservation.reservation_time}
                  onChange={changeHandle}
                  name="reservation_time"
                  id="reservation-time"
                />
                </div>
                <div className="form-group">
                <label htmlFor="Party Size">Party Size</label>
                <input
                  className="form-control"
                  rows="4"
                  type="number"
                  required min="1"
                  placeholder="Party Size"
                  value={reservation.people}
                  onChange={changeHandle}
                  name="people"
                  id="people"
                />
              </div>
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
            </fieldset>
          </form>
        </div>
      );
}

export default ReservationForm