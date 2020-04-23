const fs = require("fs");
const colors = require("colors");
const scraper = require("table-scraper");
const Schema = require("./database");
const app = require("express")();
const cors = require("cors");
// Fake a host to think this is an express app

app.use(cors());

app.use('*', (req, res, next){
    res.status(200);
    next();
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
  // Scrape data from table & edit it
  updateDatabase();
  // Run every 10 minutes
  setInterval(updateDatabase, 60 * 10000);
});
// Website
const url = "https://www.worldometers.info/coronavirus/";

// Get data and update database
const updateDatabase = () => {
  scraper
    .get(url)
    .then(async (res) => {
      console.log("Starting scrape".yellow.inverse);
      const data = cleanData(res);

      // Delete previous data
      await Schema.Country.deleteMany();
      await Schema.Continent.deleteMany();
      // Update database with updated data

      await Schema.Country.create(data.countryData);
      await Schema.Continent.create(data.continentData);
      console.log("Write complete".green.inverse);
    })
    .catch((err) => console.log(err.message.red.inverse));
};

const cleanData = (res) => {
  const data = JSON.stringify(res)
    .replace(/Country,Other/g, "country")
    .replace(/Serious,Critical/g, "critical");

  const deleteIndex = [];
  const filthyData = JSON.parse(data)[0];
  filthyData.forEach((element, index) => {
    // remove reduntant info
    delete element["Tot Cases/1M pop"];
    delete element["Tot Deaths/1M pop"];
    delete element["Tests/\n1M pop"];
    delete element["Deaths/1M pop"];

    // remove redundant objects
    if (element.country === "Total:") {
      deleteIndex.push(index);
    }
  });
  // remove objects that do not contain useful data
  deleteIndex.forEach((i) =>
    filthyData.slice(0, i).concat(filthyData.slice(-i))
  );

  // clean data
  const cleanData = filthyData.filter(
    (el) => el.country !== "Total:" && el.country !== ""
  );
  // fs.writeFileSync("./scrapedWebsites.json", JSON.stringify(cleanData));

  // get continent data;
  const continents = [
    "Europe",
    "Africa",
    "North America",
    "Asia",
    "South America",
    "Oceania",
    "World",
  ];

  const continentData = cleanData.filter((el) =>
    continents.includes(el.country)
  );
  const countryData = cleanData.filter(
    (el) => !continents.includes(el.country)
  );
  return { countryData, continentData };
};
