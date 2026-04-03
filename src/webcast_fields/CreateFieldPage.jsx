import React, { useEffect, useState } from "react";

const CreateFieldPage = () => {
  // MASTER FIELD LIST (from field_mst)
  const masterFields = [
    "Name",
    "Email ID",
    "Mobile",
    "Employee Code",
    "Location",
    "City",
    "State",
    "Specialty",
    "Firm Name",
    "Pincode",
    "Custom Column 1",
    "Custom Column 2",
    "Custom Column 3",
  ];

  // STATES
const [mandatoryField, setMandatoryField] = useState("");
  const [fields, setFields] = useState([
    {
      master_field: "",
      label: "",
      placeholder: "",
      field_type: "text",
      is_required: "Y",
      order_index: 1,
      options_json: "",
    },
  ]);

  // HANDLE FIELD CHANGE
  const handleFieldChange = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  // ADD FIELD
  const handleAddField = () => {
    setFields([
      ...fields,
      {
        master_field: "",
        label: "",
        placeholder: "",
        field_type: "text",
        is_required: "Y",
        order_index: fields.length + 1,
        options_json: "",
      },
    ]);
  };

  // REMOVE FIELD
  const handleRemoveField = (index) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
  };

  // MANDATORY AUTO-FILL
useEffect(() => {
  if (!mandatoryField) return;

  const newField = {
    master_field: mandatoryField,
    label: mandatoryField,
    placeholder: `Enter ${mandatoryField}`,
    field_type: "text",
    is_required: "Y",
    order_index: 1,
    options_json: "",
  };

  setFields([newField]); // replaces existing
}, [mandatoryField]);

  return (
    <div className="container py-4">

      {/* PAGE TITLE */}


      {/* MANDATORY FIELD SELECT */}
    <div className="card p-4 mb-4 shadow-sm">
  <label className="fw-semibold mb-2">
    Select Mandatory Field
  </label>

  <select
    className="form-select"
    value={mandatoryField}
    onChange={(e) => setMandatoryField(e.target.value)}
  >
    <option value="">Select</option>
    <option value="Email">Email</option>
    <option value="Mobile">Mobile</option>
    <option value="Employee Code">Employee Code</option>
  </select>

 
</div>
      {/* FIELD CONFIGURATION */}
      <div className="card p-4 shadow-sm">
        <h5 className="fw-bold mb-3 text-primary">
          Field Configurations
        </h5>
 {/* ADD FIELD BUTTON */}
        <button
          className="btn btn-primary rounded-pill px-4 mb-2 d-inline-block"
          onClick={handleAddField}
        >
          + Add Field
        </button>
        {fields.map((field, index) => (
          <div
            key={index}
            className="border rounded-4 p-4 mb-4 bg-light position-relative"
          >
            <div className="row g-3">

              {/* SELECT FIELD */}
              <div className="col-md-2">
                <label className="fw-semibold">Field</label>
                <select
                  className="form-select rounded-pill"
                  value={field.master_field}
                  onChange={(e) =>
                    handleFieldChange(index, "master_field", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {masterFields.map((item, i) => (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* LABEL */}
              <div className="col-md-2">
                <label className="fw-semibold">Label</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={field.label}
                  onChange={(e) =>
                    handleFieldChange(index, "label", e.target.value)
                  }
                />
              </div>

              {/* PLACEHOLDER */}
              <div className="col-md-2">
                <label className="fw-semibold">Placeholder</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={field.placeholder}
                  onChange={(e) =>
                    handleFieldChange(index, "placeholder", e.target.value)
                  }
                />
              </div>

              {/* TYPE */}
              <div className="col-md-2">
                <label className="fw-semibold">Type</label>
                <select
                  className="form-select rounded-pill"
                  value={field.field_type}
                  onChange={(e) =>
                    handleFieldChange(index, "field_type", e.target.value)
                  }
                >
                  <option value="text">Text</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="image">Image</option>
                </select>
              </div>

              {/* REQUIRED */}
              <div className="col-md-2">
                <label className="fw-semibold">Required</label>
                <select
                  className="form-select rounded-pill"
                  value={field.is_required}
                  onChange={(e) =>
                    handleFieldChange(index, "is_required", e.target.value)
                  }
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>

              {/* ORDER */}
              <div className="col-md-1">
                <label className="fw-semibold">Order</label>
                <input
                  type="number"
                  className="form-control rounded-pill text-center"
                  value={field.order_index}
                  onChange={(e) =>
                    handleFieldChange(index, "order_index", e.target.value)
                  }
                />
              </div>
            </div>

            {/* DROPDOWN OPTIONS */}
            {field.field_type === "dropdown" && (
              <div className="mt-3">
                <label className="fw-semibold">Dropdown Options</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder="Option1, Option2"
                  value={field.options_json || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "options_json", e.target.value)
                  }
                />
              </div>
            )}

            {/* REMOVE BUTTON */}
            <button
              className="btn btn-outline-danger btn-sm position-absolute rounded-pill"
              style={{ top: 10, right: 10 }}
              onClick={() => handleRemoveField(index)}
              disabled={fields.length === 1}
            >
              Remove
            </button>
          </div>
        ))}

       
      </div>
    </div>
  );
};

export default CreateFieldPage;