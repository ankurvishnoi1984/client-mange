import { useState } from "react";
import { MoreVertical } from "lucide-react";

export default function ActionMenu({ onEdit, onDeactivate }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-gray-200 rounded-lg"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border shadow-lg rounded-xl text-sm z-10">
          <button
            onClick={onEdit}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Edit
          </button>

          <button
            onClick={onDeactivate}
            className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
          >
            Deactivate
          </button>
        </div>
      )}
    </div>
  );
}
