import React, { useRef, useState } from "react";
import axios from "axios";

type Props = { onSuccess: () => void };

export default function LivenessCheck({ onSuccess }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stage, setStage] = useState(0);
  const [imgA, setImgA] = useState<string | null>(null);
  const [imgB, setImgB] = useState<string | null>(null);
  const token = localStorage.getItem("token") || "";

  React.useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        console.error(e);
      }
    }
    start();
    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || [];
      tracks.forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const v = videoRef.current!;
    const c = canvasRef.current!;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg");
    return dataUrl;
  }

  async function next() {
    if (stage === 0) {
      setImgA(capture());
      setStage(1);
    } else if (stage === 1) {
      setImgB(capture());
      setStage(2);
      // call server for liveness
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/rekognition/liveness`,
          { imageA: imgA || capture(), imageB: capture() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.isLive) {
          alert("Liveness confirmed");
          onSuccess();
        } else {
          alert("Liveness check failed, please try again.");
          setStage(0);
          setImgA(null);
          setImgB(null);
        }
      } catch (err) {
        console.error(err);
        alert("Liveness check error");
        setStage(0);
      }
    }
  }

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline className="w-full rounded" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="mt-2 flex gap-2">
        <button onClick={next} className="bg-primary-500 text-white px-3 py-2 rounded">{stage === 0 ? "Capture (look ahead)" : stage === 1 ? "Capture (turn/gesture)" : "Processing..."}</button>
      </div>
    </div>
  );
}