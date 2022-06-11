import { useState } from "react"
import { useHistory } from "react-router-dom"
import { createTable } from "../utils/api"
import ErrorAlert from "./ErrorAlert"

export default function NewTable() {
   
    const history = useHistory()

    const initialFormData = {
        table_name: "",
        capacity: 0,
    }

    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({ ...initialFormData })

    const handleChange = ({ target }) => {
        
        setFormData({
            ...formData,
            [target.name]: target.value,
        })

    }

    async function handleSubmit(event) {
        event.preventDefault()
//console.log("NewTable.js handleSubmit beginning handleSubmit function...")
        
//console.log("NewTable.js handleSubmit checking for table name length...")
        if (formData.table_name.length < 2) {
//console.log("NewTable.js handleSubmit table name is not long enough, returning error...")
            setError({ message: `Table name must be at least 2 characters` })
            return
        }
//console.log("NewTable.js handleSubmit table name is long enough, checking that capacity is a number...")

        if (typeof parseInt(formData.capacity) !== "number") {
//console.log("NewTable.js handleSubmit capacity is not a number, returning error...")
            setError({ message: `Table capacity must be a number` })
            return
        }

        const abortController = new AbortController()
        const newTable = { ...formData, capacity: parseInt(formData.capacity) }

//console.log("NewTable.js handleSubmit new table to submit to api:", newTable)
        
        try {
            const response = await createTable(newTable, abortController.signal)
//console.log("newTable.js handleSubmit response in try/catch:", response)
            if (response.message) {
//console.log("NewTable.js handleSubmit inside try checking for response message:", response.message)
                setError(response)
                return
            }
//console.log("NewTable.js handleSubmit no message in response...")
        } catch (error) {
//console.log("NewTable.js handleSubmit inside catch:", error)
            setError(error.message)
            return
        }
        history.go(-1)
    }

    function handleCancel(event) {
        event.preventDefault()
        history.go(-1)
    }


    return (
        <div>
            <form className="new-table-form" onSubmit={handleSubmit}>
                <h1>Add Table</h1>
                <div className="form-group">
                    <label htmlFor="table_name">Table Name</label>
                    <input 
                        id="table_name"
                        className="form-control"
                        type="text"
                        name="table_name"
                        onChange={handleChange}
                        value={formData.table_name}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="capacity">Capacity</label>
                    <input
                        id="capacity"
                        className="form-control"
                        type="text"
                        name="capacity"
                        onChange={handleChange}
                        value={formData.capacity}
                    />
                    <div className="invalid-feedback">
                        Table name must be 2 characters minimum.
                    </div>
                </div>
                <ErrorAlert error={error} />
                <label htmlFor="submit">
                    <button
                        type="submit"
                        id="submit"
                        name="submit"
                        className="btn btn-primary"
                    >
                        Submit
                    </button>
                </label>
                <label htmlFor="cancel">
                    <button 
                        type="cancel"
                        id="cancel"
                        name="cancel"
                        className="btn btn-primary"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </label>
            </form>
        </div>
    )
}