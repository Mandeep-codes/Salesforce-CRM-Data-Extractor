console.log("Service worker running");

const EMPTY_DATA = {
  leads: [],
  contacts: [],
  accounts: [],
  opportunities: [],
  tasks: [],
  lastSync: {
    leads: null,
    contacts: null,
    accounts: null,
    opportunities: null,
    tasks: null
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ salesforce_data: EMPTY_DATA });
});

