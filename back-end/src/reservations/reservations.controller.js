const service = require("./reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")
const moment = require("moment") // used to validate date input

async function reservationExists(req, res, next) {
console.log("reservations.controller.js reservationExists, checking for:", req.params.reservation_id)
  try {
    const reservation = await service.read(req.params.reservation_id)

    if (reservation) {
      res.locals.reservation = reservation
console.log("reservations.controller.js reservationExists res.locals.reservation set to:", res.locals.reservation)
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

async function updateStatus(req, res, next) {
  
console.log("reservations.controller.js updateStatus res.locals.reservation:", res.locals.reservation)

  const reservation = res.locals.reservation

console.log("reseravations.controller.js updateStatus res.locals.reservation:", reservation)
  
  const newStatus = req.body.data.status

console.log("reservations.controller.js updateStatus new status from req.body.data:", newStatus)

  // Check if status is valid

  if (reservation.status === "finished") {
console.log("reseravations.controller.js updateStatus status is finished, cannot update...")
    next({ status: 400, message: `finished reservations cannot be updated` })
  }
  
  const validStatusList = ["booked", "seated", "finished"]

  if (!validStatusList.includes(newStatus)) {
console.log("reseravations.controller.js updateStatus valid status list does not include the sent status...")
    next({ status: 400, message: `unknown reservation status` })
  }
  
  const updatedReservation = {
    ...reservation,
    status: newStatus,
  }

console.log("reseravations.controller.js updateStatus updated reservation:", updatedReservation)

  const data = await service.update(updatedReservation)

console.log("reseravations.controller.js updateStatus data returned from service:", data)

  res.status(200).json( { data: { "status": newStatus } } )

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
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(updateStatus),
  ],
}

/* PUT /reservations/:reservation_id/status
      ✓ returns 404 for non-existent reservation_id (330 ms)
      ✕ returns 400 for unknown status (304 ms)
      ✕ returns 400 if status is currently finished (a finished reservation cannot be updated) (356 ms)
      ✕ returns 200 for status 'booked' (301 ms)
      ✕ returns 200 for status 'seated' (302 ms)
      ✕ returns 200 for status 'finished' (321 ms) */


/* POST /reservations
      ✓ returns 201 if status is 'booked' (405 ms)
      ✕ returns 400 if status is 'seated' (336 ms)
      ✕ returns 400 if status is 'finished' (315 ms) */
