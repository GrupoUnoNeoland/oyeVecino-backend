const StatementRoutes = require("express").Router();

const { isAuth } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");

const {
  createStatement,
  deleteStatement,
  getAllStatement,
  getByIdStatement,
  toggleUser,
  toggleNeighborhood,
  updateStatement,
  getAllStatementLike,
  toggleCity,
  toggleLike,
} = require("../controllers/Statement.controller");

StatementRoutes.get("/getalllike", [isAuth], getAllStatementLike);
StatementRoutes.patch("/add/likes/:id", [isAuth], toggleLike);
StatementRoutes.patch("/add/neighborhoods/:id", [isAuth], toggleNeighborhood);
StatementRoutes.patch("/add/city/:id", [isAuth], toggleCity);
StatementRoutes.patch("/add/:id", [isAuth], toggleUser);
StatementRoutes.get("/", [isAuth], getAllStatement);
StatementRoutes.delete("/delete/:id", [isAuth], deleteStatement);
StatementRoutes.get("/:id", [isAuth], getByIdStatement);
StatementRoutes.post(
  "/create",
  [isAuth],
  upload.any("images"),
  createStatement
);
StatementRoutes.patch(
  "/update/statement/:id",
  [isAuth],
  upload.any("images"),
  updateStatement
);

module.exports = StatementRoutes;
