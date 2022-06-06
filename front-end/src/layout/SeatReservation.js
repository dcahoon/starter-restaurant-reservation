import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import ErrorAlert from "../layout/ErrorAlert"
import { listTables, seatTable } from "../utils/api"

export default function SeatReservation() {

    const [error, setError] = useState(null)
    const [tables, setTables] = useState([])
    const [tableBeingSeated, setTableBeingSeated] = useState({})
    
    const { reservation_id } = useParams()
    const history = useHistory()

    async function handleSubmit(event) {

console.log("seatreservation.js start of handleSubmit function...")

        event.preventDefault()
        const abortController = new AbortController()
        
        try {
            const response = await seatTable(false, reservation_id, tableBeingSeated, abortController.signal)

console.log("seatreservation.js response in handleSubmit", response)

            if (response.message) {
                setError(response)

console.log("seatreservation.js message present in response, message:", response.message)

                return
            }
            
            history.push("/dashboard")

console.log("seatreservation.js handleSubmit successful, going back to dashboard...")

        } catch (error) {
            setError(error.message)
        }

    }

    const handleChange = (event) => {
console.log("seatreservation.js handleChange called...")
        setTableBeingSeated(event.target.value)
    }

    async function handleCancel(event) {
console.log("seatreservation.js handleCancel called...")
        event.preventDefault()
        history.go(-1);
    }

    /** Loads tables from API */
    useEffect(() => {
console.log("seatreservation.js entering useEffect to load tables...")
        const abortController = new AbortController()
        setError(null)
        async function loadTablesFromApi() {
console.log("seatreservation.js entering loadTablesFromApi function...")
            try {
console.log("seatreservation.js attempting to list tables...")
                const response = await listTables(abortController.signal)
                const tables = response.map((table) => (
                    { ...table }
                ))
console.log("seatreservation.js response from listTables:", response)
                setTables(tables)
console.log("seatreservation.js tables have been loaded...")
            } catch(error) {
console.log("seatreservation.js error loading tables...")
                setError(error)
            }
        }
console.log("seatreservation.js calling loadTablesFromApi funtion within useEffect...")
            loadTablesFromApi()
   
    }, [])
    
    // Map out tables from API to populate select
    const content = tables.map((table, index) => (
        <option key={index} value={table.table_id}>{`${table.table_name} - ${table.capacity}`}</option>
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
