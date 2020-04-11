const fs = require("fs");
const colors = require("colors");
const scraper = require("table-scraper");
const Data = require("./database");
const app = require("express")();

// Fake a host to think this is an express app
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
  // Scrape data from table & edit it
  updateDatabase();
  // Run every minute
  setInterval(updateDatabase, 60 * 10000);
});
// Website
const url = "https://www.worldometers.info/coronavirus/";

// Get data and update database
const updateDatabase = () => {
  scraper
    .get(url)
    .then(async (res) => {
      console.log("Fetch completed".yellow.inverse);
      const data = JSON.stringify(res)
        .replace(/Country,Other/g, "country")
        .replace(/Serious,Critical/g, "critical");
      const realData = JSON.parse(data)[0];
      // Remove redundant information
      realData.forEach((element) => {
        delete element["Tot Cases/1M pop"];
        delete element["Tot Deaths/1M pop"];
        if (!element.country) {
          delete element;
        }
      });
      // Prevent space use
      await Data.deleteMany();
      await Data.create(realData);
      // fs.writeFileSync("./scrapedWebsites.json", JSON.stringify(realData));
      console.log("Write complete".green.inverse);
    })
    .catch((err) => console.log(err.message.red.inverse));
};
