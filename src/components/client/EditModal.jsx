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

    // ✅ handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        console.log("{ name, value, type, checked }",{ name, value, type, checked })

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                        ? "Y"
                        : "N"
                    : value,
        }));
    };

    // ✅ fetch users for dropdown
    const fetchUsers = async (search = "") => {
        try {
            const res = await axios.get(`${BASEURL}/users`, {
                params: { page: 1, limit: 20, search },
            });

            const options = res.data.data.map((u) => ({
                value: Number(u.userid),
                label: `${u.displayname} (${u.username})`.trim(),
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
                    label: String(u.displayname || u.username || ""),
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
                        />
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
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Domain URL</Form.Label>
                        <Form.Control
                            name="domain_url"
                            value={formData.domain_url || ""}
                            onChange={handleChange}
                        />
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

                    {console.log("formData.isallowmultisession",formData)}
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
