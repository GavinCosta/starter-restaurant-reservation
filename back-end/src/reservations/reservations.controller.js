const reservationsService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for reservation resources
 */
async function bodyExists(req, res, next) {
  if (req.body.data) {
    return next();
  }
  next({ status: 400, message: "data doesnt exist" });
}

function validatePropertyExists(property) {
  return function (req, res, next) {
    // console.log(property, req.body[property], req.body.data[property])
    const value = req.body.data[property];
    if (value) {
      return next();
    }
    next({ status: 400, message: `${property} cannot be empty or missing` });
  };
}

async function validateTime(req, res, next) {
  const { reservation_time } = req.body.data;

  // Check if the time is in the format "HH:mm"
const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;

  if (timeRegex.test(reservation_time)) {
    return next();
  }

  next({
    status: 400,
    message: "reservation_time must be a valid time in the format HH:MM",
  });
}

async function validateDate(req, res, next) {
  const { reservation_date } = req.body.data;
  const dateObject = new Date(reservation_date);

  // Check if the date is a valid date and matches the "YYYY-MM-DD" format
  if (
    !isNaN(dateObject) &&
    dateObject instanceof Date 
   // && /^\d{4}-\d{2}-\d{2}$/.test(reservation_date)
  ) {
    return next();
  }
  next({ status: 400, message: "reservation_date must be a valid date" });
}

async function validatePartySize(req, res, next) {
  const { people } = req.body.data;
  if (people > 0) {
    next();
  } else {
    next({ status: 400, message: "people must be greater than 0" });
  }
}

async function validatePeopleIsANumber(req, res, next) {
  const { people } = req.body.data;
 

  if (typeof people === 'number') {
    next();
  } else {
    next({ status: 400, message: "people must be a valid number" });
  }
}

//validator isnt tuesday
function asDateString(date) {
  return `${date.getFullYear().toString(10)}-${(date.getMonth() + 1)
    .toString(10)
    .padStart(2, "0")}-${date.getDate().toString(10).padStart(2, "0")}`;
}

function today() {
  return asDateString(new Date());
}

async function notTuesdayValidator(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const dayOfTheWeek = new Date(reservation_date + " " + reservation_time);
  // console.log(reservation_time, dayOfTheWeek, dayOfTheWeek.getDay())
  if (dayOfTheWeek.getDay() !== 2) {
    next();
  } else {
    next({ status: 400, message: "We are closed on Tuesdays" });
  }
}

async function closedValidator(req, res, next) {
  const { reservation_time } = req.body.data;
  const reservationTimeNumber = reservation_time.split(":").join("");
  if (reservationTimeNumber > 1030 && reservationTimeNumber < 2130) {
    return next();
  }
  next({
    status: 400,
    message: `Sorry reservations are not available at ${reservation_time} please select a time between 10:30AM - 9:30PM`,
  });
}
//add reservation time, if date = today check if reservation_time is > current time (be wary of timezones)
async function timeValidator(req, res, next) {
  const { reservation_time, reservation_date } = req.body.data;
  const current = new Date();
  const currentTimeInMillis = current.getTime();
  const timeZoneOffsetInMinutes = current.getTimezoneOffset();
  const timeZoneOffsetInMillis = timeZoneOffsetInMinutes * 60 * 1000;
  const localTimeInMillis = currentTimeInMillis - timeZoneOffsetInMillis;
  const localTime = new Date(localTimeInMillis);
  const timeArray = localTime.toISOString().split("T");
  const currentDate = timeArray[0];
  const currentTimeArray = timeArray[1].split(":");
  const currentTime = currentTimeArray[0] + currentTimeArray[1];
  const reservationTimeNumber = reservation_time.split(":").join("");
  console.log(reservation_date, currentDate, reservationTimeNumber, currentTime, reservation_date === currentDate && reservationTimeNumber > currentTime)
  if (reservation_date === currentDate && reservationTimeNumber < currentTime) {
    return next({ status: 400, message: "cant book reservations in the past" });
  } else {
    return next();
  }
}

