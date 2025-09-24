import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "./../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  conversations: [],
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: [], // Make sure this exists

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/user");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });

      // STEP 4: Update conversation order when YOU send a message
      get().updateConversationOrder({
        userId: selectedUser._id,
        fullName: selectedUser.fullName,
        profilePic: selectedUser.profilePic,
        lastMessage: res.data.text || "📎 File",
        lastMessageTime: res.data.createdAt,
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Handle typing events
    socket.on("typing", ({ senderId }) => {
      set((state) => ({
        typingUsers: state.typingUsers.includes(senderId)
          ? state.typingUsers
          : [...state.typingUsers, senderId],
      }));
    });

    socket.on("stopTyping", ({ senderId }) => {
      set((state) => ({
        typingUsers: state.typingUsers.filter((id) => id !== senderId),
      }));
    });

    socket.on("newMessage", (newMessage) => {
      const isMessageFromSelectedUser =
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id;

      if (isMessageFromSelectedUser) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });

    // STEP 6: Clear unread count when selecting a user
    if (selectedUser) {
      get().markConversationAsRead(selectedUser._id);
    }
  },

  // STEP 2: Add this function
  updateConversationOrder: (conversationData) => {
    const { userId, fullName, profilePic, lastMessage, lastMessageTime } =
      conversationData;

    set((state) => {
      console.log("Updating conversation for:", fullName);
      console.log("Currently selected user:", state.selectedUser?.fullName);
      console.log(
        "Should increment unread:",
        state.selectedUser?._id !== userId
      );

      // Find if conversation already exists
      const existingIndex = state.conversations.findIndex(
        (conv) => conv.userId === userId
      );

      // STEP 7: Only increment unread count if this user is NOT currently selected
      const shouldIncrementUnread = state.selectedUser?._id !== userId;

      if (existingIndex !== -1) {
        // Move existing conversation to top
        const currentUnread = state.conversations[existingIndex].unreadCount;
        const newUnreadCount = shouldIncrementUnread
          ? currentUnread + 1
          : currentUnread;

        console.log(
          "Existing conversation - Current unread:",
          currentUnread,
          "New unread:",
          newUnreadCount
        );

        const updatedConversation = {
          ...state.conversations[existingIndex],
          lastMessage,
          lastMessageTime,
          unreadCount: newUnreadCount,
        };

        // Remove from current position and add to top
        const newConversations = [...state.conversations];
        newConversations.splice(existingIndex, 1);
        return { conversations: [updatedConversation, ...newConversations] };
      } else {
        // Create new conversation entry
        const newUnreadCount = shouldIncrementUnread ? 1 : 0;
        console.log("New conversation - Unread count:", newUnreadCount);

        const newConversation = {
          userId,
          fullName,
          profilePic,
          lastMessage,
          lastMessageTime,
          unreadCount: newUnreadCount,
        };
        return { conversations: [newConversation, ...state.conversations] };
      }
    });
  },

  // STEP 6: Add this function to clear unread count
  markConversationAsRead: (userId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
      ),
    }));
  },
}));
