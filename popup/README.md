# Salesforce CRM Data Extractor

A Chrome Extension (Manifest V3) that extracts Salesforce CRM data from Salesforce Lightning Experience using DOM scraping (no Salesforce APIs) and displays the data in a React-based popup dashboard.

The extension is designed to handle Salesforce Lightning’s dynamic DOM, multiple page contexts (list, record, related list, Kanban), pagination, and real-time synchronization.

---

## Features

### Core Extraction
- Extracts CRM data directly from Salesforce Lightning UI
- Supports:
  - List Views
  - Record Detail Pages
  - Related Lists (e.g., Contacts under an Account)
  - Kanban / Pipeline View (Opportunities)
- Automatic object detection:
  - Leads
  - Contacts
  - Accounts
  - Opportunities
  - Tasks
- Data persistence using chrome.storage.local

### Popup Dashboard (React)
- Tabs for Leads, Contacts, Accounts, Opportunities, Tasks
- Opportunities grouped by stage
- Search and filter across all extracted data
- Delete individual records
- Extract Current Object button
- Displays last sync timestamp per object type

### Bonus Features
- Real-time sync across tabs using chrome.storage.onChanged
- Export extracted data as JSON
- Automatic pagination handling via DOM interaction
- Kanban (Pipeline Inspection) extraction
- Related records extraction

---

## Tech Stack
- Chrome Extension (Manifest V3)
- Content Script: Vanilla JavaScript
- Background: Service Worker
- Popup UI: React + Vite
- Storage: chrome.storage.local

---

## Installation Steps

1. Clone the repository  
   git clone <repository-url>  
   cd salesforce-crm-extractor

2. Install popup dependencies  
   cd popup  
   npm install

3. Build the React popup  
   npm run build  

   This generates a dist directory in the project root, required for the Chrome extension popup.

4. Load the extension in Chrome  
   - Open chrome://extensions  
   - Enable Developer Mode  
   - Click Load unpacked  
   - Select the project root folder  

5. Use the extension  
   - Open Salesforce Lightning (Leads, Accounts, Opportunities, etc.)  
   - Refresh the page  
   - Click the extension icon to view extracted data  

---

## DOM Selection Strategy

Salesforce Lightning is built using dynamic Web Components, which makes traditional CSS class selectors unreliable. This extension uses structure-based DOM detection instead of fragile class names.

### Page Type Detection
- Record Detail Page: detected using records-record-layout
- List Views / Related Lists: detected using lightning-datatable
- Kanban (Pipeline) View: detected using lightning-kanban

### Extraction Approach
- Record Pages:
  - Traverse records-record-layout-item
  - Extract visible label/value pairs
- List Views / Related Lists:
  - Extract row data from lightning-datatable
- Kanban View:
  - Extract cards from lightning-kanban-card
  - Group opportunities by stage
- Related Records:
  - Scoped extraction within related list containers (e.g., Contacts under Account)

This approach avoids dependency on Salesforce’s frequently changing class names and works reliably across orgs and Salesforce updates.

---

## Storage Schema

All extracted data is stored under a single key in chrome.storage.local.

salesforce_data = {
  leads: [],
  contacts: [],
  accounts: [],
  opportunities: [],
  tasks: [],
  lastSync: {
    leads: timestamp or null,
    contacts: timestamp or null,
    accounts: timestamp or null,
    opportunities: timestamp or null,
    tasks: timestamp or null
  }
}

### Design Rationale
- Centralized schema simplifies UI rendering
- Enables real-time updates across tabs
- Makes export and deletion straightforward
- Decouples extraction logic from UI logic

---

## Real-Time Synchronization

The popup dashboard listens for storage updates using chrome.storage.onChanged. This ensures instant synchronization across tabs with no manual refresh required.

---

## Export
- Export all extracted data as JSON
- Implemented using chrome.downloads.download
- Easily extendable to CSV export

---

## Known Limitations
- DOM scraping depends on data currently visible in the UI
- Pagination handled via Load More DOM interaction
- UI styling kept minimal to prioritize functionality

These trade-offs were intentional to focus on Salesforce Lightning DOM challenges.

---

## Architecture Overview
- Content Script:
  - Detects Salesforce page context
  - Scrapes Lightning DOM for CRM data
- Service Worker:
  - Initializes and maintains storage
  - Handles extension lifecycle events
- React Popup:
  - Displays extracted data
  - Provides search, delete, export, and extraction controls

This separation avoids tight coupling and improves maintainability.

---

## Demo Flow
1. Open Salesforce → Opportunities List
2. Refresh the page
3. Open the extension popup
4. Show grouped opportunities and last sync timestamp
5. Click Extract Current Object to demonstrate live extraction

---

## Assessment Coverage
- DOM scraping without Salesforce APIs
- Salesforce Lightning compatibility
- Multiple object types
- React popup dashboard
- Real-time synchronization
- Bonus features implemented


