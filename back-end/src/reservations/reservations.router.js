const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require ('../errors/methodNotAllowed')


router.route("/").post(controller.create).get(controller.list).all(methodNotAllowed)
//route for seating a specific reservation, create a read function that looks up specified reservation using params
router.route("/:reservation_id").get(controller.read).put(controller.update).all(methodNotAllowed)

router.route("/:reservation_id/status").put(controller.updateStatus).all(methodNotAllowed)
module.exports = router;