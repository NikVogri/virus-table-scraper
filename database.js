const mongoose = require("mongoose");

// Database
const dbUri =
  "mongodb+srv://Admin:escape123@cluster0-r1o03.mongodb.net/statistics?retryWrites=true&w=majority";
mongoose.connect(dbUri);

// Model
const dataSchema = new mongoose.Schema({
  country: {
    required: false,
    type: String,
  },
  TotalCases: {
    required: true,
    type: String,
  },
  NewCases: {
    required: false,
    type: String,
  },
  TotalDeaths: {
    required: false,
    type: String,
  },
  NewDeaths: {
    required: false,
    type: String,
  },
  TotalRecovered: {
    required: false,
    type: String,
  },
  ActiveCases: {
    required: true,
    type: String,
  },
  critical: {
    required: false,
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Data", dataSchema);
