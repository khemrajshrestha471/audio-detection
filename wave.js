let audioContext, analyser, microphone, dataArray, bufferLength, animationFrameId;
const canvas = document.getElementById("waveform");
const canvasCtx = canvas.getContext("2d");

const startButton = document.getElementById("startRecording");
const stopButton = document.getElementById("stopRecording");

startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);


async function startRecording() {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Initialize Audio Context and Analyzer
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; 

        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Start Visualizing
        drawWaveform();

        // Enable/Disable Buttons
        startButton.disabled = true;
        stopButton.disabled = false;
    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
}

function stopRecording() {
    if (audioContext) {
        audioContext.close();
    }

    cancelAnimationFrame(animationFrameId);
    clearCanvas();

    // Enable/Disable Buttons
    startButton.disabled = false;
    stopButton.disabled = true;
}

function drawWaveform() {
    animationFrameId = requestAnimationFrame(drawWaveform);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "white";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "blue";
    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}

function clearCanvas() {
    canvasCtx.fillStyle = "white";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
}