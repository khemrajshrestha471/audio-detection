const dbName = "AudioDB";
const dbVersion = 1;
let db; // Variable to store the database connection

// Open (or create if it doesn't exist) the IndexedDB database
const request = indexedDB.open(dbName, dbVersion);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  // Check if the "amplitudes" object store exists; if not, create it
  if (!db.objectStoreNames.contains("amplitudes")) {
    db.createObjectStore("amplitudes", { keyPath: "id", autoIncrement: true });
  } // "amplitudes" will store audio amplitude values with an auto-incrementing ID
};

// Event triggered when the database successfully opens
request.onsuccess = (event) => {
  db = event.target.result; // Store the database instance
};

request.onerror = (event) => {
  console.error("IndexedDB error:", event.target.errorCode);
};

// Function to store amplitude value in IndexedDB
export const saveAmplitude = (amplitude) => {
  if (!db) {
    console.error("Database not initialized");
    return;
  }

  // Create a transaction to write data into the "amplitudes" store
  const transaction = db.transaction(["amplitudes"], "readwrite");
  const store = transaction.objectStore("amplitudes");

  const entry = { timestamp: new Date().toISOString(), amplitude: amplitude };
  // Add the entry to the database
  store.add(entry);

  transaction.oncomplete = () => console.log("Amplitude saved:", amplitude);
  transaction.onerror = (event) => console.error("Error saving amplitude:", event.target.error);
};
