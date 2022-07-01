import React from "react"
import ReservationForm from "./ReservationForm"

export default function NewReservation() {

    const initialFormData = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: "",
        status: "booked",
    }

    return (
        <ReservationForm formData={initialFormData} reservationIsNew={true} />
    )

}