const knex = require("../db/connection")

function create(newReservation) {
    return knex("reservations")
        .insert(newReservation)
        .returning("*")
        .then((createdReservations) => createdReservations[0])
}

function read(reservation_id) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: reservation_id })
        .first()
}

function list() {
    return knex("reservations")
        .select("*")
}

function search(mobile_number) {
    return knex("reservations")
        .whereRaw(
            "translate(mobile_number, '() -', '') like ?",
            `%${mobile_number.replace(/\D/g, "")}%`
        )
        .orderBy("reservation_date");
}

function listReservationsByDate(date) {
    return knex("reservations")
        .select("*")
        .where({ reservation_date: date })
        .whereNot({ status: "finished" })
        .orderBy("reservation_time")
}

function update(reservation) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: reservation.reservation_id })
        .update(reservation, "*")
}

module.exports = {
    create,
    list,
    search,
    read,
    listReservationsByDate,
    update,
}