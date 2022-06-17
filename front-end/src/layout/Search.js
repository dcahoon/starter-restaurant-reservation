import { searchByNumber, updateStatus } from "../utils/api"
import ErrorAlert from "./ErrorAlert"
import { useState } from "react"
import { Link } from "react-router-dom"

export default function Search() {

    const [error, setError] = useState(null)
    const [formData, setFormData] = useState(null)
    const [searchResults, setSearchResults] = useState([])

    const handleChange = ({ target }) => {
        setFormData(target.value)
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError(null)
        const { signal } = new AbortController()
        try {
            const response = await searchByNumber(formData, signal)
            if (response.length === 0) {
                setSearchResults([])
                setError({ message: "No reservations found" })
                return
            } else {
                setSearchResults(response)
                return
            }
        } catch (error) {
            setError(error)
        }
    }

    async function cancelReservation(reservationId) {
        const { signal } = new AbortController()
        if (window.confirm('Do you want to cancel this reservation? This cannot be undone.')) {
            try {
                const response = await updateStatus(reservationId, "cancelled", signal)
                if (response.message) {
                    setError()
                    return
                }
                if (response.length === 0) {
                    setSearchResults([])
                    setError({ message: "No reservations found" })
                    return
                } else {
                    setSearchResults(response)
                    return
                }
            } catch (error) {
                setError(error)
            }
        }
        return
    }

    const searchResultsContent = searchResults.map((reservation, index) => (
        <tr key={index}>
			<td>{reservation.first_name}</td>
			<td>{reservation.last_name}</td>
			<td>{reservation.people}</td>
			<td>{reservation.mobile_number}</td>
			<td>{reservation.reservation_date}</td>
			<td>{reservation.reservation_time}</td>
			<td><span data-reservation-id-status={reservation.reservation_id}>{reservation.status}</span></td>
			<td>
				<Link to={`/reservations/${reservation.reservation_id}/edit`}>
					<button>
						Edit
					</button>
				</Link>
                <button data-reservation-id-cancel={reservation.reservation_id} onClick={() => cancelReservation(reservation.reservation_id)}>
                    Cancel
                </button>
			</td>
      	</tr>
    ))

    return (
        <div>
            <form>
                <input 
                    onChange={handleChange} 
                    type="text" 
                    name="mobile_number" 
                    id="mobile_number" 
                    placeholder="Enter a customer's phone number" 
                />
                <button type="submit" name="find" id="find" onClick={handleSubmit}>
                    Find
                </button>
            </form>
            <table className="table table-striped">
                <thead>
                    <tr className="thead-dark">
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>People</th>
                        <th>Mobile Number</th>
                        <th>Reservation Date</th>
                        <th>Reservation Time</th>
                        <th>Status</th>
                        <th></th>
                    </tr>	
                </thead>
                <tbody>
                    {searchResultsContent}						
                </tbody>					
            </table>
            <ErrorAlert error={error} />
        </div>
    )

}