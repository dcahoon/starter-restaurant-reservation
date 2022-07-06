
import React, { useEffect, useState } from "react";
import { listReservations, listTables, finishTable, updateStatus } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation } from "react-router-dom"
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
				await finishTable(tableId)
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
		<tr key={table.table_name}>
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
					className="" 
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
		<main className="row col-12 m-0 p-0">
			<h1 className="row col-12 ml-3">Dashboard</h1>
			<div>
				<h4 className="row col-lg-12 col-12 ml-3">Reservations for {date}</h4>
			</div>
			<ErrorAlert error={error} />
			<div className="dash-content row">
				<div className="col-lg-9 col-med-12">
					<ReservationsList reservations={reservations} cancelReservation={cancelReservation} />
				</div>
				<div className="col-lg-3 col-med-12">
					<table className="table table-dark m-2">
						<thead>
							<tr className="">
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
