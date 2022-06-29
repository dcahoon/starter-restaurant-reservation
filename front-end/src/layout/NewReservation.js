import React, { useState } from "react"
import { useHistory } from "react-router-dom"
import ErrorAlert from "./ErrorAlert"
import ReservationForm from "./ReservationForm"
const { createReservation } = require("../utils/api")

export default function NewReservation() {

    const history = useHistory()

    const initialFormData = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: "",
        status: "booked",
    }

    const [formData, setFormData] = useState({ ...initialFormData })
    const [error, setError] = useState(null)

    /* const handleChange = ({ target }) => {

        setFormData({
            ...formData,
            [target.name]: target.name === "people" ? Number(target.value) : target.value,
        })
    }

    const handleReset = () => {
        setFormData({ ...initialFormData })
        return
    }

    async function handleSubmit(event) {
    
        event.preventDefault()
        
        const abortController = new AbortController()
        const newReservation = { ...formData }
        try {
            const response = await createReservation(newReservation, abortController.signal)
            if (response.message) {
                setError(response)
                return
            }
            history.push(`/dashboard/?date=${formData.reservation_date}`)
        } catch (error) {
            setError(error.message)
        }
 */
    

    /* function handleCancel() {
        history.go(-1)
    } */

    return (

        <ReservationForm formData={initialFormData} reservationIsNew={true} />

    )

}

/* <form className="new-res-form needs-validation" onSubmit={handleSubmit}>
            <h1>New Reservation</h1>
            <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                    id="first_name"
                    className="form-control"
                    type="text"
                    name="first_name"
                    onChange={handleChange}
                    value={formData.first_name}
                />
            </div>
            <div className="form-group">
                <label htmlFor="last_name" className="form-label">Last Name</label>
                <input
                    id="last_name"
                    className="form-control"
                    type="text"
                    name="last_name"
                    onChange={handleChange}
                    value={formData.last_name}
                />
            </div>
            <div className="form-group">
                <label htmlFor="mobile_number" className="form-label">Mobile Number</label>
                <input 
                    id="mobile_number"
                    className="form-control"
                    type="text"
                    name="mobile_number"
                    onChange={handleChange}
                    value={formData.mobile_number}
                />
            </div>
            <div className="form-group">
                <label htmlFor="reservation_date" className="form-label">Date</label>
                <input 
                    id="reservation_date"
                    className="form-control"
                    type="date"
                    name="reservation_date"
                    onChange={handleChange}
                    value={formData.reservation_date}
                />
            </div>
            <div className="form-group">
               <label htmlFor="reservation_time" className="form-label">Time</label>
               <input
                    id="reservation_time"
                    className="form-control"
                    type="time"
                    name="reservation_time"
                    onChange={handleChange}
                    value={formData.reservation_time}
                />
            </div>
            <div className="form-group">
                <label htmlFor="people" className="form-label">Party Size</label>
                <input 
                    id="people"
                    className="form-control"
                    type="number"
                    name="people"
                    onChange={handleChange}
                    value={formData.people}
                />
            </div>
            <ErrorAlert error={error} />
            <label htmlFor="submit" className="form-label">
                <button
                    type="submit"
                    id="submit"
                    name="submit"
                    className="btn btn-primary"
                >
                    Submit
                </button>
            </label>
            <label htmlFor="reset" className="form-label">
                <button
                    type="reset"
                    id="reset"
                    name="reset"
                    onClick={handleReset}
                    className="btn btn-primary"
                >
                    Reset
                </button>
            </label>
            <label htmlFor="cancel" className="form-label">
                <button
                    type="button"
                    id="cancel"
                    name="cancel"
                    onClick={handleCancel}
                    className="btn btn-primary"
                >
                    Cancel
                </button>
            </label>
        </form> */