import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";

const EditClientModal = ({
    show,
    onClose,
    client,
    BASEURL,
    onSuccess
}) => {
    const [formData, setFormData] = useState({});
    const [userOptions, setUserOptions] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [originalUsers, setOriginalUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // ✅ handle input change
    /* const handleChange = (e) => {
         const { name, value, type, checked } = e.target;
 
         setFormData((prev) => ({
             ...prev,
             [name]:
                 type === "checkbox"
                     ? checked
                         ? "Y"
                         : "N"
                     : value,
         }));
     };*/

    const handleChange = (e) => {
        let { name, value, type, checked } = e.target;

        // ✅ checkbox
        if (type === "checkbox") {
            setFormData(prev => ({
                ...prev,
                [name]: checked ? "Y" : "N"
            }));
            return;
        }

        // =========================
        // 🔥 SANITIZATION
        // =========================

        // phone → digits only
        if (name === "contactnumber") {
            value = value.replace(/\D/g, "").slice(0, 10);
        }

        // shortcode → lowercase + no spaces + safe chars
        if (name === "shortcode") {
            value = value
                .toLowerCase()
                .replace(/\s/g, "")
                .replace(/[^a-z0-9_-]/g, "");
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // =========================
        // 🔥 INLINE VALIDATION
        // =========================

        let errorMsg = "";

        if (name === "contactnumber" && value) {
            if (!/^[6-9]\d{9}$/.test(value)) {
                errorMsg = "Enter valid 10-digit mobile number";
            }
        }

        if (name === "shortcode" && value) {
            if (!/^[a-z0-9_-]+$/.test(value)) {
                errorMsg =
                    "Only lowercase letters, numbers, _ and - allowed";
            }
        }

        if (name === "domain_url" && value) {
            if (
                !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i.test(value)
            ) {
                errorMsg = "Enter valid URL";
            }
        }

        setErrors(prev => ({
            ...prev,
            [name]: errorMsg
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.shortcode?.trim()) {
            newErrors.shortcode = "Shortcode is required";
        } else if (!/^[a-z0-9_-]+$/.test(formData.shortcode)) {
            newErrors.shortcode =
                "Only lowercase letters, numbers, _ and - allowed";
        }

        if (!formData.contactnumber?.trim()) {
            newErrors.contactnumber = "Contact number is required";
        } else if (!/^[6-9]\d{9}$/.test(formData.contactnumber)) {
            newErrors.contactnumber =
                "Enter valid 10-digit mobile number";
        }

        if (formData.domain_url &&
            !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i.test(formData.domain_url)
        ) {
            newErrors.domain_url = "Enter valid URL";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ fetch users for dropdown
    const fetchUsers = async (search = "") => {
        try {
            const res = await axios.get(`${BASEURL}/users`, {
                params: { page: 1, limit: 20, search },
            });

            const options = res.data.data.map((u) => ({
                value: Number(u.userid),
                label: `${u.displayname}`,
            }));

            setUserOptions(options);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    // ✅ load client + mappings when opened
    useEffect(() => {
        if (!show || !client) return;

        const loadData = async () => {
            try {
                setFormData({
                    name: client.name,
                    shortcode: client.shortcode,
                    contactperson: client.contactperson,
                    contactnumber: client.contactnumber,
                    domain_url: client.domain_url,
                    isallowmultisession: client.isallowmultisession,
                });

                // 🔹 load mapped users
                const mapRes = await axios.get(
                    `${BASEURL}/users/user-client-mapping`,
                    { params: { client_code: client.client_code } }
                );

                const mapped = mapRes.data.data.map((u) => ({
                    value: Number(u.userid),
                    label: String(u.displayname || ""),
                }));

                setSelectedUsers(mapped);
                setOriginalUsers(mapped);
                setUserOptions(prev => {
                    const existingIds = new Set(prev.map(p => p.value));
                    const merged = [...prev];

                    mapped.forEach(m => {
                        if (!existingIds.has(m.value)) {
                            merged.push(m);
                        }
                    });

                    return merged;
                });
                fetchUsers();
            } catch (err) {
                console.error(err);
                alert("Failed to load client data");
            }
        };

        loadData();
    }, [show, client]);

    // ✅ update handler
    const handleUpdate = async () => {
        if (!validateForm()) return;
        try {
            setLoading(true);

            // 🔹 update client
            await axios.put(`${BASEURL}/clients/updateClient`, {
                ...formData,
                clientCode: client.client_code,
                // modifiedby: 1,
            });

            const originalIds = originalUsers.map((u) => u.value);
            const selectedIds = selectedUsers.map((u) => u.value);

            const toInsert = selectedIds.filter(
                (id) => !originalIds.includes(id)
            );

            const toDelete = originalIds.filter(
                (id) => !selectedIds.includes(id)
            );

            // 🔹 insert new mappings
            if (toInsert.length > 0) {
                const mappings = toInsert.map((userid) => ({
                    userid,
                    client_code: client.client_code,
                    status: "Y",
                }));

                await axios.post(`${BASEURL}/users/user-client-mapping`, {
                    mappings,
                });
            }

            // 🔹 delete removed mappings
            if (toDelete.length > 0) {
                await axios.post(`${BASEURL}/users/user-client-mapping/delete`, {
                    userids: toDelete,
                    client_code: client.client_code,
                });
            }

            alert("Client updated successfully");
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to update client");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Client</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            name="name"
                            value={formData.name || ""}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Shortcode</Form.Label>
                        <Form.Control
                            name="shortcode"
                            value={formData.shortcode || ""}
                            onChange={handleChange}
                            isInvalid={!!errors.shortcode}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.shortcode}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Contact Person</Form.Label>
                        <Form.Control
                            name="contactperson"
                            value={formData.contactperson || ""}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                            name="contactnumber"
                            value={formData.contactnumber || ""}
                            onChange={handleChange}
                            maxLength={10}
                            inputMode="numeric"
                            isInvalid={!!errors.contactnumber}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.contactnumber}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Domain URL</Form.Label>
                        <Form.Control
                            name="domain_url"
                            value={formData.domain_url || ""}
                            onChange={handleChange}
                            isInvalid={!!errors.domain_url}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.domain_url}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Mapped Users</Form.Label>
                        <Select
                            isMulti
                            options={userOptions}
                            value={selectedUsers}
                            onChange={(val) => setSelectedUsers(val || [])}
                            onInputChange={(inputValue, { action }) => {
                                if (action === "input-change") {
                                    fetchUsers(inputValue);
                                }
                                return inputValue;
                            }}
                            placeholder="Search users..."
                            noOptionsMessage={() => "No users found"}
                        />

                    </Form.Group>
                    <Form.Check
                        type="checkbox"
                        label="Allow Multi Session"
                        name="isallowmultisession"
                        checked={formData.isallowmultisession === "Y"}
                        onChange={handleChange}
                    />
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>

                <Button
                    style={{ background: "#0b3a6f" }}
                    onClick={handleUpdate}
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update Client"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditClientModal;
