
import React, { useEffect, useState } from "react";
import { listReservations, listTables, finishTable, updateStatus } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, Link } from "react-router-dom"
import ReservationsList from "../layout/ReservationsList"

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

	useEffect(() => {
		const abortController = new AbortController()
		loadReservationsAndTables(abortController.signal)
		return () => abortController.abort()
	}, [date])

	async function loadReservationsAndTables(signal) {
		try {
			const reservationsFromApi = await listReservations({date}, signal)
			setReservations(reservationsFromApi)
			const tablesFromApi = await listTables(signal)
			const sortedTables = tablesFromApi.sort((table) => table.table_name)
			setTables(sortedTables)
		} catch (error) {
			if (error.name === "AbortError") {
				console.log("Aborted")
			} else {
				setError(error)
			}
		}
	}

	async function unseatTable(tableId) {
		
		if(window.confirm('Is this table ready to seat new guests? This cannot be undone.')) {
			try {	
				const response = await finishTable(tableId)
			} catch (error) {
				setError(error)
			}
			const abortController = new AbortController()
	
			try {
				const fetchedTables = await listTables(abortController.signal)
				const sortedTables = fetchedTables.sort((table) => table.table_name)
				setTables(sortedTables)
			} catch (error) {
				console.error(error)
			}
			loadReservationsAndTables()
		}
	}

	async function cancelReservation(reservationId) {
        const { signal } = new AbortController()
        if (window.confirm('Do you want to cancel this reservation? This cannot be undone.')) {
            try {
                const response = await updateStatus(reservationId, "cancelled", signal)
                if (response.message) {
                    setError(response)
                    return
                }
				loadReservationsAndTables()
            } catch (error) {
                setError(error)
            }
        }
        return
    }

  	const tablesContent = tables.map((table, index) => (  
		<tr key={index}>
			<td>{table.table_name}</td>
			<td>{table.capacity}</td>
			{ table.reservation_id ? 
				<td className="text-danger">
					<span data-table-id-status={table.table_id}>
						occupied
					</span>
				</td> : 
				<td className="text-success">
					<span data-table-id-status={table.table_id}>
						free
					</span>
				</td> 
			}
			<td>
				<button 
					data-table-id-finish={table.table_id}
					id={table.table_id} 
					className="btn btn-primary" 
					data-toggle="modal" 
					data-target="#confirmationModal"
					onClick={() => unseatTable(table.table_id)}
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
					<ReservationsList reservations={reservations} cancelReservation={cancelReservation} />
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

		</main>
  	);
}

export default Dashboard;
