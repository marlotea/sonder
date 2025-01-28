const OpenAI = require("openai");
const express = require("express");
const app = express();
const cors = require("cors");

const PORT = 4000;

const depthPrompts = [
  // Level 0 - Lighter Questions
  [
    "What's your go-to comfort food and why does it bring you comfort?",
    "If you could master any skill overnight, what would it be?",
    "What's your favorite childhood memory that still makes you smile?",
    "Which season makes you feel most alive and why?",
    "What's the best piece of advice you've ever received from a stranger?",
    "If you could have dinner with any fictional character, who would it be?",
    "What's a small act of kindness that someone did for you that you'll never forget?",
    "What hobby would you pursue if time and money weren't factors?",
    "What's your favorite way to spend a rainy day?",
    "Which song instantly changes your mood when you hear it?",
  ],

  // Level 1 - Getting Warmer
  [
    "What's a belief you held strongly in your youth that has changed completely?",
    "When was the last time you felt truly proud of yourself?",
    "What's something you're curious about but afraid to explore?",
    "Which part of your personality did you inherit from your parents?",
    "What's a compliment you received that changed how you saw yourself?",
    "When do you feel most like your authentic self?",
    "What's a dream you've given up on, and do you regret it?",
    "What's the hardest lesson life has taught you so far?",
    "What's something you wish you could tell your younger self?",
    "Which relationship in your life has shaped you the most?",
  ],

  // Level 2 - Diving Deeper
  [
    "What's the biggest compromise you've made in the name of love?",
    "When was the last time you felt completely alone?",
    "What's a truth about yourself that you're still learning to accept?",
    "What's the most significant sacrifice your parents made for you?",
    "Which memory do you wish you could relive one more time?",
    "What's something you're still carrying guilt about?",
    "When did you last feel truly seen by someone?",
    "What's a fear that's holding you back from living fully?",
    "What's the most painful goodbye you've ever said?",
    "Which version of yourself do you miss the most?",
  ],

  // Level 3 - Going Further
  [
    "What's a secret you've never told anyone because you're ashamed?",
    "When have you felt most disconnected from your own identity?",
    "What's the biggest regret that keeps you up at night?",
    "What's a relationship you wish you could mend?",
    "Which life-changing moment still haunts you?",
    "What's something you're afraid to admit to yourself?",
    "When did you realize you weren't the person you thought you were?",
    "What's a dream you've achieved that left you feeling empty?",
    "Which loss has shaped your perspective on life the most?",
    "What's a truth about love that took you too long to learn?",
  ],

  // Level 4 - Even Deeper
  [
    "What's the darkest thought you've ever had about yourself?",
    "When have you felt most betrayed by your own actions?",
    "What's a core belief that was shattered by experience?",
    "Which relationship made you question everything you knew about love?",
    "What's the most significant way you've failed someone you love?",
    "When did you realize your parents were human and flawed?",
    "What's a decision you made that changed someone else's life forever?",
    "Which part of your identity feels like a lie sometimes?",
    "What's a truth about yourself that terrifies you?",
    "When have you felt most morally compromised?",
  ],

  // Level 5 - The Deep End
  [
    "What's the most profound loss you've experienced?",
    "When have you questioned your entire purpose in life?",
    "What's a moment that broke you and rebuilt you?",
    "Which betrayal changed how you trust people?",
    "What's something you've never forgiven yourself for?",
    "When did you realize you were capable of causing deep hurt?",
    "What's a choice you made that you can never take back?",
    "Which belief about yourself was completely destroyed?",
    "What's the hardest truth you've had to accept about life?",
    "When did you feel most disconnected from your humanity?",
  ],

  // Level 6 - Rock Bottom
  [
    "What's the deepest pain you've ever caused another person?",
    "When have you felt completely lost in your own existence?",
    "What's a secret that would change how people see you forever?",
    "Which moment made you question everything you believed in?",
    "What's the most significant way you've compromised your values?",
    "When did you realize you weren't the hero of your own story?",
    "What's a truth about yourself that you're terrified to confront?",
    "Which relationship revealed the darkest parts of yourself?",
    "What's the most profound way you've changed after trauma?",
    "When have you felt completely alienated from yourself?",
  ],

  // Level 7 - The Abyss
  [
    "What's the most fundamental way you've betrayed yourself?",
    "When have you questioned your right to exist?",
    "What's a truth about life that's almost unbearable to accept?",
    "Which experience made you lose faith in humanity?",
    "What's the deepest emotional wound you carry?",
    "When did you realize you were capable of true darkness?",
    "What's a choice you made that haunts you to this day?",
    "Which part of yourself did you have to kill to survive?",
    "What's the most profound way you've been broken?",
    "When did you hit your absolute rock bottom?",
  ],
];

const getRandomJourney = () => {
  return depthPrompts.map((level) => {
    const randomIndex = Math.floor(Math.random() * level.length);
    return level[randomIndex];
  });
};

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Middleware for parsing JSON - this needs to be before your routes
app.use(express.json());

// OpenAI setup
require("dotenv").config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function checkModeration(input) {
  try {
    const moderation = await openai.moderations.create({
      input: input,
    });
    return moderation;
  } catch (error) {
    console.error("Error occurred during moderation:", error);
    throw error;
  }
}

// Database setup
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create table route
app.get("/create-table", (req, res) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story TEXT NOT NULL,
      date DATE DEFAULT CURRENT_DATE
    );
  `;
  db.run(createTableQuery, (err) => {
    if (err) {
      res.status(500).send("Error creating table");
    } else {
      res.send("Table created successfully");
    }
  });
});

// POST route for stories
app.post("/api/stories", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Check moderation
    const modOutput = await checkModeration(content);
    const isFlagged = modOutput.results[0].flagged;

    if (isFlagged) {
      return res
        .status(400)
        .json({ error: "Content flagged as inappropriate" });
    }

    // Insert into database
    const insertQuery = "INSERT INTO stories (story) VALUES (?)";
    db.run(insertQuery, [content], function (err) {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ error: "Error adding story to database" });
      }
      res.status(201).json({
        message: "Story added successfully",
        id: this.lastID,
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET route for stories
app.get("/api/stories", (req, res) => {
  const selectQuery = "SELECT * FROM stories ORDER BY date DESC";
  db.all(selectQuery, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Error fetching stories" });
    } else {
      res.json(rows);
    }
  });
});

// Sample prompts route
app.get("/api/prompts", (req, res) => {
  res.json({
    prompts: getRandomJourney(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
