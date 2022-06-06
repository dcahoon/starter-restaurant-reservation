const knex = require("../db/connection")

async function create(newTable) {
    const createdTables = await knex("tables")
        .insert(newTable)
        .returning("*")
    return createdTables[0]
}

function read(tableId) {
    return knex("tables")
        .select("*")
        .where({ table_id: tableId })
        .first()
}

function list() {
    return knex("tables")
        .select("*")
        .orderBy("table_name")
}

function update(updatedTable) {
    return knex("tables")
        .where({ table_name: updatedTable.table_name })
        .update(updatedTable, "*")
}

async function seatTable(updatedTable, updatedReservation) {

console.log("tables.service.js seatTable updatedTable passed into seatTable method:", updatedTable)
console.log("tables.service.js seatTable updatedReservation passed into seatTable method:", updatedReservation)

    let responseTable = {}

    try {

console.log("tables.service.js attempting transaction in seatTable...")

        await knex.transaction(async trx => {

            responseTable = await knex('tables')
                .where({ table_name: updatedTable.table_name })
                .update(updatedTable, "*")
                .returning("*")
                .transacting(trx)

console.log("tables.service.js responseTable from tables table:", responseTable)

            await knex('reservations')
                .where({ reservation_id: updatedReservation.reservation_id })
                .update(updatedReservation, "*")
                .transacting(trx)

        })

console.log("tables.service.js end of try/catch for seatTable transaction...")

    } catch (error) {
console.log("tables.service.js caught error in transaction...")
        console.error(error)
    }

console.log("tables.service.js returning response table:", responseTable)
    return responseTable[0]

}

module.exports = {
    create,
    list,
    update,
    read,
    seatTable,
}

// when selecting, always returns an array