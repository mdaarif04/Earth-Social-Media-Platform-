import React, { useState, useRef } from "react";
const ScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [tool, setTool] = useState("pencil");
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
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

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY); // Get global mouse position
    canvas.isDrawing = true;
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (canvas.isDrawing) {
      ctx.lineTo(e.clientX, e.clientY);
      if (tool === "pencil") {
        ctx.globalCompositeOperation = "source-over"; // Normal drawing
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
      } else if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"; // Erasing
        ctx.lineWidth = 20;
      }
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    canvas.isDrawing = false;
  };

  return (
    <div className="screen-recorder">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="drawing-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
      <div className="controls">
        {!isRecording ? (
          <button className="start-btn" onClick={startRecording}>
            Start Recording
          </button>
        ) : (
          <>
            <button className="stop-btn" onClick={stopRecording}>
              Stop Recording
            </button>
            <button
              className={`tool-btn ${tool === "pencil" ? "active" : ""}`}
              onClick={() => setTool("pencil")}
            >
              Pencil
            </button>
            <button
              className={`tool-btn ${tool === "eraser" ? "active" : ""}`}
              onClick={() => setTool("eraser")}
            >
              Eraser
            </button>
          </>
        )}
        {recordedChunks.length > 0 && (
          <button className="download-btn" onClick={downloadRecording}>
            Download Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default ScreenRecorder;
