export async function recordAndDetectMeanAmplitude() {
    return new Promise(async (resolve, reject) => {
        try {
            // Creating audio context to process audio data (Web Audio API)
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Requesting permission to use the microphone and start capturing audio
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Creating a media recorder to record the audio
            const mediaRecorder = new MediaRecorder(stream);
            // Array to store recorded audio chunks
            let audioChunks = [];

            // Event listener that collects audio data when available
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            // Event listener triggered when recording stops
            mediaRecorder.onstop = async () => {
                // Combine recorded audio chunks into a single audio file (Blob)
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                // Create a file reader to read the audio blob
                const reader = new FileReader();

                reader.onload = async function () {
                    try {
                        // Decode the audio data to get a buffer with raw audio samples
                        const audioBuffer = await audioContext.decodeAudioData(reader.result);

                        // Extract raw audio samples from the first channel (mono audio)
                        const rawData = audioBuffer.getChannelData(0);

                        // Convert raw data to Tensor
                        const tensor = tf.tensor1d(rawData);

                        // Compute Mean Amplitude by taking the absolute values and averaging them
                        // .dataSync() – Converts the computed result from a TensorFlow tensor into a JavaScript array
                        const meanAmplitude = tensor.abs().mean().dataSync()[0];

                        // Clean up
                        tensor.dispose();

                        // Return the mean amplitude value
                        resolve(meanAmplitude.toFixed(9));
                    } catch (error) {
                        reject("Error processing recorded audio.");
                    }
                };

                reader.readAsArrayBuffer(audioBlob);
            };

            // Start recording
            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 10000); // Stop after 10 seconds
        } catch (error) {
            reject("Error accessing microphone.");
        }
    });
}