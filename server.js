const path = require("path");
const express = require("express");
const cors = require("cors");
const { PRESET_SPECS, generateSuiteAndMocks } = require("./lib/generator");

const app = express();
const PORT = process.env.PORT || 4014;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    experiment: 14,
    student: "Ashwarya Agrawal (23BCON1659)",
  });
});

app.get("/api/presets", (req, res) => {
  res.json({ presets: PRESET_SPECS });
});

app.post("/api/generate-tests", (req, res) => {
  const body = req.body || {};
  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  if (!endpoint) {
    return res.status(400).json({ error: "Validation Error", message: "Endpoint path is required." });
  }
  const result = generateSuiteAndMocks({
    endpoint,
    method: body.method,
    baseUrl: body.baseUrl,
    fields: body.fields,
    count: body.count,
  });
  return res.status(200).json(result);
});

app.listen(PORT, () => {
  console.log(`Exp 14 AI Test & Mock Generator running at http://localhost:${PORT}`);
});
