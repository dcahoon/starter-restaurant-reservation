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

async function tableExists(req, res, next) {
    const table = await service.read(req.params.table_id)
    if (!table) {
        next({ status: 404, message: `Table not found` })
        return next()
    }
    res.locals.table = table
    return next()
}

async function list(req, res, next) {
    const data = await service.list()
    res.json({ data })
}

async function seatTable(req, res, next) {

    if (!req.body.data.reservation_id) {
        return next({ status: 400, message: `reservation_id missing` })
    }
    //console.log("res locals table", res.locals.table)
    // if table is already seated, return message
    if (res.locals.table.reservation_id !== null) {
        return next({ status: 400, message: `Table is occupied` })
    }
    //console.log("step2")
    // find reservation
    const reservationId = req.body.data.reservation_id
    const reservation = await reservationService.read(reservationId)

    // Return a message if the reservation isn't found
    if (!reservation) {
        return next({ status: 404, message: `Reservation ${req.body.data.reservation_id} not found`})
    }
    //console.log("step3")
    // if reservation is already seated, return error
    if (reservation.status === "Seated") {
        return next({ status: 400, message: `Reservation is already seated` })
    }
    // check capacity and return message if too small
    if (res.locals.table.capacity < reservation.people) {
        return next({ status: 400, message: `Table capacity too small for reservation` })
    }
    //console.log("step4")
    // seat the table
    const updatedTable = {
        ...res.locals.table,
        reservation_id: reservation.reservation_id,
    }

    // update reservation status to "Seated"
    const updatedReservation = {
        ...reservation,
        status: "Seated",
    }
    //console.log("step5")
    try {
        //const newReservation = await reservationService.update(updatedReservation)
        const data = await service.seatTable(updatedTable, updatedReservation)
        
        await res.json({ data })
        console.log("data in controller", data)
    } catch (error) {
        return next({ status: 400, message: `Error seating table` })
    }
    //console.log("step6")
    return next({ status: 200, message: "nothing caught it!" })

}

async function finishTable(req, res, next) {
    
    // if table isn't seated, return
    if (res.locals.table.reservation_id === null) {
        next ({ status: 400, message: `Table not currently seated` })
    }

    // unseat the table
    const updatedTable = {
        ...res.locals.table,
        reservation_id: null,
    }
    const data = await service.update(updatedTable)

    // find reservation
    const reservation = await reservationService.read(res.locals.table.reservation_id)
        
    // update reservation status
    const updatedReservation = {
        ...reservation,
        status: "Finished"
    }

    const newReservation = await reservationService.update(updatedReservation)

    res.json({ data })
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