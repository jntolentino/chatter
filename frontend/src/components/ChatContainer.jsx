import { useRef, useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { ChevronDown } from "lucide-react"; // 👈 scroll button icon

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

  const messageEndRef = useRef(null);
  const chatBoxRef = useRef(null); // 👈 chat container
  const firstLoad = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Fetch messages & subscribe
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      firstLoad.current = true; // reset on chat switch
      return () => unsubscribeFromMessages();
    }
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Scroll handling
  useEffect(() => {
    if (messageEndRef.current && messages) {
      if (firstLoad.current) {
        messageEndRef.current.scrollIntoView({ behavior: "auto" });
        firstLoad.current = false;
      } else {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  // Detect scroll position to toggle button
  const handleScroll = () => {
    if (!chatBoxRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;

    // show button if not near bottom (100px offset)
    setShowScrollBtn(scrollHeight - (scrollTop + clientHeight) > 100);
  };

  // Manual scroll
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!selectedUser) return null;

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div
        ref={chatBoxRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
      >
        {messages && messages.length > 0 ? (
          <>
            {messages.map((message) => (
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
                      onError={(e) => (e.target.src = "/avatar.png")}
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
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            ))}

            {/* Always at bottom */}
            <div ref={messageEndRef} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">
              No messages yet. Start a conversation!
            </p>
          </div>
        )}

        {/* 👇 Scroll-to-bottom button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 btn btn-circle btn-sm btn-primary shadow-lg"
          >
            <ChevronDown size={20} />
          </button>
        )}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
