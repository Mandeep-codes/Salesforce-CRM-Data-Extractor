console.log("Salesforce extractor running (FINAL FIX)");

/* -------------------- STORAGE -------------------- */

function getStorage(cb) {
  chrome.storage.local.get(["salesforce_data"], res => {
    cb(
      res.salesforce_data || {
        leads: [],
        contacts: [],
        accounts: [],
        opportunities: [],
        tasks: [],
        lastSync: {}
      }
    );
  });
}

function save(type, records) {
  if (!records || records.length === 0) {
    console.warn("Nothing to save for", type);
    return;
  }

  getStorage(data => {
    data[type] = records;
    data.lastSync[type] = Date.now();
    chrome.storage.local.set({ salesforce_data: data }, () => {
      console.log("Data saved:", type);
    });
  });
}

/* -------------------- OPPORTUNITY RECORD (BRUTE FORCE) -------------------- */

function extractOpportunityRecord() {
  const h1 = document.querySelector("h1");
  if (!h1) return null;

  const name = h1.innerText.trim();

  let amount = null;
  let stage = null;

  // scan all visible text nodes
  document.querySelectorAll("span, div").forEach(el => {
    const text = el.innerText?.trim();
    if (!text) return;

    if (!amount && text.startsWith("$")) {
      amount = text;
    }

    if (
      !stage &&
      [
        "Prospecting",
        "Qualification",
        "Needs Analysis",
        "Value Proposition",
        "Id. Decision Makers",
        "Perception Analysis",
        "Proposal",
        "Closed Won",
        "Closed Lost"
      ].includes(text)
    ) {
      stage = text;
    }
  });

  return {
    name,
    amount,
    stage,
    url: location.href
  };
}

/* -------------------- LIST VIEW -------------------- */

function extractList() {
  return [...document.querySelectorAll("table tbody tr")]
    .map(row => {
      const obj = {};
      [...row.children].forEach((td, i) => {
        obj[`col_${i}`] = td.innerText.trim();
      });
      return obj;
    })
    .filter(r => Object.values(r).some(Boolean));
}

/* -------------------- MAIN RUNNER -------------------- */

function runExtraction() {
  console.log("Running FINAL extraction");

  setTimeout(() => {
    const url = location.href;

    // 🔥 OPPORTUNITY RECORD (THIS IS YOUR DEMO)
    if (url.includes("/lightning/r/Opportunity/")) {
      const opp = extractOpportunityRecord();
      if (opp) {
        save("opportunities", [opp]);
        return;
      }
    }

    // 🔥 LIST VIEWS (backup)
    if (document.querySelector("table tbody tr")) {
      if (url.includes("Opportunity")) save("opportunities", extractList());
      if (url.includes("Account")) save("accounts", extractList());
      if (url.includes("Contact")) save("contacts", extractList());
      if (url.includes("Lead")) save("leads", extractList());
      if (url.includes("Task")) save("tasks", extractList());
      return;
    }

    console.warn("Nothing extractable on this page");
  }, 3000);
}

/* -------------------- EVENTS -------------------- */

runExtraction();

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === "EXTRACT_NOW") {
    console.log("Extract requested from popup");
    runExtraction();
  }
});






