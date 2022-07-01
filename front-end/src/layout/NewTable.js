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
    
    const validations = {
        table_name: "",
        capacity: "",
    }

    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({ ...initialFormData })
    const [validationMessages, setValidationMessages] = useState({ ...validations })

    const handleChange = ({ target }) => {
        setFormData({
            ...formData,
            [target.name]: target.value,
        })
        switch (target.name) {
            case "table_name":
                if (target.value.length < 2) {
                    setValidationMessages({
                        ...validationMessages,
                        table_name: "Table name must be at least 2 characters",
                    })
                } else {
                    setValidationMessages({
                        ...validationMessages,
                        table_name: "",
                    })
                }
                break
            case "capacity":
                if (target.value < 1) {
                    setValidationMessages({
                        ...validationMessages,
                        capacity: "Capacity must be at least 1"
                    })
                } else {
                    setValidationMessages({
                        ...validationMessages,
                        capacity: "",
                    })
                }
                break
            default:
                break
            }
    }

    async function handleSubmit(event) {
        event.preventDefault()

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
                    <span className="validation-error">{validationMessages.table_name}</span>
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
                    <span className="validation-error">{validationMessages.capacity}</span>
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