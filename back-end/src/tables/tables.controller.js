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
    res.status(201)
        .json({
            data: newTable,
        })
}

function tableNameValid(req, res, next) {
    if (res.locals.table.table_name.length < 2) {
        const message = `Table name must be 2 or more characters.`
        next({ status: 400, message })
    }
    return next()
}

function tableCapacityValid(req, res, next) {
    if (!res.locals.table.capacity) {
        const message = `Capacity must not be blank.`
        next ({ status: 400, message })
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
    
    // if table is already seated, return message
    if (res.locals.table.reservation_id !== null) {
        next({ status: 400, message: `Table is occupied` })
    }

    // find reservation
    const reservation = await reservationService.read(req.body.data.reservation_id)

    // if reservation is already seated, return error
    if (reservation.status === "Seated") {
        next({ status: 400, message: `Reservation is already seated` })
    }

    // check capacity and return message if too small
    if (res.locals.table.capacity < reservation.people) {
        next({ status: 400, message: `Table capacity too small for reservation` })
    }

    // seat the table
    const updatedTable = {
        ...res.locals.table,
        reservation_id: reservation.reservation_id,
    }
    const data = await service.update(updatedTable)

    // update reservation status to "Seated"
    const updatedReservation = {
        ...reservation,
        status: "Seated",
    }
    const newReservation = await reservationService.update(updatedReservation)
    // console.log("new reservation", newReservation)

    res.json({ data })

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
        asyncErrorBoundary(tableExists), 
        asyncErrorBoundary(seatTable)
    ],
    list,
    finishTable: [
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(finishTable),
    ],
}