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

        if (formData.table_name.length < 2) {
            setError({ message: `Table name must be at least 2 characters` })
            return
        }

        if (typeof parseInt(formData.capacity) !== "number") {
            setError({ message: `Table capacity must be a number` })
            return
        }

        const abortController = new AbortController()
        const newTable = { ...formData, capacity: parseInt(formData.capacity) }

        try {
            const response = await createTable(newTable, abortController.signal)

            if (response.message) {
                setError(response)
                return
            } else {
                history.push("/")
            }
        } catch (error) {
            setError(error.message)
            return
        }
        
        history.push("/")
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