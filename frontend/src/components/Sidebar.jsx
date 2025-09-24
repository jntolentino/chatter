import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, MessageCircle } from "lucide-react";
import { useAuthStore } from "./../store/useAuthStore";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    conversations, // STEP 5: Get conversations from store
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [viewMode, setViewMode] = useState("conversations"); // STEP 5: Add view mode

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // STEP 8: Global socket listener for conversation updates
  useEffect(() => {
    const socket = useAuthStore.getState().socket;

    if (socket) {
      // Listen for ANY incoming messages to update conversations
      const handleNewMessage = (newMessage) => {
        const sender = users.find((u) => u._id === newMessage.senderId);

        if (sender) {
          const { updateConversationOrder } = useChatStore.getState();
          updateConversationOrder({
            userId: sender._id,
            fullName: sender.fullName,
            profilePic: sender.profilePic,
            lastMessage: newMessage.text || "📎 File",
            lastMessageTime: newMessage.createdAt,
          });
        }
      };

      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [users]); // Re-run when users change

  // STEP 5: Get filtered data based on view mode
  const getFilteredData = () => {
    if (viewMode === "conversations") {
      return showOnlineUsers
        ? conversations.filter((conv) => onlineUsers.includes(conv.userId))
        : conversations;
    } else {
      return showOnlineUsers
        ? users.filter((user) => onlineUsers.includes(user._id))
        : users;
    }
  };

  const filteredData = getFilteredData();

  // STEP 5: Format timestamp
  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.abs(now - messageTime) / 36e5;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? "now" : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return "Yesterday";
    }
  };

  if (isUsersLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        {/* STEP 5: View Mode Toggle */}
        <div className="flex items-center gap-2 mb-3">
          <div className="hidden lg:flex bg-base-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("conversations")}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === "conversations"
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-300"
              }`}
            >
              <MessageCircle className="size-4 inline mr-1" />
              Chats
            </button>
            <button
              onClick={() => setViewMode("contacts")}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === "contacts"
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-300"
              }`}
            >
              <Users className="size-4 inline mr-1" />
              Contacts
            </button>
          </div>

          {/* Mobile - just show active mode icon */}
          <div className="lg:hidden">
            {viewMode === "conversations" ? (
              <MessageCircle className="size-6" />
            ) : (
              <Users className="size-6" />
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineUsers}
              onChange={(e) => setShowOnlineUsers(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show Online Only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} Online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {viewMode === "conversations"
          ? // STEP 5: Conversations View
            filteredData.map((conversation) => (
              <button
                key={conversation.userId}
                onClick={() => {
                  const user = users.find((u) => u._id === conversation.userId);
                  if (user) setSelectedUser(user);
                }}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-all duration-200 ${
                  selectedUser?._id === conversation.userId
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }`}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={conversation.profilePic || "/avatar.png"}
                    alt={conversation.fullName}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(conversation.userId) && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                  )}
                  {conversation.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unreadCount > 9
                        ? "9+"
                        : conversation.unreadCount}
                    </span>
                  )}
                </div>

                {/* Conversation info on larger screens */}
                <div className="hidden lg:block text-left min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">
                      {conversation.fullName}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {formatTime(conversation.lastMessageTime)}
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400 truncate">
                    {conversation.lastMessage}
                  </div>
                </div>
              </button>
            ))
          : // Your original contacts view
            filteredData.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                  selectedUser?._id === user._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }`}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                  )}
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            ))}

        {filteredData.length === 0 && (
          <div className="text-center p-5 text-sm text-zinc-500 py-4">
            {viewMode === "conversations"
              ? "No recent conversations yet. Start chatting!"
              : showOnlineUsers
              ? "No users are currently online."
              : "No users to display."}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
