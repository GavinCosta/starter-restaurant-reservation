const service = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function bodyExists(req, res, next) {
  console.log("bodyExists");

  if (req.body.data) {
    return next();
  }
  next({ status: 400, message: "data doesnt exist" });
}
//validate missing/empty values
async function validateIdExists(req, res, next) {
  console.log("validateIdExists");
  const { reservation_id } = req.body.data;
  try {
    const reservation = await reservationService.read(reservation_id);
    if (reservation) {
      res.locals.reservation = reservation
      return next();
    }
    next({ status: 404, message: `${reservation_id} doesnt exist` });
  } catch (error) {
    next(error);
  }
}

function validatePropertyExists(property) {
  console.log("validatePropertyExists");
  return function (req, res, next) {
    const value = req.body.data[property];
    if (value) {
      return next();
    }
    next({ status: 400, message: `${property} cannot be empty or missing` });
  };
}
//table_name is more than 1 character
function validateTableNameLength(req, res, next) {
  const { table_name } = req.body.data;
  if (table_name.length > 1) {
    next();
  } else {
    next({
      status: 400,
      message: "table_name must be atleast 2 characters long",
    });
  }
}

async function validCapacity(req, res, next) {
  // console.log('validateCapacity')
  // console.log(req.body.data, "BOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOODY")

  const { capacity } = req.body.data;
  const parsedCapacity = Number(capacity);
  //   console.log('capacity', capacity)
  //   console.log('parsedCapacity', parsedCapacity)
  //   console.log('not a number', !isNaN(parsedCapacity))
  //   console.log('type of', typeof capacity)
  if (!isNaN(parsedCapacity) && typeof capacity === "number") {
    next();
  } else {
    next({
      status: 400,
      message: "capacity must be a valid number greater than zero",
    });
  }
}

async function validateOccupied(req, res, next) {
  // console.log(req.body.data);
  //const { reservation_id } = req.body.data;
  const { table_id } = req.params;
  console.log(table_id);
  try {
    const data = await service.read(table_id);
    console.log(!data.reservation_id);
    if (!data.reservation_id) {
      return next();
    }
    return next({ status: 400, message: "table is occupied" });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const data = await service.list();
    data.sort((a, b) => a.table_name.localeCompare(b.table_name));
    res.json({ data });
  } catch (error) {
    next({ error });
  }
}

async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function update(req, res, next) {
  //console.log('update XXXXXXXXXXXXXXXXXXXXX')
  const {reservation_id} = res.locals.reservation
   const { table_id } = req.params;
  try {
    const updatedTable = {
      //put all the form info for the table id found in params
      ...req.body.data,
      table_id,
    };
    const data = await service.update(updatedTable);
    await reservationService.update({reservation_id, status: 'seated'})
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

function resStatusIsntSeated(req, res, next) {
  const {status} = res.locals.reservation
  if (status === 'seated') {
    next({status: 400, message: 'cannot seat a seated reservation'})
  } else {
    next()
  }
}


async function peopleFitInTable(req, res, next) {
  const { reservation_id } = req.body.data;
  //console.log(reservation_id, "reservation******")
  const { table_id } = req.params;
  //console.log(table_id, 'table***********')
  try {
    const table = await service.read(table_id);
    // console.log(table, "XXXXXXXXXXXXXXXXXXXX")
    const reservation = await reservationService.read(reservation_id);
    console.log(
      table.capacity,
      reservation.people,
      table.capacity >= reservation.people,
      "-----------------"
    );
    if (table.capacity >= reservation.people) {
      return next();
    }
    return next({
      status: 400,
      message: "Table doesnt have sufficient capacity",
    });
  } catch (error) {
    next(error);
  }
}

async function finish(req, res, next) {
  const { table_id } = req.params;
  const {reservation_id} = res.locals.table
  try {
    const updatedTable = {
      //put all the form info for the table id found in params
      
      table_id, 
      reservation_id: null
    };
    const data = await service.update(updatedTable);
    await reservationService.update({reservation_id, status: 'finished'})
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

async function validateIsOccupied(req, res, next) {
  const { table_id } = req.params;
  console.log(table_id);
  try {
    const data = await service.read(table_id);
    //console.log(data.reservation_id);
    if (data.reservation_id) {
      return next();
    }
    return next({ status: 400, message: "table is not occupied" });
  } catch (error) {
    next(error);
  }
}

async function validateTableExists(req, res, next) {
  console.log("validateIdExists");
  const { table_id } = req.params
  try {
    const table = await service.read(table_id);
    if (table) {
      res.locals.table = table
      return next();
    }
    next({ status: 404, message: `${table_id} does not exist` });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    bodyExists,
    validatePropertyExists("capacity"),
    validatePropertyExists("table_name"),
    validCapacity,
    validateTableNameLength,
    asyncErrorBoundary(create),
  ],
  update: [
    bodyExists,
    validatePropertyExists("reservation_id"),
    validateIdExists,
    peopleFitInTable,
    validateOccupied,
    resStatusIsntSeated,
    asyncErrorBoundary(update),
  ],
  finish: [validateTableExists, validateIsOccupied, asyncErrorBoundary(finish)]
};

//create new validator for capacity

//validator will read reservations and return people (party size)
//then check if table (read from table_id in params) has a capacity <= people
