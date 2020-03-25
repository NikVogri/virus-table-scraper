const fs = require("fs");
const colors = require("colors");
const scraper = require("table-scraper");
const Data = require("./database");

// Website
const url = "https://www.worldometers.info/coronavirus/";

// Get data and update database
const updateDatabase = () => {
  scraper
    .get(url)
    .then(async res => {
      console.log("Fetch completed".yellow.inverse);
      const data = JSON.stringify(res)
        .replace(/Country,Other/g, "country")
        .replace(/Serious,Critical/g, "critical");
      const filtered = JSON.parse(data)[0];
      filtered.forEach(element => {
        delete element["Tot Cases/1M pop"];
        delete element["Tot Deaths/1M pop"];
      });
      // Prevent space use
      await Data.deleteMany();
      await Data.create(filtered);
      fs.writeFileSync("./scrapedWebsites.json", JSON.stringify(filtered));
      console.log("Write complete".green.inverse);
    })
    .catch(err => console.log(err.message.red.inverse));
};

// Scrape data from table & edit it
updateDatabase();
setInterval(updateDatabase, 60 * 1000);
