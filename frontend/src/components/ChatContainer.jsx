import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();

  // Debug logs
  console.log("ChatContainer render:", {
    selectedUser,
    authUser,
    messages,
    isMessagesLoading,
  });

  useEffect(() => {
    console.log("useEffect triggered:", selectedUser?._id);
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Check if selectedUser exists
  if (!selectedUser) {
    console.log("No selected user, returning null");
    return null;
  }

  if (isMessagesLoading) {
    console.log("Loading messages...");
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  console.log("Rendering messages:", messages?.length);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => {
            console.log("Rendering message:", message);
            return (
              <div
                key={message._id}
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 h-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                      onError={(e) => {
                        console.log("Image load error:", e.target.src);
                        e.target.src = "/avatar.png";
                      }}
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="attachment"
                      className="max-w-[200px] rounded mb-2"
                      onError={(e) => {
                        console.log("Attachment image error:", e.target.src);
                      }}
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">
              No messages yet. Start a conversation!
            </p>
          </div>
        )}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
