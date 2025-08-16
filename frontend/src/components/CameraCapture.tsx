import React, { useRef, useEffect } from "react";

type Props = {
  onCapture: (dataUrl: string) => void;
};

export default function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error(err);
      }
    }
    start();
    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || [];
      tracks.forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    onCapture(dataUrl);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline className="w-full rounded" />
      <canvas ref={canvasRef} className="hidden" />
      <button onClick={handleCapture} className="mt-2 bg-primary-500 text-white px-4 py-2 rounded">Capture Selfie</button>
    </div>
  );
}