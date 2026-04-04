import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASEURL } from "../constant";
import { useParams } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";

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
      alert("Failed to save fields", error);
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
        wcfield_code: item.wcfield_code
      }));

      setFields(prefilledFields);
      // PREFILL mandatory dropdown
      const mandatory = mappedList.find(
        (item) => item.wcfield_type === "M"
      );

      setMandatoryField(mandatory?.wcfield_code || "");
    }
  }, [mappedList]);

  const signInField = fields.find(
    (field) =>
      Number(field.wcfield_code) === Number(mandatoryField)
  );

  return (
    <div className="container py-4">

      {/* PAGE TITLE */}


      {/* MANDATORY FIELD SELECT */}
      <div className="custom-card p-4 mb-4 shadow-sm">
      
           <div className="d-flex align-items-center justify-content-between mb-3">
  <h5 className="fw-bold text-primary m-0">
    Configure Log in Field
  </h5>
  <div><label className="fw-semibold">Select</label>
  <select
    className="form-select login-select"
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
  </select></div>
  
</div>
        {signInField && (
          <div className=" rounded-4 p-3  mt-3">
            {/* <h6 className="fw-bold text-primary mb-3">
              Log in Field Configuration
            </h6> */}

            <div className="row g-3">
              <div className="col-md-2">
                <label className="fw-semibold">Field</label>
                <input
                  className="form-control rounded-pill"
                  value={signInField.master_field}
                  disabled
                />
              </div>

              <div className="col-md-2">
                <label className="fw-semibold">Label</label>
                <input
                  className="form-control rounded-pill"
                  value={signInField.label}
                  onChange={(e) =>
                    handleFieldChange(
                      fields.findIndex(
                        (f) =>
                          Number(f.wcfield_code) === Number(mandatoryField)
                      ),
                      "label",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="col-md-2">
                <label className="fw-semibold">Placeholder</label>
                <input
                  className="form-control rounded-pill"
                  value={signInField.placeholder}
                  onChange={(e) =>
                    handleFieldChange(
                      fields.findIndex(
                        (f) =>
                          Number(f.wcfield_code) === Number(mandatoryField)
                      ),
                      "placeholder",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="col-md-2">
                <label className="fw-semibold">Required</label>
                <select
                  className="form-select rounded-pill"
                  value={signInField.is_required}
                  disabled
                  onChange={(e) =>
                    handleFieldChange(
                      fields.findIndex(
                        (f) =>
                          Number(f.wcfield_code) === Number(mandatoryField)
                      ),
                      "is_required",
                      e.target.value
                    )
                  }
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="fw-semibold">Order</label>
                <input
                  type="number"
                  className="form-control rounded-pill text-center"
                  value={signInField.order_index}
                  onChange={(e) =>
                    handleFieldChange(
                      fields.findIndex(
                        (f) =>
                          Number(f.wcfield_code) === Number(mandatoryField)
                      ),
                      "order_index",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

      </div>
      {/* FIELD CONFIGURATION */}
      <div className="custom-card p-4 shadow-sm">
        <h5 className="fw-bold mb-3 text-primary">
          Other Fields
        </h5>
        {/* ADD FIELD BUTTON */}
        <button
        className="add-btn mb-3"
          onClick={handleAddField}
        >
          + Add Field
        </button>
        <div className="p-4 pb-2 ">
           <div className="field-header row  ">
  <div className="col-md-2">Field</div>
  <div className="col-md-2">Label</div>
  <div className="col-md-2">Placeholder</div>
  <div className="col-md-2">Type</div>
  <div className="col-md-2">Required</div>
  <div className="col-md-1">Order</div>
</div>
        </div>
       
     {fields
          .map((field, originalIndex) => ({ field, originalIndex }))
          .filter(
            ({ field }) =>
              Number(field.wcfield_code) !== Number(mandatoryField)
          )
          .map(({ field, originalIndex }) => (
          <div
            key={originalIndex}
            className=" rounded-4 p-4 pb-2  mb-2  position-relative"
          >
            <div className="field-row g-3">
<div className="row g-3 align-items-center">
              {/* SELECT FIELD */}
              <div className="col-md-2">
           
                <select
                  className="form-select rounded-pill"
                  value={field.master_field}
                  onChange={(e) =>
                    handleFieldChange(originalIndex, "master_field", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {fieldList
                  .filter((field)=>field.field_code !==mandatoryField)
                  .map((item) => (
                    <option key={item.fid} value={item.field_name}>
                      {item.field_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* LABEL */}
              <div className="col-md-2">
         
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={field.label}
                  onChange={(e) =>
                    handleFieldChange(originalIndex, "label", e.target.value)
                  }
                />
              </div>

              {/* PLACEHOLDER */}
              <div className="col-md-2">
    
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={field.placeholder}
                  onChange={(e) =>
                    handleFieldChange(originalIndex, "placeholder", e.target.value)
                  }
                />
              </div>

              {/* TYPE */}
              <div className="col-md-2">
           
                <select
                  className="form-select rounded-pill"
                  value={field.field_type}
                  onChange={(e) =>
                    handleFieldChange(originalIndex, "field_type", e.target.value)
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
         
                <select
                  className="form-select rounded-pill"
                  value={field.is_required}
                  onChange={(e) =>
                    handleFieldChange(originalIndex, "is_required", e.target.value)
                  }
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>

              {/* ORDER */}
              <div className="col-md-1">
              
                <input
                  type="number"
                  className="form-control rounded-pill text-center"
                  value={field.order_index}
                  onChange={(e) =>
                    handleFieldChange(originalIndex, "order_index", e.target.value)
                  }
                />
              </div>
                    <div className="col-md-1 d-flex align-items-center justify-content-center">
  <button
    className="remove-icon-btn"
    onClick={() => handleRemoveField(originalIndex)}
  >
    <FiTrash2 size={16} />
  </button>
</div>
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
                    handleFieldChange(originalIndex, "options_json", e.target.value)
                  }
                />
              </div>
            )}

   
          </div>
        ))}
        {/* SUBMIT BUTTON */}
        <div className="d-flex justify-content-end mt-4">
          <button
            className=" save-btn rounded-pill px-4"
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