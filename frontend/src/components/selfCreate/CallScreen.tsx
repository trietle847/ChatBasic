import React, { useEffect, useRef, useState } from "react";
import { useAgora } from "@/context/AgoraContext";
import { useSocket } from "@/socket/socketContex";

interface Props {
  channel: string;
  onClose: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  incoming?: boolean;
  members?: string[];
  conversationId?: string;
  callerId?: string;
}

export const CallOverlay: React.FC<Props> = ({
  channel,
  onClose,
  incoming = false,
  members = [],
  conversationId,
  callerId,
}) => {
  const {
    client,
    joinChannel,
    leaveChannel,
    localVideoTrack,
    localAudioTrack,
  } = useAgora();

  const socket = useSocket();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [waitingResponse, setWaitingResponse] = useState(incoming);

  useEffect(() => {
    if (incoming) return;
    joinChannel(channel);
  }, [channel]);

  useEffect(() => {
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video" && remoteVideoRef.current) {
        user.videoTrack?.play(remoteVideoRef.current);
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    });

    return () => {
      leaveChannel();
      client.removeAllListeners();
    };
  }, [client]);

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  const handleToggleMic = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!isMicOn);
      setIsMicOn((prev) => !prev);
    }
  };

  const handleToggleCam = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!isCamOn);
      setIsCamOn((prev) => !prev);
    }
  };

  const handleEndCall = async () => {
    await leaveChannel();
    socket?.emit("call_ended", { channel, conversationId });
    onClose();
  };

  const handleAccept = async () => {
    setWaitingResponse(false);
    await joinChannel(channel);
    socket?.emit("call_response", {
      accepted: true,
      channel,
      to: callerId,
      conversationId,
    });
  };

  const handleReject = () => {
    socket?.emit("call_response", {
      accepted: false,
      channel,
      to: callerId,
      conversationId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="relative w-[900px] h-[450px] bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4">
        {waitingResponse ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <h2 className="text-xl">Cuộc gọi đến...</h2>
            <div className="flex gap-4">
              <button
                onClick={handleAccept}
                className="bg-green-500 text-white px-6 py-2 rounded-full"
              >
                Chấp nhận
              </button>
              <button
                onClick={handleReject}
                className="bg-red-500 text-white px-6 py-2 rounded-full"
              >
                Từ chối
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-4 flex-1">
              <div className="flex-1 bg-black rounded overflow-hidden relative">
                <p className="absolute top-2 left-2 text-white text-sm z-10">
                  Bạn
                </p>
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
          </>
        )}
      </div>
    </div>
  );
};
