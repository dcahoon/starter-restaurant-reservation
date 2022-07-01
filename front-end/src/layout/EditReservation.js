import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import moment from "moment"
import ReservationForm from "./ReservationForm"
const { getReservation } = require("../utils/api")

export default function EditReservation() {

    const initialFormData = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: "",
        status: "",
        reservation_id: "",
    }

    const [formData, setFormData] = useState({...initialFormData})

    const { reservation_id } = useParams()

    useEffect(() => {

        const abortController = new AbortController()

        async function loadReservationFromApi() {
            
            try {
                const reservationFromApi = await getReservation(reservation_id, abortController.signal)
                const res = reservationFromApi
                setFormData({
                    first_name: res.first_name,
                    last_name: res.last_name,
                    mobile_number: res.mobile_number,
                    reservation_date: moment(res.reservation_date).format('YYYY-MM-DD'),
                    reservation_time: res.reservation_time,
                    people: res.people,
                    status: res.status,
                    reservation_id: res.reservation_id
                })
            } catch (error) {
                setError(error)
            }
        }

        loadReservationFromApi()
        
        return () => {
            abortController.abort(); // Cancels any pending request or response
        }

    }, [reservation_id])


    return (
        <ReservationForm formData={formData} reservationIsNew={false} />
    )

}