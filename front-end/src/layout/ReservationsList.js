import { Link } from "react-router-dom"

export default function ReservationsList({ reservations, cancelReservation }) {

    const reservationsContent = reservations.map((reservation, index) => (		
		<tr key={index}>
			<td>{reservation.first_name}</td>
			<td>{reservation.last_name}</td>
			<td>{reservation.people}</td>
			<td>{reservation.mobile_number}</td>
			<td>{reservation.reservation_date}</td>
			<td>{reservation.reservation_time}</td>
			<td><span data-reservation-id-status={reservation.reservation_id}>{reservation.status}</span></td>
			<td>
				{reservation.status === "seated" ? null : 
					<Link to={`/reservations/${reservation.reservation_id}/seat`}>
						<button>
							Seat
						</button>
					</Link>
				}
				{reservation.status === "seated" ? null : 
					<Link to={`/reservations/${reservation.reservation_id}/edit`}>
						<button>
							Edit
						</button>
					</Link>
				}
				{reservation.status === "cancelled" 
					? <button disabled>
						Cancel
					</button> 
					: <button data-reservation-id-cancel={reservation.reservation_id} onClick={() => cancelReservation(reservation.reservation_id)}>
						Cancel
					</button>
				}
			</td>
      	</tr>
  	))

    return (
        <table className="table table-dark m-2">
            <thead>
                <tr className="">
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>People</th>
                    <th>Mobile Number</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th></th>
                </tr>	
            </thead>
            <tbody>
                {reservationsContent}						
            </tbody>					
        </table>
    )

}