const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    neighborhoods: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" },
    ],
  },
  {
    timestamps: true,
  }
);

const City = mongoose.model("City", CitySchema);

module.exports = City;
