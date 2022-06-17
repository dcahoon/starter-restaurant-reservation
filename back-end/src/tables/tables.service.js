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

    let responseTable = {}

    try {
        await knex.transaction(async trx => {

            responseTable = await knex('tables')
                .where({ table_name: updatedTable.table_name })
                .update(updatedTable, "*")
                .returning("*")
                .transacting(trx)

            await knex('reservations')
                .where({ reservation_id: updatedReservation.reservation_id })
                .update(updatedReservation, "*")
                .transacting(trx)
        })
    } catch (error) {
        console.error(error)
    }

    return responseTable[0]

}

module.exports = {
    create,
    list,
    update,
    read,
    seatTable,
}
