const specForm = document.getElementById("specForm");
const baseUrlInput = document.getElementById("baseUrlInput");
const methodSelect = document.getElementById("methodSelect");
const countInput = document.getElementById("countInput");
const endpointInput = document.getElementById("endpointInput");
const fieldsInput = document.getElementById("fieldsInput");
const epErr = document.getElementById("epErr");

const testCodeOut = document.getElementById("testCodeOut");
const mockJsonOut = document.getElementById("mockJsonOut");
const fixtureCount = document.getElementById("fixtureCount");

let presetSpecs = {};

async function generateAll() {
  epErr.textContent = "";
  const endpoint = endpointInput.value.trim();
  if (!endpoint) {
    epErr.textContent = "Endpoint path is required.";
    return;
  }

  const res = await fetch("/api/generate-tests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      baseUrl: baseUrlInput.value.trim(),
      method: methodSelect.value,
      endpoint,
      fields: fieldsInput.value,
      count: Number(countInput.value),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    epErr.textContent = data.message || "Generation failed.";
    return;
  }

  testCodeOut.textContent = data.testCode;
  mockJsonOut.textContent = JSON.stringify(data.mockFixtures, null, 2);
  fixtureCount.textContent = String((data.mockFixtures || []).length);
}

async function boot() {
  const res = await fetch("/api/presets");
  const data = await res.json();
  presetSpecs = data.presets || {};
  await generateAll();
}

document.querySelectorAll("[data-spec]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const spec = presetSpecs[btn.dataset.spec];
    if (!spec) return;
    baseUrlInput.value = spec.baseUrl;
    methodSelect.value = spec.method;
    endpointInput.value = spec.endpoint;
    fieldsInput.value = spec.fields.join(", ");
    countInput.value = String(spec.count);
    await generateAll();
  });
});

specForm.addEventListener("submit", (e) => {
  e.preventDefault();
  generateAll();
});

document.getElementById("copyTestBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(testCodeOut.textContent || "");
  document.getElementById("copyTestStatus").textContent = "Copied node:test suite to clipboard (23BCON1659).";
});

document.getElementById("copyJsonBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(mockJsonOut.textContent || "");
  document.getElementById("copyJsonStatus").textContent = "Copied JSON fixtures to clipboard (23BCON1659).";
});

boot();
