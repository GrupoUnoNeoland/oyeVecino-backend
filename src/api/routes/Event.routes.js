const EventRoutes = require("express").Router();

const { isAuth, isAuthAdmin } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");

const {
  createEvent,
  deleteEvent,
  getAllEvent,
  getByIdEvent,
  toggleNeighborhood,
  toggleComment,
  toggleSponsor,
  updateEvent,
  toggleLike,
} = require("../controllers/Event.controller");

EventRoutes.get("/", [isAuth], getAllEvent);
EventRoutes.delete("/delete/:id", [isAuth], deleteEvent);
EventRoutes.get("/:id", [isAuth], getByIdEvent);
EventRoutes.patch("/add/neighborhoods/:id", [isAuthAdmin], toggleNeighborhood);
EventRoutes.patch("/add/comments/:id", [isAuth], toggleComment);
EventRoutes.patch("/add/sponsors/:id", [isAuth], toggleSponsor);
EventRoutes.patch("/add/likes/:id", [isAuth], toggleLike);

EventRoutes.post("/create", upload.array("images", 5), [isAuth], createEvent);
EventRoutes.patch("/update/event/:id", upload.array("image", 5), [isAuth], updateEvent);

module.exports = EventRoutes;