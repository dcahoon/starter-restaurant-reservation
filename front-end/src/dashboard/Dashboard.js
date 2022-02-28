import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, Link } from "react-router-dom"

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  
	const [reservations, setReservations] = useState([]);
	const [tables, setTables] = useState([])
	const [error, setError] = useState(null)

	/**
	 * The following code gets the query from the URL and if a date is provided,
	 * sets the date fetched from the API.
	 */
	const { search } = useLocation();
	const query = React.useMemo(() => new URLSearchParams(search), [search]).get('date')
	if (query) {
		date = query
	}

	
	useEffect(loadDashboard, [date]);

	function loadDashboard() {
		const abortController = new AbortController();
		setError(null);
		listReservations({ date }, abortController.signal)
			.then(setReservations)
			.catch(setError);
		return () => abortController.abort();
	}

    useEffect(() => {
        const abortController = new AbortController()
        setError(null)
        async function loadTablesFromApi() {
            try {
                const response = await listTables(abortController.signal)
                const tables = response.map((table) => (
					{ ...table, isOccupied: false }
				))
				setTables(tables)
            } catch(error) {
                setError(error)
            }
        }
        loadTablesFromApi()
    }, [reservations])

	
	
	const reservationsContent = reservations.map((reservation, index) => (		
		<tr key={index}>
			<td>{reservation.first_name}</td>
			<td>{reservation.last_name}</td>
			<td>{reservation.people}</td>
			<td>{reservation.mobile_number}</td>
			<td>{reservation.reservation_date}</td>
			<td>{reservation.reservation_time}</td>
			<td><Link className="btn btn-dark" to={`/reservations/${reservation.reservation_id}/seat`}>Seat</Link></td>
      	</tr>
  	))
  
  	const tablesContent = tables.map((table, index) => (  
		<tr key={index}>
			<td>{table.table_name}</td>
			<td>{table.capacity}</td>
			{
				table.isOccupied
					? <td className="text-danger">Occupied</td> 
					: <td className="text-success">Open</td>
			}
		</tr>
  	))

  	return (
		<main>
			<h1>Dashboard</h1>
			<div className="">
				<h4 className="mb-0">Reservations for {date}</h4>
			</div>
			<ErrorAlert error={error} />
			<div className="row">
				<div className="col-8 m-0">
					<table className="table table-striped">
						<thead className="thead-dark">
								<th>First Name</th>
								<th>Last Name</th>
								<th>People</th>
								<th>Mobile Number</th>
								<th>Reservation Date</th>
								<th>Reservation Time</th>
								<th></th>
						</thead>						
						{reservationsContent}						
					</table>
				</div>
				<div className="col-4 m-0">
					<table className="table table-striped">
						<thead className="thead-dark">
								<th>Table Name</th>
								<th>Capacity</th>
								<th>Status</th>							
						</thead>						
						{tablesContent}						
					</table>
				</div>
			</div>
		</main>
  	);
}

export default Dashboard;
