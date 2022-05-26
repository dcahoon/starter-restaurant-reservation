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
    
    return knex.transaction(async trx => {
        
        try {
            const table = await trx('tables')
                .where({ table_name: updatedTable.table_name })
                .update(updatedTable, "*")
                .returning("*")
            
            const reservation = await trx('reservations')
                .where({ reservation_id: updatedReservation.reservation_id})
                .update(updatedReservation, "*")
            
            return await trx.commit()
            
            
        } catch (error) {
            await trx.rollback()
            
        }

    })
}

module.exports = {
    create,
    list,
    update,
    read,
    seatTable,
}

// when selecting, always returns an array