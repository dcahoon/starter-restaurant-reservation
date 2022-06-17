const service = require("./reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")
const moment = require("moment") // used to validate date input

async function reservationExists(req, res, next) {

  try {
    const reservation = await service.read(req.params.reservation_id)

    if (reservation) {
      res.locals.reservation = reservation

      next()
    } else {
      next({ status: 404, message: `Reservation ${req.params.reservation_id} not found` })
    }
  } catch (error) {
    next({ status: 404, message: error.message })
  }
}

async function hasData(req, res, next) {
  if (req.body.data) {
    res.locals.reservation = req.body.data
    return next();
  }
  next({ status: 400, message: "body must have data property" })
}

function dataHas(propertyName) {
  const methodName = `dataHas('${propertyName}')`
  return (req, res, next) => {
    const reservation = res.locals.reservation
    const value = reservation[propertyName]
    if (value === "" || value === undefined) {
      const message = `Reservation must include a '${propertyName}' property.`
      next({ status: 400, message: message })
    }
    return next()
  }
}

const hasFirstName = dataHas("first_name")
const hasLastName = dataHas("last_name")
const hasMobileNumber = dataHas("mobile_number")
const hasReservationDate = dataHas("reservation_date")
const hasReservationTime = dataHas("reservation_time")
const hasPeople = dataHas("people")



async function hasBookedStatus (req, res, next) {
  const reservation = res.locals.reservation
  if (reservation.status === "seated" || reservation.status === "finished") {
    next({ status: 400, message: `Status cannot be seated or finished for a new reservation` })
  }
  return next()
}

async function hasValidDate (req, res, next) {
  const reservation = res.locals.reservation
  const result = moment(reservation.reservation_date, "YYYY-MM-DD", true).isValid()
  if (result) {
    // Restaurant is closed on Tuesdays
    if (moment(reservation.reservation_date).format('dddd') === 'Tuesday') {
      const message = 'Date provided is a Tuesday, restaurant is closed.'
      next({ status: 400, message: message })
    }
    // Return error if reservation is made for a current or past date
    if (moment(reservation.reservation_date) < new Date()) {
      const message = 'Reservation must be for a future date.'
      next({ status: 400, message: message })
    }
    return next()
  }
  const message = `reservation_date is invalid.`
  next({ status: 400, message: message })
}

function hasValidTime(req, res, next) {
  const reservation = res.locals.reservation
  const resTime = moment(reservation.reservation_time, "kk:mm", true)
  const result = resTime.isValid()
  if (result) {
    const openTime = moment("10:30", "HH:mm")
    const latestResTime = moment("21:30", "HH:mm")
    if (resTime.isBefore(openTime)) {
      next({ status: 400, message: "Restaurant opens at 10:30."})
    }
    if (latestResTime.isBefore(resTime)) {
      next({ status: 400, message: "Latest reservation time is 9:30 PM."})
    }
    return next()
  }
  const message = `reservation_time is invalid.`
  next({ status: 400, message: message })
}

function hasValidPeople(req, res, next) {
  const reservation = res.locals.reservation
  if (typeof reservation.people === 'string') {
    next({ status: 400, message: `people must be an integer` })
  }
  if (!reservation.people) {
    next({ status: 400, message: `people must not be null or undefined `})
  } else if ( reservation.people <= 0 ) {
    const message = `Property 'people' must be an integer greater than 0.`
    next({ status: 400, message: message })
  } else if (reservation.people === "" || isNaN(reservation.people)) {
    const message = `Property 'people' must be an integer greater than 0.`
    next({ status: 400, message: message })
  } else {
    return next()
  }
}

async function read(req, res, next) {
  const reservation = res.locals.reservation
  res.status(200).json({
    data: reservation,
  })
}

async function list(req, res, next) {

  const mobileNumber = req.query.mobile_number

  if (mobileNumber) {
    const data = await service.search(mobileNumber)
    res.json({ data })
  }

  const date = req.query.date
  if (date) {
    const data = await service.listReservationsByDate(date)
    res.json({ data })
  } else {
    const data = await service.list()
    res.json({ data })
  }
}

async function create(req, res, next) {
  const newReservation = await service.create(res.locals.reservation)
  res.status(201).json({
    data: newReservation,
  })
}

async function updateReservation(req, res, next) {

  // Only "booked" reservations can be updated
  const updatedReservation = req.body.data
  if (updatedReservation.status !== "booked") {
    return next({ status: 400, message: `Status must be "booked" to update reservation` })
  }

  try {
    const data = await service.update(updatedReservation)
    const extractedFromArray = data[0]
    res.status(200).json({ data: extractedFromArray })
  } catch (error) {
    return next({ status: 400, message: error.message })
  }

}

async function updateStatus(req, res, next) {

  const reservation = res.locals.reservation

  const newStatus = req.body.data.status

  if (reservation.status === "finished") {
    return next({ status: 400, message: `finished reservations cannot be updated` })
  }
  
  const validStatusList = ["booked", "seated", "finished", "cancelled"]

  if (!validStatusList.includes(newStatus)) {
    return next({ status: 400, message: `unknown reservation status` })
  }
  
  const updatedReservation = {
    ...reservation,
    status: newStatus,
  }

  const data = await service.update(updatedReservation)

  res.status(200).json( { data: { status: newStatus } } )

}


module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [
    asyncErrorBoundary(hasData), 
    hasBookedStatus,
    hasFirstName,
    hasLastName,
    hasMobileNumber,
    hasReservationDate,
    asyncErrorBoundary(hasValidDate),
    hasReservationTime,
    hasValidTime,
    hasPeople,
    hasValidPeople,
    asyncErrorBoundary(create)
  ],
  read: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(read)
  ],
  updateReservation: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(hasData),
    hasFirstName,
    hasLastName,
    hasMobileNumber,
    hasReservationDate,
    asyncErrorBoundary(hasValidDate),
    hasReservationTime,
    hasValidTime,
    hasPeople,
    hasValidPeople,
    asyncErrorBoundary(updateReservation)
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(updateStatus),
  ],
}
