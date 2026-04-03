import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASEURL } from "../constant";
import { useParams } from "react-router-dom";

const CreateFieldPage = () => {
  // MASTER FIELD LIST (from field_mst)
  const [fieldList, setFieldList] = useState([])
  const [mappedList, setMappedList] = useState([])
  const { webcastId } = useParams()
  const [loading, setLoading] = useState(false);

  const fetchFieldList = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASEURL}/webcast/fields`
      );
      setFieldList(res.data)

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMappedList = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASEURL}/webcast/webcast-field-mapping/${webcastId}`
      );
      setMappedList(res.data)

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFieldList();
    fetchMappedList();
  }, [])

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

  const handleSaveFields = async () => {
    try {
      const payload = {
        wc_code: webcastId, // your webcast code
        fields: fields.map((field, index) => {
          // find selected field from master list
          const matchedField = fieldList.find(
            (item) => item.field_name === field.master_field
          );

          return {
            wcfield_code: matchedField?.field_code,

            // mandatory logic
            wcfield_type:
              field.wcfield_code === mandatoryField ? "M" : "O",

            display_order: Number(field.order_index) || index + 1,

            wc_fieldlabel: field.label || field.master_field,

            fieldtype: field.field_type || "text",

            fieldtypevalue:
              field.field_type === "dropdown"
                ? field.options_json || null
                : null,

            placeholdervalue: field.placeholder || null,

            isrequired: field.is_required || "N",

            customfieldvalidation: null,
          };
        }),
      };

      console.log("payload", payload);

      await axios.post(`${BASEURL}/webcast/webcast-field-mapping`, payload);

      alert("Fields saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save fields",error);
    }
  };
  useEffect(() => {
    if (mappedList?.length > 0) {
      const prefilledFields = mappedList.map((item) => ({
        master_field: item.field_name || "",
        label: item.wc_fieldlabel || item.field_name || "",
        placeholder: item.placeholdervalue || "",
        field_type: item.fieldtype || "text",

        // use actual isrequired column
        is_required: item.isrequired || "N",

        order_index: item.display_order || "",
        options_json: item.fieldtypevalue || "",

        // keep this separately if needed
        wcfield_type: item.wcfield_type || "",
      }));

      setFields(prefilledFields);
      // PREFILL mandatory dropdown
      const mandatory = mappedList.find(
        (item) => item.wcfield_type === "M"
      );

      setMandatoryField(mandatory?.wcfield_code || "");
    }
  }, [mappedList]);

  return (
    <div className="container py-4">

      {/* PAGE TITLE */}


      {/* MANDATORY FIELD SELECT */}
      <div className="card p-4 mb-4 shadow-sm">
        <label className="fw-semibold mb-2">
          Select Mandatory Field
        </label>

        {/* <select
          className="form-select"
          value={mandatoryField}
          onChange={(e) => setMandatoryField(e.target.value)}
        >
          <option value="">Select</option>
          <option value={102}>Email</option>
          <option value={103}>Mobile</option>
          <option value={104}>Employee Code</option>
        </select> */}
        <select
          className="form-select"
          value={mandatoryField}
          onChange={(e) => setMandatoryField(e.target.value)}
        >
          <option value="">Select</option>
          {fieldList
            .filter((item) =>
              ["Email Id", "Mobile", "Employee Code"].includes(item.field_name)
            )
            .map((item) => (
              <option key={item.field_code} value={item.field_code}>
                {item.field_name}
              </option>
            ))}
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
                  {fieldList.map((item) => (
                    <option key={item.fid} value={item.field_name}>
                      {item.field_name}
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
        {/* SUBMIT BUTTON */}
        <div className="d-flex justify-content-end mt-4">
          <button
            className="btn btn-success rounded-pill px-4"
            onClick={handleSaveFields}
          >
            Save Fields
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateFieldPage;