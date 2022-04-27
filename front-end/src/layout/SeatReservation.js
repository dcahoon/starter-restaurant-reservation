import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import ErrorAlert from "../layout/ErrorAlert"
const { listTables, getReservation, seatTable } = require("../utils/api")

export default function SeatReservation() {
    
    const [tables, setTables] = useState([])
    const [tableBeingAssigned, setTableBeingAssigned] = useState(null)
    const [reservation, setReservation] = useState({})
    const [error, setError] = useState(null)

    const history = useHistory()
    const { reservation_id } = useParams()

    const handleChange = ({ target: {value} }) => {
        setTableBeingAssigned(tables.find(({ table_id }) => table_id == value))
    }

    function handleCancel(event) {
        event.preventDefault()
        history.go(-1)
    }

    async function handleSubmit(event) {  
        event.preventDefault()
        console.log("reservationid:", reservation_id)
        const abortController = new AbortController()
        if (event.target.value) {
            setError({ message: "Please select a table." })
            return
        }
        try {
            const response = await getReservation(abortController.signal, reservation_id)
            const reservationFromApi = await response
            console.log("reservationFromApi:", reservationFromApi)
            setReservation(reservationFromApi)
            if (reservation.people > tableBeingAssigned.capacity) {
                setError({ message: "Table isn't big enough for party." })
                return
            }
        } catch (error) {
            setError(error)
            return
        }
        //console.log("reservation id", reservation_id, "table id", tableBeingAssigned.table_id)
        if (tableBeingAssigned) {
            try {
                const response = await seatTable(false, reservation_id, `${tableBeingAssigned.table_id}`, abortController.signal)
                if (response.message) {
                    setError({ message: response.message })
                    return
                }
                history.go(-1)
            } catch(error) {
                setError(error)
                return
            }
            
        } else {
            setError("Table not found.")
        }
    }
    
    /**
     * Loads tables from API
     */
    useEffect(() => {
        const abortController = new AbortController()
        setError(null)
        async function loadTablesFromApi() {
            try {
                const response = await listTables(abortController.signal)
                const tables = response.map((table) => (
                    { ...table }
                ))
                setTables(tables)
                } catch(error) {
                    setError(error)
                }
            }
            loadTablesFromApi()
    }, [])
        
    // Map out tables from API to populate select
    const content = tables.map((table, index) => (
        <option key={index} value={`${table.table_id}`}> {`${table.table_name} - ${table.capacity}`} </option>
    ))

    return (
        <div>
            <form>
                <label>
                    Tables:
                    <select id="table-select" name="table_id" onChange={handleChange}>
                        <option value="">-- Select a table --</option>
                        {content}
                    </select>
                </label>
                <button type="submit" onClick={handleSubmit} className="btn btn-primary">
                    Submit
                </button>
                <button onClick={handleCancel} className="btn btn-primary">
                    Cancel
                </button>
            </form>
            <ErrorAlert error={error} />
        </div>
    )
}
