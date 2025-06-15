import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
} from "agora-rtc-sdk-ng";

const appId = "a70d3c946e52431d9d5a16843f7f6032";
const token = null;

// định nghĩa cho context
interface AgoraContextType {
  client: IAgoraRTCClient; // đối tượng Agora client
  localAudioTrack: ILocalAudioTrack | null; // track do local user tạo
  localVideoTrack: ILocalVideoTrack | null;
  // xử  lý việc tham gia, thoát channel
  joinChannel: (channel: string) => Promise<void>;
  leaveChannel: () => Promise<void>;
}
// tạo context
const AgoraContext = createContext<AgoraContextType | null>(null);

export const AgoraProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // tạo Agora clien
  const [client] = useState(() =>
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );
  const [localAudioTrack, setLocalAudioTrack] =
    useState<ILocalAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ILocalVideoTrack | null>(null);

  useEffect(() => {
    return () => {
      console.log("[Agora] Component unmounted, leaving channel...");
      leaveChannel();
    };
  }, []);

  const joinChannel = async (channel: string) => {
    try {
      console.log("[Agora] Joining channel...");
      await client.join(appId, channel, token, null);
      console.log("[Agora] Joined channel");

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      console.log("[Agora] Created local tracks");

      await client.publish([audioTrack, videoTrack]);
      console.log("[Agora] Published local tracks");

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
    } catch (error) {
      console.error("[Agora] Failed to join channel:", error);
    }
  };

  const leaveChannel = async () => {
    try {
      console.log("[Agora] Leaving channel...");
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
        console.log("[Agora] Closed local audio track");
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        console.log("[Agora] Closed local video track");
      }

      await client.leave();
      console.log("[Agora] Successfully left channel");

      setLocalAudioTrack(null);
      setLocalVideoTrack(null);
    } catch (error) {
      console.warn("[Agora] Error while leaving channel:", error);
    }
  };

  return (
    <AgoraContext.Provider
      value={{
        client,
        localAudioTrack,
        localVideoTrack,
        joinChannel,
        leaveChannel,
      }}
    >
      {children}
    </AgoraContext.Provider>
  );
};

export const useAgora = () => {
  const ctx = useContext(AgoraContext);
  if (!ctx) throw new Error("useAgora must be used within AgoraProvider");
  return ctx;
};
