import { useEffect, useRef } from "react";
import { useAppStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import ChatContainer from "./components/chat-container";
import { Button } from "@/components/ui/button";

const Chat = () => {
  const { userInfo, selectedChatType, isUploading, isDownloading, uploadProgress, downloadProgress } = useAppStore();
  const navigate = useNavigate();
  const effectCalled = useRef(false);  // Ref to track if effect has been called

  useEffect(() => {
    if (effectCalled.current) return;  // If effect has already been called, return early
    effectCalled.current = true;       // Mark effect as called

    if (userInfo && !userInfo.profileSetup) {
      toast("Please set up profile to continue.");
      navigate("/profile");
    } else {
      return;
    }
  }, [userInfo, navigate]);

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-[100vh] text-white overflow-hidden">
      {isUploading && (
          <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
            <h5 className="text-5xl animate-pulse">Uploading File...</h5>
            {uploadProgress}%
          </div>
        )}
      {isDownloading && (
          <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
            <h5 className="text-5xl animate-pulse">Downloading File...</h5>
            {downloadProgress}%
          </div>
        )}
      <ContactsContainer />
      {
        selectedChatType === undefined ? <EmptyChatContainer /> : <ChatContainer />
      }
    </div>
  );
};

export default Chat;
