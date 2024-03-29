const { isAuth, isAuthAdmin } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const {
  createNeighborhood,
  deleteNeighborhood,
  updateNeighborhood,
  toggleUsers,
  toggleServices,
  toggleEvents,
  toggleStatements,
  getByIdNeighborhood,
  getAllNeighborhood,
  togglecityInNeighborhood,
} = require("../controllers/Neighborhood.controllers");
const express = require("express");

const NeighborhoodRoutes = express.Router();

NeighborhoodRoutes.post(
  "/",
  [isAuthAdmin],
  upload.single("image"),
  createNeighborhood
);
NeighborhoodRoutes.delete("/delete/:id", [isAuthAdmin], deleteNeighborhood);
NeighborhoodRoutes.patch(
  "/update/:id",
  [isAuthAdmin],
  upload.single("image"),
  updateNeighborhood
);
NeighborhoodRoutes.get("/:id", [isAuth], getByIdNeighborhood);
NeighborhoodRoutes.get("/", [isAuth], getAllNeighborhood);
NeighborhoodRoutes.patch("/add/:id", [isAuthAdmin], toggleUsers);
NeighborhoodRoutes.patch("/add/services/:id", [isAuth], toggleServices);
NeighborhoodRoutes.patch("/add/events/:id", [isAuth], toggleEvents);
NeighborhoodRoutes.patch("/add/statements/:id", [isAuth], toggleStatements);
NeighborhoodRoutes.patch("/add/city/:id", [isAuth], togglecityInNeighborhood);

module.exports = NeighborhoodRoutes;
