import { useEffect, useRef, useState } from "react";

export const useMicrophoneManager = (
  classId: string | undefined,
  classData: any,
  isTeacher: boolean,
  peerConnections: React.MutableRefObject<{ [key: string]: RTCPeerConnection }>
) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const micStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!classId) return;
    if (classData === null) return;
    if (!isTeacher) return;

    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.current = stream;
        console.log("Mic initialized");

        // Add mic tracks to existing peer connections
        for (const pc of Object.values(peerConnections.current)) {
          stream.getAudioTracks().forEach((track) => {
            const alreadyAdded = pc.getSenders().some((s) => s.track === track);
            if (!alreadyAdded) pc.addTrack(track, stream);
          });
        }
      } catch (err) {
        console.error("Mic permission denied", err);
      }
    };

    initMic();
  }, [classId, classData, isTeacher]);

  return {
    isMicOn,
    setIsMicOn,
    micStream,
  };
};