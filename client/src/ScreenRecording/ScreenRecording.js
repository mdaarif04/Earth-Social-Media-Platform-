import React, { useState, useRef } from "react";

const ScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
      // Check for screen capture support
      if (!navigator.mediaDevices.getDisplayMedia) {
        alert("Screen recording is not supported on your device.");
        return;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const combinedStream = new MediaStream([
        ...screenStream.getTracks(),
        ...audioStream.getTracks(),
      ]);

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting screen recording:", error);
      alert("An error occurred while starting the screen recording.");
    }
  };


  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    mediaRecorderRef.current.stream
      .getTracks()
      .forEach((track) => track.stop());
  };

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "screen-recording.webm";
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    setRecordedChunks([]);
  };

  return (
    <div >
      {!isRecording ? (
        <button className="Start" onClick={startRecording}>
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording}>
          Stop Recording
        </button>
      )}
      {recordedChunks.length > 0 && (
        <button className="Download" onClick={downloadRecording}>
          Download Recording
        </button>
      )}
    </div>
  );
};



export default ScreenRecorder;
