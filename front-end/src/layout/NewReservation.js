import React, { useState } from "react"
import { useHistory } from "react-router-dom"
import ErrorAlert from "./ErrorAlert"
const moment = require("moment")
const { createReservation } = require("../utils/api")

export default function NewReservation() {

    const history = useHistory()

    const [inputValid, setInputValid] = useState({
        first_name: false,
        last_name: false,
        mobile_number: false,
        reservation_date: false,
        reservation_time: false,
        people: false,
    })

   /*  await page.type("input[name=first_name]", "James");
      await page.type("input[name=last_name]", lastName);
      await page.type("input[name=mobile_number]", "800-555-1212");
      await page.type("input[name=reservation_date]", "01012035");
      await page.type("input[name=reservation_time]", "1330");
      await page.type("input[name=people]", "2"); */
    const lastName = Date.now().toString(10);

    const initialFormData = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: null,
        status: "Booked",
    }

    const [formData, setFormData] = useState({ ...initialFormData })
    const [error, setError] = useState(null)

    const handleChange = ({ target }) => {
        
        //setInputValid({ ...inputValid, [target.name]: !target.value })

        //target.name === "people" ? Number(target.value) : target.value

        setFormData({
            ...formData,
            [target.name]: target.name === "people" ? Number(target.value) : target.value,
        })
        /**
         * add logic/switch to handle validation based on target
         */
        //console.log("target ID", target.id)
        /* switch (target.id) {
            case "first_name":
                if (target.first_name === "") {
                    setInputValid(() => inputValid.first_name = false)
                }
            case "last_name":
                if (target.last_name === "") {
                    setInputValid(inputValid.last_name = false)
                }
        } */
    }

    const handleReset = () => {
        setFormData({ ...initialFormData })
    }

    async function handleSubmit(event) {
        event.preventDefault()
        /* switch (event.target.id) {
            case "first_name":
                if (event.target.first_name === "") {
                    setInputValid(inputValid.first_name = false)
                }
            case "last_name":
                if (event.target.last_name === "") {
                    setInputValid(inputValid.last_name = false)
                }
        } */
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
    }

    function handleCancel() {
        history.go(-1)
    }

    return (
        <form className="new-res-form needs-validation" onSubmit={handleSubmit}>
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
                { inputValid.first_name ? <div className="text-danger">First name is required.</div> : null }
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
                { inputValid.last_name ? <div className="text-danger">Last name is required.</div> : null }
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
        </form>
    )

}

/**
 * a way to keep track of sessions (manually or express.sessions) req.session property
 * (req.session.user)
 * 
 * bcrypt library (will encode passwords)
 * 
 */