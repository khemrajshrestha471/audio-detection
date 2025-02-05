import { recordAndDetectMeanAmplitude } from './amp.js';
import { startCapturingAmplitude, stopCapturingAmplitude } from './capture.js';
import { fetchLastAmplitude } from './retrieval.js';
import { saveAmplitude } from "./indexdb.js";

// Recording button event listener
document.getElementById('recordButton').addEventListener('click', async function () {
  const button = this;
  const timerElement = document.getElementById('timer');
  let timeLeft = 9;
  button.disabled = true;
  const countdown = setInterval(() => {
    if (timeLeft > 0) {
      timerElement.textContent = timeLeft;
      timeLeft--;
    } else {
      clearInterval(countdown);
      timerElement.textContent = "10"; // Reset after completion
      button.disabled = false;
    }
  }, 1000);

  try {
    let detectedMeanAmplitude = await recordAndDetectMeanAmplitude(); // Get amplitude from recorded audio
    document.getElementById('amplitudeValue').textContent = detectedMeanAmplitude;
    saveAmplitude(detectedMeanAmplitude); // Save to IndexedDB
  } catch (error) {
    console.error(error);
    document.getElementById('amplitudeValue').textContent = "Error";
  }
});



let lastPopupTime = 0; // Stores the last time the popup was shown

function showPopup(message) {
  let currentTime = Date.now();

  // Check if 5 sec has passed since the last popup
  if (currentTime - lastPopupTime < 5000) {
    return; // Do not show the popup again within 5 seconds
  }

  lastPopupTime = currentTime; // Update last popup time

  // Create the popup container
  let popup = document.createElement('div');
  popup.classList.add('popup');

  // Create the message text
  let messageText = document.createElement('p');
  messageText.textContent = message;
  popup.appendChild(messageText);

  // Create the OK button
  let okButton = document.createElement('button');
  okButton.textContent = 'OK';
  okButton.classList.add('popup-button');

  okButton.onclick = function () {
    document.body.removeChild(popup);
  };

  popup.appendChild(okButton);
  document.body.appendChild(popup);

  // Automatically remove the popup after 2 seconds if OK is not pressed
  setTimeout(() => {
    if (document.body.contains(popup)) {
      document.body.removeChild(popup);
    }
  }, 2000);
}


async function handleAmplitudeUpdate(meanAmplitude) {
  let lastAmplitude = await fetchLastAmplitude();

  // Example: Update a UI element with the amplitude value
  const amplitudeDisplay = document.getElementById("amplitudeValue2");
  if (amplitudeDisplay) {
    amplitudeDisplay.innerText = `Real Time Mean Amplitude: ${meanAmplitude}`;
  }
  // Convert meanAmplitude to string and extract decimal part
  let meanStr = meanAmplitude.toString();
  let decimalPart = meanStr.includes('.') ? meanStr.split('.')[1] : '';

  // Find the position of the first non-zero digit in the decimal part
  let firstNonZeroIndex = decimalPart.search(/[1-9]/);

  // Calculate the dynamic adjustment factor
  let adjustmentFactor = firstNonZeroIndex !== -1
    ? parseFloat('0.' + '0'.repeat(firstNonZeroIndex) + '09')
    : 0.000000001;

  if (lastAmplitude !== null) {

    let meanAmplitudeNum = parseFloat(lastAmplitude);

    let meanAmplitudeRange = [
      (meanAmplitudeNum - adjustmentFactor) > 0.05
        ? (meanAmplitudeNum - adjustmentFactor)
        : (adjustmentFactor),
        meanAmplitudeNum,
        (meanAmplitudeNum + adjustmentFactor) > 0.05
        ? (meanAmplitudeNum + adjustmentFactor)
        : (meanAmplitudeNum + (adjustmentFactor*50))
    ];

    if (meanAmplitude == 0) {
      showPopup('No Sound Detected!!!');
      return;
    }

    if (meanAmplitude < meanAmplitudeRange[0]) {
      showPopup('Low Sound Detected!!!');
      return;
    } else if (meanAmplitude > meanAmplitudeRange[1]) {
      showPopup('High Sound Detected!!!');
      return;
    }
  }
}

// Start capturing amplitude when needed
document.getElementById("startRecording").addEventListener("click", () => {
  startCapturingAmplitude(handleAmplitudeUpdate);
});

// Stop capturing amplitude when needed
document.getElementById("stopRecording").addEventListener("click", () => {
  stopCapturingAmplitude();
});