import { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import ErrorAlert from "./ErrorAlert"
import { createReservation, updateReservation } from "../utils/api"
const moment = require("moment")

export default function ReservationForm ({ reservationIsNew, formData }) {

    const validations = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: ""
    }

    const [error, setError] = useState(null)
    const [reservation, setReservation] = useState({ ...formData })
    const [validationMessages, setValidationMessages] = useState({ ...validations })

    const history = useHistory()

    useEffect(() => {
        setReservation({ ...formData })
    }, [reservationIsNew, formData])

    const handleChange = ({ target }) => {
        setReservation({
            ...reservation,
            [target.name]: target.name === "people" ? Number(target.value) : target.value,
        })
        switch (target.name) {
            case "first_name":
                if (target.value.length < 3) {
                    setValidationMessages({
                        ...validationMessages,
                        first_name: "first name too short"
                    })
                } else {
                    setValidationMessages({
                        ...validationMessages,
                        first_name: "",
                    })
                }
                break
            case "last_name":
                if (target.value.length < 3) {
                    setValidationMessages({
                        ...validationMessages,
                        last_name: "last name too short"
                    })
                } else {
                    setValidationMessages({
                        ...validationMessages,
                        last_name: "",
                    })
                }
                break
            case "mobile_number":
                if (target.value.length < 10) {
                    setValidationMessages({
                        ...validationMessages,
                        mobile_number: "Please enter a valid number"
                    })
                } else {
                    setValidationMessages({
                        ...validationMessages,
                        mobile_number: "",
                    })
                }
                break
            case "reservation_date":
                if (moment(target.value).format('dddd') === 'Tuesday'){
                    setValidationMessages({
                        ...validationMessages,
                        reservation_date: "Restaurant is closed on Tuesdays"
                    })
                } else if (moment(reservation.reservation_date) < new Date()) {
                    setValidationMessages({
                        ...validationMessages,
                        reservation_date: "Reservation must be for a future date"
                    })
                } else {
                    setValidationMessages({
                        ...validationMessages,
                        reservation_date: "",
                    })
                }
                break
            case "reservation_time":
                const openTime = moment("10:30", "HH:mm")
                const latestResTime = moment("21:30", "HH:mm")
                const resTime = moment(target.value, "kk:mm", true)
                if (resTime.isBefore(openTime)) {
                    setValidationMessages({
                        ...validationMessages,
                        reservation_time: "Restaurant opens at 10:30"
                    })
                } else if (latestResTime.isBefore(resTime)) {
                    setValidationMessages({
                        ...validationMessages,
                        reservation_time: "Latest reservation time is 9:30"
                    })
                } else {
                    setValidationMessages({
                        ...validationMessages,
                        reservation_time: ""
                    })
                }
                break
            default:
                break
            }
    }

    const handleReset = () => {
        setReservation({ formData })
    }

    async function handleSubmit(event) {
    
        event.preventDefault()

        const abortController = new AbortController()
        
        if (reservationIsNew) {

            async function createNewReservation() {

                const newReservation = { ...reservation }
                try {
                    const response = await createReservation(newReservation, abortController.signal)
                    if (response.message) {
                        setError(response)
                        return
                    }
                    history.push(`/dashboard/?date=${reservation.reservation_date}`)
                } catch (error) {
                    if (error.name === "AbortError") {
                        // Ignore `AbortError`
                        console.log("Aborted")
                      } else {
                        throw error
                      }
                    setError(error.message)
                }
            }

            createNewReservation()

            return () => {
                abortController.abort() // Cancels any pending request or response
            }

        } else {

            async function updateExistingReservation() {

                const updatedReservation = { 
                    ...reservation, 
                    reservation_time: reservation.reservation_time.slice(0, 5)
                }
                try {
                    const response = await updateReservation(updatedReservation, abortController.signal)
                    if (response.message) {
                        setError(response)
                        return
                    }
                    history.push(`/dashboard/?date=${updatedReservation.reservation_date}`)
                } catch (error) {
                    if (error.name === "AbortError") {
                        return
                    } else {
                        setError(error.message)
                        throw error
                    }
                }
            }

            updateExistingReservation()

            return () => {
                abortController.abort(); // Cancels any pending request or response
            }

        }
    }

    function handleCancel() {
        history.go(-1)
    }

    return (

        <form className="new-res-form needs-validation" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                    id="first_name"
                    className="form-control"
                    type="text"
                    name="first_name"
                    onChange={handleChange}
                    value={reservation.first_name}
                    required
                />
                <span className="validation-error">{validationMessages.first_name}</span>
            </div>
            <div className="form-group">
                <label htmlFor="last_name" className="form-label">Last Name</label>
                <input
                    id="last_name"
                    className="form-control"
                    type="text"
                    name="last_name"
                    onChange={handleChange}
                    value={reservation.last_name}
                    required
                />
                <span className="validation-error">{validationMessages.last_name}</span>
            </div>
            <div className="form-group">
                <label htmlFor="mobile_number" className="form-label">Mobile Number</label>
                <input 
                    id="mobile_number"
                    className="form-control"
                    type="text"
                    name="mobile_number"
                    onChange={handleChange}
                    value={reservation.mobile_number}
                    required
                />
                <span className="validation-error">{validationMessages.mobile_number}</span>
            </div>
            <div className="form-group">
                <label htmlFor="reservation_date" className="form-label">Date</label>
                <input 
                    id="reservation_date"
                    className="form-control"
                    type="date"
                    name="reservation_date"
                    onChange={handleChange}
                    value={reservation.reservation_date}
                    required
                />
                <span className="validation-error">{validationMessages.reservation_date}</span>
            </div>
            <div className="form-group">
                <label htmlFor="reservation_time" className="form-label">Time</label>
                <input
                    id="reservation_time"
                    className="form-control"
                    type="time"
                    name="reservation_time"
                    onChange={handleChange}
                    value={reservation.reservation_time}
                    required
                />
                <span className="validation-error">{validationMessages.reservation_time}</span>
            </div>
            <div className="form-group">
                <label htmlFor="people" className="form-label">Party Size</label>
                <input 
                    id="people"
                    className="form-control"
                    type="number"
                    name="people"
                    onChange={handleChange}
                    value={reservation.people}
                    required
                />
                <span className="validation-error">{validationMessages.people}</span>
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
        </form>

    )
}