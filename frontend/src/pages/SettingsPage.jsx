import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "./../constants/index";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey, How's it going?", isSent: false },
  { id: 2, content: "Doing Good, how about you?", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen container mx-auto px-2 sm:px-4 pt-16 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">
            Choose a Theme for the chat interface
          </p>
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
            ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}
            `}
              onClick={() => setTheme(t)}
            >
              <div
                className="relative h-8 w-full rounded-md overflow-hidden"
                data-theme={t}
              >
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Preview Section */}
        <h3 className="text-lg font-semibold mb-3">Preview Messages</h3>
        <div className="rounded-3xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
          <div className="p-3 sm:p-4 bg-base-200 rounded-3xl">
            <div className="max-w-lg mx-auto">
              {/* Mock UI Chat */}
              <div className="bg-base-100 rounded-3xl shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-base-300 bg-base-100 flex items-center gap-3 rounded-t-3xl">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium text-lg">
                    J
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">John Doe</h3>
                    <p className="text-xs text-base-content/70">Online</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-2 sm:p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                  {PREVIEW_MESSAGES.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isSent ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`
                  max-w-[80%] rounded-2xl p-3 shadow-sm
                  ${
                    message.isSent
                      ? "bg-primary text-primary-content"
                      : "bg-base-200"
                  }
                `}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`
                    text-[10px] mt-1.5
                    ${
                      message.isSent
                        ? "text-primary-content/70"
                        : "text-base-content/70"
                    }
                  `}
                        >
                          12:00 PM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-2 sm:p-4 border-t border-base-300 bg-base-100 rounded-b-3xl">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1 text-sm h-10 rounded-lg"
                      placeholder="Type a message..."
                      value="This is a preview only"
                      readOnly
                    />
                    <button className="btn btn-primary h-10 min-h-0 rounded-lg">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
