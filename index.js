import express from "express";
import bodyParser from "body-parser";
import path from "path";
import fetch from "node-fetch";

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Variables for Pomodoro timer
let workTime = 25 * 60; // 25 minutes in seconds
let breakTime = 5 * 60; // 5 minutes in seconds
let currentQuote = "";

// API Key for a quote service (replace with your key)
const QUOTES_API = "https://zenquotes.io/api/random";

// Fetch a quote from the API
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

// Homepage route to display Pomodoro timer and quote
app.get("/", async (req, res) => {
  await fetchQuote();
  res.render("index", {
    workTime: Math.floor(workTime / 60), // Send work time in minutes
    breakTime: Math.floor(breakTime / 60), // Send break time in minutes
    currentQuote,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
