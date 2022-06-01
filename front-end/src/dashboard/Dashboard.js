
import React, { useEffect, useState } from "react";
import { listReservations, listTables, seatTable } from "../utils/api";
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
	//const [trigger, setTrigger] = useState(true)
	const [modalTable, setModalTable] = useState(null)

	/**
	 * The following code gets the query from the URL and if a date is provided,
	 * sets the date fetched from the API.
	 */
	const { search } = useLocation();
	const query = React.useMemo(() => new URLSearchParams(search), [search]).get('date')
	if (query) {
		date = query
	}

	
	useEffect(loadDashboard, [date, tables]);

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
				const sortedTables = response.sort((table) => table.table_name)
				setTables(sortedTables)
            } catch(error) {
                setError(error)
            }
        }
        loadTablesFromApi()
    }, [])

	async function unseatTable({ target }) {
		
		const abortController = new AbortController()
        try {
			const response = await seatTable(true, null, `${modalTable}`, abortController.signal)
			if (response.message) {
				setError(response)
				return
			}
			//setTrigger((prev) => !prev)
			

		} catch (error) {
			console.error(error)
		}

		try {
			const fetchedTables = await listTables(abortController.signal)
			const sortedTables = fetchedTables.sort((table) => table.table_name)
			setTables(sortedTables)
		} catch (error) {
			console.error(error)
		}

	}
	
	const reservationsContent = reservations.map((reservation, index) => (		
		<tr key={index}>
			<td>{reservation.first_name}</td>
			<td>{reservation.last_name}</td>
			<td>{reservation.people}</td>
			<td>{reservation.mobile_number}</td>
			<td>{reservation.reservation_date}</td>
			<td>{reservation.reservation_time}</td>
			<td>{reservation.status}</td>
			<td>
				<Link 
					className="btn btn-dark"
					disabled={!reservation.status==="Booked"?false:true}
					data-reservation-id-status={reservation.reservation_id} 
					to={`/reservations/${reservation.reservation_id}/seat`}
					reservation={reservation}
				>
					Seat
				</Link>
			</td>
      	</tr>
  	))
  
  	const tablesContent = tables.map((table, index) => (  
		<tr key={index}>
			<td>{table.table_name}</td>
			<td>{table.capacity}</td>
			{ table.reservation_id ? <td data-table-id-status={table.table_id} className="text-danger">occupied</td> : <td data-table-id-status={table.table_id} className="text-success">free</td> }
			<td>
				<button 
					data-table-id-finish={table.table_id}
					id={table.table_id} 
					className="btn btn-primary" 
					data-toggle="modal" 
					data-target="#confirmationModal"
					onClick={() => setModalTable(table.table_id)}
				>
					Finish
				</button>
			</td>
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
				<div className="col-9 m-0">
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
								<th>Seat</th>
							</tr>	
						</thead>
						<tbody>
							{reservationsContent}						
						</tbody>					
					</table>
				</div>
				<div className="col-3 m-0">
					<table className="table table-striped">
						<thead>
							<tr className="thead-dark">
								<th>Table Name</th>
								<th>Capacity</th>
								<th>Status</th>
								<th></th>					
							</tr>	
						</thead>
						<tbody>
							{tablesContent}						
						</tbody>					
					</table>
				</div>
			</div>
			{/** Modal Window */ }
			<div className="modal fade" id="confirmationModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
							Is this table ready to seat new guests? This cannot be undone.
						</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
						<button type="button" className="btn btn-primary" onClick={unseatTable} data-dismiss="modal">OK</button>
					</div>
					</div>
				</div>
			</div>

		</main>
  	);
}

export default Dashboard;
