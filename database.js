const mongoose = require("mongoose");

// Database
const dbUri =
  "mongodb+srv://Admin:escape123@cluster0-r1o03.mongodb.net/statistics?retryWrites=true&w=majority";
mongoose.connect(dbUri);

// Model
const countrySchema = new mongoose.Schema({
  country: {
    required: true,
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
  Continent: {
    required: false,
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const continentSchema = new mongoose.Schema({
  country: {
    required: true,
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
  Continent: {
    required: false,
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = {
  Country: mongoose.model("Country", countrySchema),
  Continent: mongoose.model("Continent", continentSchema),
};
