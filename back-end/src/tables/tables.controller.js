const service = require("./tables.service")
const reservationService = require("../reservations/reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")

async function hasData(req, res, next) {
    if (req.body.data) {
        res.locals.table = req.body.data
        return next()
    }
    const message = "Body must have a data property."
    next({ status: 400, message })
}

async function create(req, res, next) {
    
    const newTable = await service.create(req.body.data)
    res.status(201).json({ data: newTable })
}

function tableNameValid(req, res, next) {
    if (!res.locals.table.table_name) {
        next({ status: 400, message: `table_name required` })
    }
    if (res.locals.table.table_name.length < 2) {
        next({ status: 400, message: `table_name must be 2 or more characters` })
    }
    return next()
}

function tableCapacityValid(req, res, next) {
    if (!res.locals.table.capacity) {
        next ({ status: 400, message: `capacity must not be blank.` })
    }
    if (typeof res.locals.table.capacity !== 'number') {
        next({ status: 400, message: `Table capacity must be a number` })
    }
    return next()
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function tableExists(req, res, next) {
    const table = await service.read(req.params.table_id)
    if (!table) {
        next({ status: 404, message: `Table ${req.params.table_id} not found` })
        return next()
    }
    res.locals.table = table
    return next()
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function list(req, res, next) {
    const data = await service.list()
    res.json({ data })
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function seatTable(req, res, next) {

    if (!req.body.data.reservation_id) {
        return next({ status: 400, message: `reservation_id missing` })
    }

    if (res.locals.table.reservation_id !== null) {
        return next({ status: 400, message: `Table is occupied` })
    }

    const reservationId = req.body.data.reservation_id
    let reservation = {}

    // Try to fetch reservation
    try {
        const response = await reservationService.read(reservationId)
        if (response) {
            reservation = response
        } else {
            return next({ status: 404, message: `Reservation id ${reservationId} not found`})
        }
    } catch (error) {
        return next({ status: 404, message: `Reservation ${reservationId} not found`})
    }

    // if reservation is already seated, return error
    if (reservation.status === "seated") {
        return next({ status: 400, message: `Reservation is already seated` })
    }

    // check capacity and return message if too small
    if (res.locals.table.capacity < reservation.people) {
        return next({ status: 400, message: `Table capacity too small for reservation` })
    }

    // Create updated table
    const updatedTable = {
        ...res.locals.table,
        reservation_id: reservation.reservation_id,
    }

    // Update reservation status to "Seated"
    const updatedReservation = {
        ...reservation,
        status: "seated",
    }
    
    try {
        const data = await service.seatTable(updatedTable, updatedReservation)
        res.json({ data })
    } catch (error) {
        return next({ status: 400, message: `Error seating table` })
    }

    res.status(200)

}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function finishTable(req, res, next) {
    
    // if table isn't seated, return
    if (res.locals.table.reservation_id === null) {
        next ({ status: 400, message: `Table currently not occupied` })
    }

    const updatedTable = {
        ...res.locals.table,
        reservation_id: null,
    }

    const reservationId = res.locals.table.reservation_id
    let reservation = {}

    // Try to fetch reservation
    try {
        const response = await reservationService.read(reservationId)
        if (response) {
            reservation = response
        } 
    } catch (error) {
        return next({ status: 404, message: `Reservation ${reservationId} not found`})
    }

    const updatedReservation = {
        ...reservation,
        status: "finished"
    }

    try {
        const data = await service.seatTable(updatedTable, updatedReservation)
        await res.json({ data })

    } catch (error) {
        return next({ status: 400, message: `Error seating table` })
    }
    
    res.status(200)
}



module.exports = {
    create: [
        asyncErrorBoundary(hasData), 
        asyncErrorBoundary(tableNameValid),
        asyncErrorBoundary(tableCapacityValid),
        asyncErrorBoundary(create)
    ],
    seatTable: [
        asyncErrorBoundary(hasData),
        asyncErrorBoundary(tableExists), 
        asyncErrorBoundary(seatTable)
    ],
    list,
    finishTable: [
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(finishTable),
    ],
}