async function pastValidator(req, res, next) {
  const { reservation_date } = req.body.data;
  const day = today().split("-").join("");
  const date = reservation_date.split("-").join("");
  //console.log(day, reservation_date, today())
  if (day <= date) {
    next();
  } else {
    next({ status: 400, message: "Only future reservations are allowed" });
  }
}

async function list(req, res, next) {
  try {
    if (req.query.date) {
      const data = await reservationsService.list(req.query.date);
      data.sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));
      res.json({ data });
    } else if (req.query.mobile_number) {
      const data = await reservationsService.search(req.query.mobile_number);
      res.json({ data });
    }
  } catch (error) {
    next({ error });
  }
}

async function create(req, res, next) {
  const data = await reservationsService.create(req.body.data);
  res.status(201).json({ data });
}

async function reservationExists(req, res, next) {
  const {reservation_id} = req.params

  try {
    const foundReservation = await reservationsService.read(Number(reservation_id))
    //console.log(reservation_id, foundReservation, "****************")
    if (foundReservation) {
      res.locals.reservation = foundReservation
      next()
    } else {
      res.status(404).json({error: `Reservation ${reservation_id} not found`})
    }
  } catch(error) {
    res.status(500).json({error: "Internal Server Error"})
  }
}

async function read(req, res, next) {
  const foundReservation = res.locals.reservation
  res.json({data: foundReservation})
} 

function validatedStatusIsBooked(req, res, next) {
  const { status } = req.body.data;
  
  if (!status || status === 'booked') {
    next();
  } else {
    next({ status: 400, message: `${status} must be booked or empty` });
  }
}

async function update(req, res, next) {
  const {status} = req.body.data
  const {reservation_id} = req.params
  try {
    const updatedReservation = {
      //put all the form info for the table id found in params
      ...req.body.data,
      reservation_id
    };
    const data = await reservationsService.update(updatedReservation);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }  
}

function validStatus(req, res, next) {
  const { status } = req.body.data 
  if (status === 'booked' || status === 'seated' || status === 'finished' || status === 'cancelled') {
    next()
  } else {
    next({status: 400, message: `${status} is invalid`})
  }
}

function finishedReservationsCannotBeChanged(req, res, next) {
  const {status} = res.locals.reservation
  if (status === 'finished') {
    next({status: 400, message: 'cannot change finished status'})
  } else {
    next()
  }
}

function validatePhoneNumber(req, res, next) {
  const {mobile_number} = req.body.data
  let re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;

  if (re.test(mobile_number)) {
    next()
  } else {
    next({status: 400, message: 'Must include a valid phone number'})
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    bodyExists,
    validatePartySize,
    validatePeopleIsANumber,
    validatePropertyExists("first_name"),
    validatePropertyExists("last_name"),
    validatePropertyExists("mobile_number"),
    validatePropertyExists("reservation_date"),
    validatePropertyExists("reservation_time"),
    validatePropertyExists("people"),
    validatePhoneNumber,
    validateDate,
    validateTime,
    notTuesdayValidator,
    closedValidator,
    timeValidator,
    pastValidator,
    validatedStatusIsBooked,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  updateStatus: [asyncErrorBoundary(reservationExists), finishedReservationsCannotBeChanged, validStatus, asyncErrorBoundary(update)],
  update: [
    asyncErrorBoundary(reservationExists),
    bodyExists,
    validatePartySize,
    validatePeopleIsANumber,
    validatePropertyExists("first_name"),
    validatePropertyExists("last_name"),
    validatePropertyExists("mobile_number"),
    validatePhoneNumber,
    validatePropertyExists("reservation_date"),
    validatePropertyExists("reservation_time"),
    validatePropertyExists("people"),
    validateDate,
    validateTime,
    notTuesdayValidator,
    closedValidator,
    timeValidator,
    pastValidator,
    validatedStatusIsBooked,
    asyncErrorBoundary(update)]
};
