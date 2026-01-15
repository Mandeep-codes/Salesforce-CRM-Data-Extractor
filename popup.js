const listDiv = document.getElementById("list");

chrome.storage.local.get(["salesforce_data"], res => {
  const data = res.salesforce_data;

  if (!data || !data.opportunities || data.opportunities.length === 0) {
    listDiv.innerText = "No data yet. Go to Salesforce and refresh.";
    return;
  }

  listDiv.innerHTML = "";

  data.opportunities.forEach(op => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerText = JSON.stringify(op);
    listDiv.appendChild(div);
  });
});
