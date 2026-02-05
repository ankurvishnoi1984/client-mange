import { useState, useEffect } from "react";

export default function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    shortcode: "",
    contactperson: "",
    contactnumber: "",
    domain_url: "",
    isallowmultisession: false,
  });

  useEffect(() => {
    if (client) setForm(client);
  }, [client]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    onSave({ ...form, id: client?.id });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[500px] p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          {client ? "Edit Client" : "Add Client"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <Input name="shortcode" placeholder="Shortcode" value={form.shortcode} onChange={handleChange} />
          <Input name="contactperson" placeholder="Contact Person" value={form.contactperson} onChange={handleChange} />
          <Input name="contactnumber" placeholder="Contact Number" value={form.contactnumber} onChange={handleChange} />

          <Input
            name="domain_url"
            placeholder="Domain URL"
            value={form.domain_url}
            onChange={handleChange}
            className="col-span-2"
          />

          <label className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="isallowmultisession"
              checked={form.isallowmultisession}
              onChange={handleChange}
            />
            Allow Multi Session
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none w-full ${className}`}
    />
  );
}
