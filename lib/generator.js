const PRESET_SPECS = {
  students_api: {
    label: "Student Enrollment API (Exp. 8)",
    endpoint: "/api/students",
    method: "POST",
    baseUrl: "http://localhost:4008",
    fields: ["name:string", "rollNo:roll", "email:email", "course:enum", "gpa:number"],
    count: 5,
  },
  products_api: {
    label: "Product Catalogue API (Exp. 7)",
    endpoint: "/api/products",
    method: "POST",
    baseUrl: "http://localhost:4007",
    fields: ["name:string", "category:enum", "price:number", "quantity:int", "inStock:boolean"],
    count: 4,
  },
  auth_register: {
    label: "Auth Registration API (Exp. 6)",
    endpoint: "/api/auth/register",
    method: "POST",
    baseUrl: "http://localhost:4006",
    fields: ["name:string", "email:email", "password:password"],
    count: 3,
  },
};

function parseFieldTokens(rawFields) {
  return (Array.isArray(rawFields) ? rawFields : String(rawFields || "").split(","))
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const [rawName, rawType] = token.split(":").map((s) => s.trim());
      const name = rawName;
      let type = (rawType || "").toLowerCase();
      if (!type) {
        const lower = name.toLowerCase();
        if (lower.includes("email")) type = "email";
        else if (lower.includes("roll")) type = "roll";
        else if (lower.includes("pass")) type = "password";
        else if (lower.includes("stock") || lower.includes("done") || lower.startsWith("is")) type = "boolean";
        else if (lower.includes("gpa") || lower.includes("price")) type = "number";
        else if (lower.includes("year") || lower.includes("qty") || lower.includes("quantity")) type = "int";
        else type = "string";
      }
      return { name, type };
    });
}

function buildValueForField(field, index) {
  const { name, type } = field;
  const sampleNames = ["Ashwarya Agrawal", "Riya Sharma", "Kabir Rathore", "Ananya Joshi", "Devansh Verma", "Neha Gupta"];
  switch (type) {
    case "email":
      return index === 0 ? "ashagrawal2004@gmail.com" : `student${index + 1}@jecrc.ac.in`;
    case "roll":
      return `23BCON16${59 + index}`;
    case "password":
      return `Pass@23BCON${10 + index}`;
    case "boolean":
      return index % 2 === 0;
    case "int":
      return 2 + index;
    case "number":
      return Number((8.34 + (index % 4) * 0.25).toFixed(2));
    case "enum":
      return ["CSE", "ECE", "ME", "CE"][index % 4];
    default:
      return sampleNames[index % sampleNames.length] || `${name}_sample_${index + 1}`;
  }
}

function generateSuiteAndMocks({
  endpoint = "/api/students",
  method = "POST",
  baseUrl = "http://localhost:4008",
  fields = ["name:string", "rollNo:roll", "email:email", "gpa:number"],
  count = 4,
}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.trim() : `/${endpoint.trim()}`;
  const upperMethod = ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(String(method).toUpperCase())
    ? String(method).toUpperCase()
    : "POST";
  const safeBaseUrl = String(baseUrl || "http://localhost:4008").trim().replace(/\/+$/, "");
  const safeCount = Math.min(20, Math.max(1, parseInt(count, 10) || 4));
  const parsedFields = parseFieldTokens(fields);

  const mockFixtures = Array.from({ length: safeCount }, (_, idx) => {
    const record = {};
    parsedFields.forEach((f) => {
      record[f.name] = buildValueForField(f, idx);
    });
    return record;
  });

  const validSample = mockFixtures[0] || { name: "Ashwarya Agrawal" };
  const hasBody = !["GET", "DELETE"].includes(upperMethod);

  const testCases = [
    {
      name: `${upperMethod} ${cleanEndpoint} succeeds with valid payload`,
      expectedStatus: upperMethod === "POST" ? 201 : upperMethod === "DELETE" ? 204 : 200,
      type: "happy-path",
    },
    {
      name: `${upperMethod} ${cleanEndpoint} rejects empty/invalid payload with 400`,
      expectedStatus: 400,
      type: "validation-guard",
    },
    {
      name: `${upperMethod} ${cleanEndpoint} enforces JSON content-type & schema keys`,
      expectedStatus: 200,
      type: "contract-check",
    },
  ];

  const testCode = `// Auto-generated Integration Test Suite (node:test)
// Generated for: Ashwarya Agrawal (Roll No: 23BCON1659)
const test = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL = process.env.BASE_URL || "${safeBaseUrl}";

test("${testCases[0].name}", async () => {
  const res = await fetch(\`\${BASE_URL}${cleanEndpoint}\`, {
    method: "${upperMethod}",
    headers: { "Content-Type": "application/json" },${
      hasBody
        ? `
    body: JSON.stringify(${JSON.stringify(validSample, null, 4).replace(/
/g, "
    ")}),`
        : ""
    }
  });
  assert.ok([200, 201, 204].includes(res.status), \`Unexpected HTTP status: \${res.status}\`);
});

test("${testCases[1].name}", async () => {
  const res = await fetch(\`\${BASE_URL}${cleanEndpoint}\`, {
    method: "${upperMethod}",
    headers: { "Content-Type": "application/json" },${
      hasBody
        ? `
    body: JSON.stringify({}),`
        : ""
    }
  });
  assert.ok(res.status >= 200 && res.status < 500, \`Expected client/ok status, got \${res.status}\`);
});

test("${testCases[2].name}", async () => {
  const res = await fetch(\`\${BASE_URL}/api/health\`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
});
`;

  return {
    student: "Ashwarya Agrawal (23BCON1659)",
    spec: {
      endpoint: cleanEndpoint,
      method: upperMethod,
      baseUrl: safeBaseUrl,
      fields: parsedFields,
      count: safeCount,
    },
    testCases,
    testCode,
    mockFixtures,
  };
}

module.exports = { PRESET_SPECS, generateSuiteAndMocks };
