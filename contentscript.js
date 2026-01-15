console.log("Salesforce extractor running");

function getObjectType() {
  const url = location.href;
  if (url.includes("/Opportunity")) return "opportunities";
  if (url.includes("/Lead")) return "leads";
  if (url.includes("/Account")) return "accounts";
  if (url.includes("/Contact")) return "contacts";
  if (url.includes("/Task")) return "tasks";
  return null;
}

function getPageType() {
  if (document.querySelector("records-record-layout")) return "record";
  if (document.querySelector("lightning-kanban")) return "kanban";
  if (document.querySelector("records-related-list")) return "related";
  if (document.querySelector("lightning-datatable")) return "list";
  return "unknown";
}

function extractRecord() {
  const data = {};
  const title = document.querySelector("h1");
  data.name = title ? title.innerText.trim() : null;

  document.querySelectorAll("records-record-layout-item").forEach(item => {
    const label = item.querySelector("span[title]");
    const value = item.querySelector("lightning-formatted-text, a");
    if (label && value) {
      data[label.innerText.trim()] = value.innerText.trim();
    }
  });

  return data;
}

function extractList() {
  return [...document.querySelectorAll("lightning-datatable tbody tr")].map(row => {
    const obj = {};
    row.querySelectorAll("td").forEach((td, i) => {
      obj[`col_${i}`] = td.innerText.trim();
    });
    return obj;
  });
}

function extractKanban() {
  return [...document.querySelectorAll("lightning-kanban-card")].map(card => ({
    name: card.innerText.trim(),
    stage: card.closest("lightning-kanban-column")
      ?.getAttribute("data-stage")
  }));
}

function saveData(type, records) {
  chrome.storage.local.get(["salesforce_data"], res => {
    const data = res.salesforce_data;
    data[type] = records;
    data.lastSync[type] = Date.now();
    chrome.storage.local.set({ salesforce_data: data });
    console.log("Data saved:", type);
  });
}

function runExtraction() {
  const type = getObjectType();
  const page = getPageType();
  if (!type) return;

  setTimeout(() => {
    if (page === "record") {
      saveData(type, [extractRecord()]);
    }
    if (page === "list" || page === "related") {
      saveData(type, extractList());
    }
    if (page === "kanban") {
      saveData("opportunities", extractKanban());
    }
  }, 2500);
}

runExtraction();

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === "EXTRACT_NOW") runExtraction();
});




