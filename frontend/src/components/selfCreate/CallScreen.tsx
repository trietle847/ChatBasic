import React, { useEffect, useRef, useState } from "react";
import { useAgora } from "@/context/AgoraContext";

interface Props {
  channel: string;
  onClose: () => void;
}

export const CallOverlay: React.FC<Props> = ({ channel, onClose }) => {
  const {
    client,
    joinChannel,
    leaveChannel,
    localVideoTrack,
    localAudioTrack,
  } = useAgora();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  useEffect(() => {
    console.log("[Agora] CallOverlay mounted, joining channel...");
    joinChannel(channel);

    client.on("user-published", async (user, mediaType) => {
      console.log("[Agora] Remote user published", user.uid);
      await client.subscribe(user, mediaType);
      console.log("[Agora] Subscribed to remote user", user.uid);

      if (mediaType === "video" && remoteVideoRef.current) {
        const remoteTrack = user.videoTrack;
        if (remoteTrack) {
          console.log("[Agora] Playing remote video track");
          remoteTrack.play(remoteVideoRef.current);
        }
      }

      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        if (remoteAudioTrack) {
          console.log("[Agora] Playing remote audio track");
          remoteAudioTrack.play(); 
        }
      }
    });

    client.on("user-unpublished", (user) => {
      console.log("[Agora] Remote user unpublished", user.uid);
    });

    return () => {
      console.log("[Agora] CallOverlay unmounted, leaving channel...");
      leaveChannel();
      client.removeAllListeners();
    };
  }, [channel]);

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      console.log("[Agora] Playing local video track");
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  const handleToggleMic = () => {
    if (localAudioTrack) {
      if (isMicOn) {
        localAudioTrack.setEnabled(false);
        console.log("[Agora] Microphone muted");
      } else {
        localAudioTrack.setEnabled(true);
        console.log("[Agora] Microphone unmuted");
      }
      setIsMicOn(!isMicOn);
    }
  };

  const handleToggleCam = () => {
    if (localVideoTrack) {
      if (isCamOn) {
        localVideoTrack.setEnabled(false);
        console.log("[Agora] Camera turned off");
      } else {
        localVideoTrack.setEnabled(true);
        console.log("[Agora] Camera turned on");
      }
      setIsCamOn(!isCamOn);
    }
  };

  const handleEndCall = async () => {
    console.log("[Agora] User ended the call");
    await leaveChannel();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="relative w-[900px] h-[450px] bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4">
        <div className="flex gap-4 flex-1">
          <div className="flex-1 bg-black rounded overflow-hidden relative">
            <p className="absolute top-2 left-2 text-white text-sm z-10">Bạn</p>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
            ></video>
          </div>
          <div className="flex-1 bg-black rounded overflow-hidden relative">
            <p className="absolute top-2 left-2 text-white text-sm z-10">
              Đối phương
            </p>
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-full h-full object-cover"
            ></video>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handleToggleMic}
            className={`px-4 py-2 rounded-full ${
              isMicOn ? "bg-blue-500" : "bg-gray-500"
            } text-white`}
          >
            {isMicOn ? "Tắt mic" : "Mở mic"}
          </button>
          <button
            onClick={handleToggleCam}
            className={`px-4 py-2 rounded-full ${
              isCamOn ? "bg-blue-500" : "bg-gray-500"
            } text-white`}
          >
            {isCamOn ? "Tắt camera" : "Mở camera"}
          </button>
          <button
            onClick={handleEndCall}
            className="bg-red-500 text-white px-6 py-2 rounded-full"
          >
            Kết thúc
          </button>
        </div>
      </div>
    </div>
  );
};
