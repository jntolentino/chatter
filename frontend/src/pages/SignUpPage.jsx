import { useState } from "react";
import { User } from "lucide-react";

export default function FullNameField() {
  const [formData, setFormData] = useState({ fullName: "" });

  return (
    <form className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Full Name</span>
        </label>
        <div className="relative">
          {/* User Icon */}
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

          {/* Input */}
          <input
            type="text"
            className="input input-bordered w-full pl-10"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />
        </div>
      </div>
    </form>
  );
}
