const { mongoose } = require("mongoose");

const NeighborhoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
    unique: true,
  },
  city: [{ type: mongoose.Schema.ObjectId, ref: "City" }],
  users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  services: [{ type: mongoose.Schema.ObjectId, ref: "Service" }],
  events: [{ type: mongoose.Schema.ObjectId, ref: "Event" }],
  statements: [{ type: mongoose.Schema.ObjectId, ref: "Statement" }],
});

const Neighborhood = mongoose.model("Neighborhood", NeighborhoodSchema);
module.exports = Neighborhood;
