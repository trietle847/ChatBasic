import React, { useEffect, useRef, useState } from "react";
import { useAgora } from "@/context/AgoraContext";
import { useSocket } from "@/socket/socketContex";
import type { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

interface Props {
  channel: string;
  onClose: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  incoming?: boolean;
  members?: string[];
  conversationId?: string;
  callerId?: string;
  senderId: string;
  callType: string; // "private" | "group"
}

export const CallOverlay: React.FC<Props> = ({
  channel,
  onClose,
  onAccept,
  onReject,
  incoming = false,
  conversationId,
  callerId,
  senderId,
  callType,
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
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [waitingResponse, setWaitingResponse] = useState(incoming);

  // Người gọi chủ động join nếu không phải incoming
  useEffect(() => {
    if (!incoming) {
      console.log("👉 Người gọi đang join channel:", channel);
      joinChannel(channel).then(() => {
        console.log("✅ Người gọi đã join channel");
      });
    }
  }, [channel]);

  // Sub người khác vào và render video của họ
  useEffect(() => {
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video") {
        setRemoteUsers((prev) => [...prev, user]);
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    });

    client.on("user-unpublished", (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    client.on("user-left", (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    return () => {
      leaveChannel();
      setRemoteUsers([]);
      client.removeAllListeners();
    };
  }, [client]);

  // Hiển thị local video
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
    setRemoteUsers([]);

    const isGroupCall = callType === "group";
    const isCaller = senderId === callerId;

    console.log("người bd gọi ", callerId);
    console.log("người dùng hiện tại là ",senderId);

    // Nếu là call 1-1 hoặc là host kết thúc call nhóm
    if (!isGroupCall || (isCaller && isGroupCall)) {
      socket?.emit("end_call", {
        conversationId,
        senderId: callerId,
      });
    }

    onClose();
  };

  const handleAccept = async () => {
    setWaitingResponse(false);
    await joinChannel(channel);

    if (localVideoRef.current && localVideoTrack) {
      localVideoTrack.play(localVideoRef.current);
    }

    socket?.emit("call_response", {
      accepted: true,
      channel,
      to: callerId,
      senderId,
      conversationId,
    });
    onAccept?.();
  };

  const handleReject = async () => {
    // Tắt video nếu đang bật
    if (localVideoTrack) {
      localVideoTrack.stop(); // Dừng hiển thị
      localVideoTrack.close(); // Giải phóng camera
    }

    // Tắt mic nếu đang bật
    if (localAudioTrack) {
      localAudioTrack.stop(); // Dừng phát
      localAudioTrack.close(); // Giải phóng mic
    }

    // Rời khỏi channel để tránh giữ tài nguyên
    await leaveChannel();
    setRemoteUsers([]);

    // Gửi tín hiệu từ chối về server
    socket?.emit("call_response", {
      accepted: false,
      channel,
      to: callerId,
      senderId,
      conversationId,
    });

    onReject?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-[95vw] h-[90vh] bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4">
        {waitingResponse ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-semibold text-black">
              Cuộc gọi đến...
            </h2>
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
            <div className="flex-1 relative">
              {callType === "group" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 h-full overflow-auto">
                  {/* Local video */}
                  <div className="bg-black rounded relative overflow-hidden h-64 w-full">
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

                  {/* Remote Users */}
                  {remoteUsers.map((user, index) => (
                    <div
                      key={user.uid}
                      className="bg-black rounded relative overflow-hidden h-64 w-full"
                    >
                      <p className="absolute top-2 left-2 text-white text-sm z-10">
                        Thành viên {index + 1}
                      </p>
                      <div
                        ref={(node) => {
                          if (node) user.videoTrack?.play(node);
                        }}
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {/* Remote User (Full screen) */}
                  {remoteUsers[0] ? (
                    <div
                      className="absolute inset-0 bg-black rounded overflow-hidden"
                      ref={(node) => {
                        if (node) remoteUsers[0].videoTrack?.play(node);
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-black flex items-center justify-center text-white text-xl">
                      Đang chờ người bên kia...
                    </div>
                  )}

                  {/* Local Video (PiP) */}
                  <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded overflow-hidden shadow-lg border-2 border-white z-20">
                    <p className="absolute top-1 left-2 text-white text-sm z-10">
                      Bạn
                    </p>
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 pt-2">
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
