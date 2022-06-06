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

console.log("tables.controller.js seatTable checking for reservation_id...")
    if (!req.body.data.reservation_id) {
        return next({ status: 400, message: `reservation_id missing` })
    }

console.log("tables.controller.js seatTable reservation_id present, checking if table is already seated...")
console.log("tables.controller.js seatTable res.locals.table.reservation_id:", res.locals.table.reservation_id)
    // if table is already seated, return message
    if (res.locals.table.reservation_id !== null) {
console.log("tables.controller.js seatTable reservation_id not null, table is occupied...")
        return next({ status: 400, message: `Table is occupied` })
    }
    
console.log("tables.controller.js seatTable table not already seated, entering try/catch to fetch reservation...")

    const reservationId = req.body.data.reservation_id
    let reservation = {}

    // Try to fetch reservation
    try {
        const response = await reservationService.read(reservationId)
        if (response) {
console.log("tables.controller.js seatTable received response when fetching reservation:", response)
            reservation = response
console.log("tables.controller.js seatTable reservation from response fetching reservation:", reservation)
        } else {
console.log("tables.controller.js seatTable no response when fetching reservation...")
            return next({ status: 404, message: `Reservation id ${reservationId} not found`})
        }
console.log("tables.controller.js seatTable end of try/catch to fetch reservation...")
    } catch (error) {
console.log("tables.controller.js seatTable error caught when trying to fetch reservation...")
        return next({ status: 404, message: `Reservation ${reservationId} not found`})
    }
    
console.log("tables.controller.js seatTable reservation loaded successfully, checking if already seated...")

    // if reservation is already seated, return error
    if (reservation.status === "Seated") {
        return next({ status: 400, message: `Reservation is already seated` })
    }

console.log("tables.controller.js seatTable reservation not already seated, checking capacity...")

    // check capacity and return message if too small
    if (res.locals.table.capacity < reservation.people) {
        return next({ status: 400, message: `Table capacity too small for reservation` })
    }
    
console.log("tables.controller.js seatTable capacity sufficient, creating updated table...")

    // Create updated table
    const updatedTable = {
        ...res.locals.table,
        reservation_id: reservation.reservation_id,
    }

console.log("tables.controller.js seatTable updated table:", updatedTable)
console.log("tables.controller.js seatTable creating updated reservation...")

    // Update reservation status to "Seated"
    const updatedReservation = {
        ...reservation,
        status: "seated",
    }

console.log("tables.controller.js seatTable updated reservation:", updatedReservation)
    
    try {

console.log("tables.controller.js seatTable inside try/catch, attempting to seat table...")
        const data = await service.seatTable(updatedTable, updatedReservation)
console.log("tables.controller.js seatTable data returned from seatTable service:", data)
        res.json({ data })
    } catch (error) {
console.log("tables.controller.js seatTable error seating table, returning...")
        return next({ status: 400, message: `Error seating table` })
    }
    
console.log("tables.controller.js seatTable end of seatTable method, returning next and status 200...")
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
    
console.log("tables.controller.js finishTable begin function")

    // if table isn't seated, return
    if (res.locals.table.reservation_id === null) {
        next ({ status: 400, message: `Table currently not occupied` })
    }

console.log("tables.controller.js finishTable table is seated, creating updatedTable...")

    // unseat the table
    const updatedTable = {
        ...res.locals.table,
        reservation_id: null,
    }

console.log("tables.controller.js finishTable updatedTable created:", updatedTable)

console.log("tables.controller.js finishTable res.locals.table:", res.locals.table)

    const reservationId = res.locals.table.reservation_id
    let reservation = {}

    // Try to fetch reservation
    try {
        const response = await reservationService.read(reservationId)
        if (response) {
console.log("tables.controller.js finishTable received response when fetching reservation:", response)
            reservation = response
console.log("tables.controller.js finishTable reservation from response fetching reservation:", reservation)
        } else {
console.log("tables.controller.js finishTable no response when fetching reservation...")
        }
console.log("tables.controller.js finishTable end of try/catch to fetch reservation...")
    } catch (error) {
console.log("tables.controller.js finishTable error caught when trying to fetch reservation...")
        return next({ status: 404, message: `Reservation ${reservationId} not found`})
    }

console.log("tables.controller.js finishTable creating updated reservation...")

    const updatedReservation = {
        ...reservation,
        status: "finished"
    }

console.log("tables.controller.js finishTable updatedReservation created:", updatedReservation)

    try {
console.log("tables.controller.js finishTable inside try/catch, attempting to seat table...")
        const data = await service.seatTable(updatedTable, updatedReservation)
        await res.json({ data })

    } catch (error) {
console.log("tables.controller.js finishTable error seating table, returning...")
        return next({ status: 400, message: `Error seating table` })
    }
    
console.log("tables.controller.js finishTable end of finishTable method, returning next and status 200...")
    res.status(200)

    /* const data = await service.update(updatedTable)

    // find reservation
    const reservation = await reservationService.read(res.locals.table.reservation_id)

    // update reservation status
    const updatedReservation = {
        ...reservation,
        status: "Finished"
    }

    const newReservation = await reservationService.update(updatedReservation)

    res.json({ data }) */
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