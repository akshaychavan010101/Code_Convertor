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
    prompt = `Act as a software developer and Convert the following code to ${language}: \n\n${code}\n\nAdd relevant inline comments to explain the code and its functionality.`;
  } else if (mode === "debug") {
    prompt = `You are a software developer working on a codebase and you encounter a bug in the code that needs debugging. The code you are debugging is as follows:
    ---
    // Code to be debugged
    \n\n${code}
    // ...
    ---
    You need to identify and fix the bug in the code. Can you help me debug it?
    Debugging Steps:
    1. Read and understand the code to identify any potential issues.
    2. Look for any syntax errors, logical errors, or unexpected behavior.
    3. Use debugging techniques to narrow down the problem area.
    4. Make necessary changes to fix the bug and improve the code.
    
    Please provide step-by-step instructions on how to debug the code and resolve the errors. Clearly state the errors you identified and how you resolved them. Additionally, provide any refactoring suggestions to improve the code structure or performance.
    
    ---
    Summary of Resolved Errors:
    1. Error 1: [Description of the error]
       - Resolution: [Explanation of how the error was resolved]
    
    2. Error 2: [Description of the error]
       - Resolution: [Explanation of how the error was resolved]
    
    3. ...
    ---
    Note: Please make sure to provide detailed and clear instructions for debugging the code and resolving the errors.
    `;
  } else if (mode === "checkQuality") {
    prompt = `Please provide a code quality assessment for the given code:\n\n${code}\n. Consider the following parameters:
    1. Code Consistency: Evaluate the code for consistent coding style, naming conventions, and formatting.
    2. Code Performance: Assess the code for efficient algorithms, optimized data structures, and overall performance considerations.
    3. Code Documentation: Review the code for appropriate comments, inline documentation, and clear explanations of complex logic.
    4. Error Handling: Examine the code for proper error handling and graceful error recovery mechanisms.
    5. Code Testability: Evaluate the code for ease of unit testing, mocking, and overall testability.
    6. Code Modularity: Assess the code for modular design, separation of concerns, and reusability of components.
    7. Code Complexity: Analyze the code for excessive complexity, convoluted logic, and potential code smells.
    8. Code Duplication: Identify any code duplication and assess its impact on maintainability and readability.
    9. Code Readability: Evaluate the code for readability, clarity, and adherence to coding best practices.
    
    Please provide a summary of the code quality assessment and a report showing the percentage-wise evaluation for each parameter mentioned above.
    `;
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
