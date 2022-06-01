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

        event.preventDefault()
        const abortController = new AbortController()
        
        try {
            const response = await seatTable(false, reservation_id, tableBeingSeated, abortController.signal)
            if (response.message) {
                setError(response)
                return
            }
            history.go(-1)
        } catch (error) {
            setError(error.message)
        }

    }

    const handleChange = (event) => {
        setTableBeingSeated(event.target.value)
        // setError(null)
    }

    async function handleCancel(event) {
        event.preventDefault()
        history.goBack();
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
