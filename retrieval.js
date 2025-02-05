const dbName = "AudioDB";
const dbVersion = 1;

// Function to fetch the last stored amplitude value
export const fetchLastAmplitude = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["amplitudes"], "readonly");
      const store = transaction.objectStore("amplitudes");

      // Open a cursor to iterate over stored entries in reverse order (latest first)
      const cursorRequest = store.openCursor(null, "prev"); // Get the last stored entry

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          resolve(cursor.value.amplitude);
        } else {
          resolve(null); // No data found
        }
      };

      cursorRequest.onerror = (event) => reject(event.target.error);
    };

    request.onerror = (event) => reject(event.target.error);
  });
};
