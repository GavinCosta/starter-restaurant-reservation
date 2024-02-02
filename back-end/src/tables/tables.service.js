const knex = require("../db/connection");
const tableName = "tables";
//write a function to list all reservations where the date is the same as the date in the url

async function list() {
  //console.log(date)
  return knex(tableName).select("*");
}

async function create(table) {
  return knex(tableName)
    .insert(table)
    .returning("*")
    .then((newTable) => newTable[0]);
}

async function read(id) {
  return knex(tableName).select("*").where({ table_id: id }).first();
}


async function update(updatedItem) {
  return knex(tableName)
    .select("*")
    .where({ table_id: updatedItem.table_id })
    .update(updatedItem)
    .then(() => read(updatedItem.table_id));
}

module.exports = {
  list,
  read,
  create,
  update,
};
