let amplitudeInterval = null;  // Variable to hold the interval for mean amplitude calculation in every second
let audioStream = null;  // Variable to hold the audio stream from the microphone

export function startCapturingAmplitude(callback) {
    if (audioStream) return; // Prevents multiple recordings if already capturing
    // checks if the browser supports microphone access (Web Audio API)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Audio input not supported in this browser.");
        return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            audioStream = stream; // Store the microphone stream
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);

            const bufferLength = analyser.fftSize; // analyze 2048 small chunks of sound at a time

            // dataArray hold the audio data, where each number represents the amplitude of sound at a moment in time.
            const dataArray = new Float32Array(bufferLength);

            function calculateAmplitude() {
                analyser.getFloatTimeDomainData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += Math.abs(dataArray[i]);
                }
                const meanAmplitude = sum / bufferLength;

                if (callback) {
                    callback(meanAmplitude.toFixed(9));  // Send to script.js
                }
            }

            amplitudeInterval = setInterval(calculateAmplitude, 1000); // Set Interval to Run the Function Every 1 Second
        })
        .catch(error => {
            console.error("Error accessing microphone: ", error);
        });
}

export function stopCapturingAmplitude() {
    if (amplitudeInterval) {
        clearInterval(amplitudeInterval);
        amplitudeInterval = null;
    }

    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
}
