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
    
    knex.transaction(async trx => {
        
        try {
            
            await trx('tables')
                .where({ table_name: updatedTable.table_name })
                .update(updatedTable, "*")
                .returning("*")
            
            await trx('reservations')
                .where({ reservation_id: updatedReservation.reservation_id})
                .update(updatedReservation, "*")
            
            await trx.commit()
            
        } catch (error) {
            await trx.rollback()
        }

    })
    
    /* knex.transaction(function(t) {
        knex('foo')
        .transacting(t)
        .insert({id:"asdfk", username:"barry", email:"barry@bar.com"})
        .then(function() {
            knex('foo')
            .where('username','=','bob')
            .update({email:"bob@foo.com"})
            .then(t.commit, t.rollback)
        })
     })
     .then(function() {
      // it worked
     },
     function() {
      // it failed
     }); */

}

module.exports = {
    create,
    list,
    update,
    read,
    seatTable,
}

// when selecting, always returns an array