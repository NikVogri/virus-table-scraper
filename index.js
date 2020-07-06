const colors = require("colors");
const scraper = require("table-scraper");
const app = require("express")();
const cors = require("cors");
const dbConnection = require("./database");

app.use(cors());

app.get("/", (req, res, next) => {
  updateDatabase();
  res.status(200).json({ success: true });
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

const updateDatabase = () => {
  scraper
    .get(url)
    .then(async (res) => {
      console.log("Starting scrape".yellow.inverse);
      const data = cleanData(res);

      const countryData = data.countryData.map((country) => getData(country));
      const continentData = data.continentData.map((continent) =>
        getData(continent)
      );
      // Get array inside array from object for mysql insertion
      const countryDataArray = countryData.map((countryObj) => {
        return Object.values(countryObj);
      });

      const continentDataArray = continentData.map((continentObj) => {
        return Object.values(continentObj);
      });

      // Update database
      dbConnection.connect();

      // delete data from the same day
      dbConnection.query(
        "DELETE FROM countries WHERE DATE(created_at) = CURDATE() OR DATE(created_at) = CURDATE() - INTERVAL 1 WEEK",
        (err, res) => {
          if (err) throw err;
          console.log("Deleted country data for current day".yellow.inverse);
        }
      );

      dbConnection.query(
        "DELETE FROM continents WHERE DATE(created_at) = CURDATE() OR DATE(created_at) = CURDATE() - INTERVAL 1 WEEK",
        (err, res) => {
          if (err) throw err;
          console.log("Deleted continent data for current day".yellow.inverse);
        }
      );

      const continentQuery = `INSERT INTO continents (
      continent,
      country,
      totalCases,
      newCases,
      totalDeaths,
      newDeaths,
      activeCases,
      casePerPop) VALUES ?`;

      const countryQuery = `INSERT INTO countries (
      continent,
      country,
      totalCases,
      newCases,
      totalDeaths,
      newDeaths,
      activeCases,
      casePerPop) VALUES ?`;

      dbConnection.query(continentQuery, [continentDataArray], (err, res) => {
        if (err) throw err;
        console.log("Write to continents complete".green.inverse);
      });

      dbConnection.query(countryQuery, [countryDataArray], (err, res) => {
        if (err) throw err;
        console.log("Write to countries complete".green.inverse);
      });

      dbConnection.end();
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
  deleteIndex.forEach((i) => {
    filthyData.slice(0, i).concat(filthyData.slice(-i));
  });

  // clean data
  const cleanData = filthyData.filter(
    (el) => el.country !== "Total:" && el.country !== ""
  );

  // remove continent data from country array
  const continents = [
    "Europe",
    "Africa",
    "North America",
    "Asia",
    "South America",
    "Oceania",
    "World",
  ];

  const countryData = cleanData.filter(
    (el) => !continents.includes(el.country)
  );

  const continentData = cleanData.filter((el) =>
    continents.includes(el.country)
  );

  return { countryData, continentData };
};

const cleanInt = (num) => {
  if (num && num !== "N/A") {
    const cleanStringNum = num.replace("+", "");
    return parseInt(cleanStringNum.split(",").join(""));
  } else return 0;
};

const getData = (data) => {
  return {
    continent: data.Continent || "/",
    country: data.country,
    totalCases: cleanInt(data.TotalCases),
    newCases: cleanInt(data.NewCases),
    totalDeaths: cleanInt(data.TotalDeaths),
    newDeaths: cleanInt(data.NewDeaths),
    activeCases: cleanInt(data.ActiveCases),
    casePerPop: cleanInt(data["1 Caseevery X ppl"]),
  };
};
