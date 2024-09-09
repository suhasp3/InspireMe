import express from "express";
import bodyParser from "body-parser";
import path from "path";
import fetch from "node-fetch";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let workTime = 25 * 60;
let breakTime = 5 * 60;
let currentQuote = "";

const QUOTES_API = "https://zenquotes.io/api/random";

async function fetchQuote() {
  try {
    const response = await fetch(QUOTES_API);
    const data = await response.json();
    currentQuote = data[0].q + " — " + data[0].a;
  } catch (error) {
    console.log("Error fetching quote:", error);
    currentQuote = "Stay motivated!";
  }
}

app.get("/", async (req, res) => {
  await fetchQuote();
  res.render("index", {
    workTime: Math.floor(workTime / 60),
    breakTime: Math.floor(breakTime / 60),
    currentQuote,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
