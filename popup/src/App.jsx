import { useEffect, useState } from "react";

const TABS = [
  { key: "leads", label: "Leads" },
  { key: "contacts", label: "Contacts" },
  { key: "accounts", label: "Accounts" },
  { key: "opportunities", label: "Opportunities" },
  { key: "tasks", label: "Tasks" }
];

export default function App() {
  const [store, setStore] = useState(null);
  const [tab, setTab] = useState("opportunities");
  const [search, setSearch] = useState("");

  useEffect(() => {
    chrome.storage.local.get(["salesforce_data"], res => {
      setStore(res.salesforce_data || null);
    });

    const listener = (changes, area) => {
      if (area === "local" && changes.salesforce_data) {
        setStore(changes.salesforce_data.newValue);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  if (!store) {
    return <div style={styles.container}>Loading...</div>;
  }

  // extract current tab data
  const rawList = store[tab] || [];

  // search
  const list = rawList.filter(item =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  function extractNow() {
    chrome.tabs.query({ active: true, currentWindow: true }, ([t]) => {
      chrome.tabs.sendMessage(t.id, { type: "EXTRACT_NOW" });
    });
  }

  function deleteItem(index) {
    const updated = [...rawList];
    updated.splice(index, 1);

    chrome.storage.local.set({
      salesforce_data: {
        ...store,
        [tab]: updated
      }
    });
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(store, null, 2)], {
      type: "application/json"
    });
    chrome.downloads.download({
      url: URL.createObjectURL(blob),
      filename: "salesforce-data.json"
    });
  }

  // group opportunities by stage
  const groupedOpportunities =
    tab === "opportunities"
      ? list.reduce((acc, op) => {
          const stage = op.stage || "Unknown";
          acc[stage] = acc[stage] || [];
          acc[stage].push(op);
          return acc;
        }, {})
      : null;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Salesforce Extractor</h2>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...styles.tab,
              background: tab === t.key ? "#2563eb" : "#e5e7eb",
              color: tab === t.key ? "#fff" : "#000"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <input
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.search}
      />

      <div style={styles.actions}>
        <button onClick={extractNow}>Extract Current Object</button>
        <button onClick={exportJSON}>Export JSON</button>
      </div>

      <p style={styles.sync}>
        Last Sync:{" "}
        {store.lastSync?.[tab]
          ? new Date(store.lastSync[tab]).toLocaleString()
          : "Never"}
      </p>

      {/* DATA */}
      <div style={styles.list}>
        {tab === "opportunities" ? (
          Object.entries(groupedOpportunities).map(([stage, items]) => (
            <div key={stage}>
              <h4>{stage}</h4>
              {items.map((item, i) => (
                <div key={i} style={styles.card}>
                  <pre>{JSON.stringify(item, null, 2)}</pre>
                  <button onClick={() => deleteItem(i)}>Delete</button>
                </div>
              ))}
            </div>
          ))
        ) : (
          list.map((item, i) => (
            <div key={i} style={styles.card}>
              <pre>{JSON.stringify(item, null, 2)}</pre>
              <button onClick={() => deleteItem(i)}>Delete</button>
            </div>
          ))
        )}

        {list.length === 0 && (
          <p style={{ opacity: 0.6 }}>No data for this tab</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    width: 380,
    padding: 12,
    fontFamily: "system-ui, sans-serif"
  },
  header: {
    marginBottom: 10
  },
  tabs: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap"
  },
  tab: {
    padding: "4px 8px",
    border: "none",
    borderRadius: 4,
    cursor: "pointer"
  },
  search: {
    width: "100%",
    marginTop: 8,
    padding: 6
  },
  actions: {
    display: "flex",
    gap: 6,
    marginTop: 8
  },
  sync: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 6
  },
  list: {
    marginTop: 10
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
    background: "#f9fafb"
  }
};



