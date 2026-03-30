import { useRef } from "react";
import { getSocket } from "@/lib/socket";

export const useStreamManager = (
  peerConnections: React.MutableRefObject<{ [key: string]: RTCPeerConnection }>
) => {
  const localStream = useRef<MediaStream | null>(null);

  const handleStreamStarted = async (stream: MediaStream) => {
    localStream.current = stream;
    const socket = getSocket();

    for (const [studentId, pc] of Object.entries(peerConnections.current)) {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) continue;

      const videoSender = pc.getSenders().find(
        (s) => s.track?.kind === "video"
      );

      if (videoSender) {
        await videoSender.replaceTrack(videoTrack);
      } else {
        pc.addTrack(videoTrack, stream);
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", { to: studentId, offer });

      console.log("Re-negotiated offer sent to:", studentId);
    }
  };

  const handleStreamStopped = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }

    localStream.current = null;

    Object.values(peerConnections.current).forEach((pc) => {
      const videoSender = pc.getSenders().find(
        (s) => s.track && s.track.kind === "video"
      );

      if (videoSender) {
        videoSender.replaceTrack(null);
        console.log("Video removed safely (audio still running)");
      }
    });
  };

  return {
    localStream,
    handleStreamStarted,
    handleStreamStopped,
  };
};