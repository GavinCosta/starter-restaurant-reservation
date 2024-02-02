import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import React, { useState } from "react";

function TableForm({
  onSubmit,
  initialUseState = {table_name: "", capacity: ""}
}) {
    const history = useHistory()

    function onCancel() {
        history.goBack()
    }

    const [table, setTable] = useState(initialUseState)

    function submitHandle(event) {
        event.preventDefault()
        onSubmit(table)
    }

    function changeHandle(event) {
      //console.log(event.target.value, "***********************")
       // const { name, value } = event.target
        if (event.target.type === "number") {
          setTable({
             ...table, [event.target.name]: Number(event.target.value)
           })
         } else {
          setTable({ ...table, [event.target.name]: event.target.value }) 
        }
    }
//console.log("table", table.people)
    return (
        <div>
          <form className='table-form my-4' onSubmit={submitHandle}>
            <fieldset>
              <div className="form-group">
              <label htmlFor="table-name">Table Name</label>
                <input
                  className="form-control"
                  required
                  minLength='2'
                  type="text"
                  placeholder="Table Name"
                  value={table.table_name}
                  onChange={changeHandle}
                  name="table_name"
                  id="table-name"
                />
              </div>
              <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
                <input
                  className="form-control"
                  required min="1"
                  type="number"
                  placeholder="Capacity #"
                  value={table.capacity}
                  onChange={changeHandle}
                  name="capacity"
                  id="capacity"
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

export default TableForm