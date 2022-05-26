import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import ErrorAlert from "../layout/ErrorAlert"
const { listTables, getReservation, seatTable } = require("../utils/api")

export default function SeatReservation() {
    
    /**
    const [reservation, setReservation] = useState({})
    const { reservation_id } = useParams()
    
    async function handleSubmit(event) {  
        event.preventDefault()
        const abortController = new AbortController()
        
        try {
            console.log("reservation id", reservation_id)
            const response = await getReservation(abortController.signal, reservation_id)
            console.log("response", response)
            const reservationFromApi = await response
            setReservation(reservationFromApi)
            console.log("reservation", reservation)
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
    */

    const [error, setError] = useState(null)
    const [tables, setTables] = useState([])
    const [tableBeingSeated, setTableBeingSeated] = useState({})
    
    const { reservation_id } = useParams()
    const history = useHistory()

    async function handleSubmit(event) {
        
        /* event.preventDefault()
        const abortController = new AbortController()
        
        try {
            // seatTable(unseat, reservationId, tableId, signal)  
            const response = await seatTable(false, reservation_id, tableBeingSeated, abortController.signal)
            
        } catch (error) {
            setError(error)
        }
        return */

        event.preventDefault()
        const abortController = new AbortController()

        try {
            const response = await seatTable(false, reservation_id, tableBeingSeated, abortController.signal)
            if (response.message) {
                setError(response)
                return
            } else {
                history.go(-1)
            }
        } catch (error) {
            setError(error.message)
        }

    }

    const handleChange = ({ target }) => {
        setTableBeingSeated(target.value)
        console.log("target value", target.value)
        setError(null)
        console.log("table being seated", tableBeingSeated)
    }

    async function handleCancel(event) {
        event.preventDefault()
        history.go(-1)
    }

    /** Loads tables from API */
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
        <option key={index} value={table.table_id}> {`${table.table_name} - ${table.capacity}`} </option>
    ))

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Tables:
                    <select id="table-select" name="table_id" onChange={handleChange}>
                        <option value="">-- Select a table --</option>
                        {content}
                    </select>
                </label>
                <button type="submit" className="btn btn-primary">
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
