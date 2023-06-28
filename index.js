const express = require("express");
const Configuration = require("openai").Configuration;
const OpenAIApi = require("openai").OpenAIApi;
require("dotenv").config();
const path = require("path");
const cors = require("cors");

const app = express();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function generatePrompt(code, language, mode) {
  let prompt = "";
  if (mode === "convert") {
    prompt = `Act as a software developer and Convert the following code to ${language}: \n\n${code}`;
  } else if (mode === "debug") {
    prompt = `Act as a software developer and debug the following code: \n\n${code}\nProvide correct code and also provide the errors in the form of bullet points.`;
  } else if (mode === "checkQuality") {
    prompt = `Act as a software developer and check the quality of the following code: \n\n${code}\nProvide the time complexity, space comlexity, understandability, clearity and also provide the errors all these statistics should have good explaination and also have some percentages for the above domains to get more comprehensions.`;
  }
  return prompt;
}

async function convertCode(code, language) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: generatePrompt(code, language, "convert"),
    temperature: 0.9,
    max_tokens: 200,
  });
  const result = completion.data.choices[0].text;
  return result;
}

async function debugCode(code, language) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: generatePrompt(code, language, "debug"),
    temperature: 0.9,
    max_tokens: 200,
  });
  const result = completion.data.choices[0].text;
  return result;
}

async function checkCodeQuality(code, language) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: generatePrompt(code, language, "checkQuality"),
    temperature: 0.9,
    max_tokens: 200,
  });
  const result = completion.data.choices[0].text;
  return result;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.post("/convert", async (req, res) => {
  const { code, language } = req.body;
  try {
    const convertedCode = await convertCode(code, language);
    res.status(200).send({ convertedCode, ok: true });
  } catch (error) {
    res.status(500).send({ error: error.message, ok: false });
  }
});

app.post("/debug", async (req, res) => {
  const { code } = req.body;
  try {
    const debugResult = await debugCode(code);
    res.status(200).send({ debugResult, ok: true });
  } catch (error) {
    res.status(500).send({ error: error.message, ok: false });
  }
});

app.post("/check-quality", async (req, res) => {
  const { code } = req.body;
  try {
    const qualityResult = await checkCodeQuality(code);
    res.status(200).send({ qualityResult, ok: true });
  } catch (error) {
    res.status(500).send({ error: error.message, ok: false });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
