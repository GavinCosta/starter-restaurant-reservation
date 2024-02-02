 const knex = require('../db/connection')
 const tableName = 'reservations'
//write a function to list all reservations where the date is the same as the date in the url

 async function list(date) {
  //console.log(date)
    return knex(tableName).select('*').where({reservation_date: date}).whereNot({status: 'finished'}); 
  }

async function create(reservation) {
  return knex(tableName)
            .insert(reservation)
            .returning('*')
            .then((newReservations) => newReservations[0])
}

async function read(id) {
 // console.log(id, "*************************")
  return knex(tableName)
    .select('*')
    .where({reservation_id: id}).first()
}

async function update(updatedReservation) {
  return knex(tableName)
    .select("*")
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation)
    .then(() => read(updatedReservation.reservation_id));
}

function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

module.exports = {
    list,
    create,
    read,
    update,
    search
}