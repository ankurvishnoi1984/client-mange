import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import "./InfoCss.css"

const InfoModal = ({
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
    const InfoField = ({ label, value }) => (
        <div className="col-md-6">
            <div className="info-label">{label}</div>
            <div className="info-value">
                {value || <span style={{ color: "#6c757d" }}>—</span>}
            </div>
        </div>
    );


    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title style={{ fontWeight: 600 }}>
                    Client Info
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ background: "#f6f8fb" }}>
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 10,
                        padding: 20,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }}
                >
                    {/* ===== BASIC INFO ===== */}
                    <div className="row g-3">

                        <InfoField label="Name" value={formData.name} />
                        <InfoField label="Shortcode" value={formData.shortcode} />
                        <InfoField label="Contact Person" value={formData.contactperson} />
                        <InfoField label="Contact Number" value={formData.contactnumber} />
                        <InfoField label="Domain URL" value={formData.domain_url} />

                        <div className="col-md-6">
                            <div className="info-label">Allow Multi Session</div>
                            <div className="info-value">
                                {formData.isallowmultisession === "Y" ? (
                                    <span className="badge bg-success">Enabled</span>
                                ) : (
                                    <span className="badge bg-secondary">Disabled</span>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* ===== MAPPED USERS ===== */}
                    <div style={{ marginTop: 24 }}>
                        <div className="info-label mb-2">Mapped Users</div>

                        <div
                            style={{
                                minHeight: 48,
                                padding: 10,
                                border: "1px solid #e9ecef",
                                borderRadius: 8,
                                background: "#fafbfc",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8
                            }}
                        >
                            {selectedUsers?.length > 0 ? (
                                selectedUsers.map((user) => (
                                    <span
                                        key={user.value}
                                        style={{
                                            background: "#0b3a6f",
                                            color: "#fff",
                                            padding: "5px 12px",
                                            borderRadius: 20,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            letterSpacing: 0.2
                                        }}
                                    >
                                        {user.label}
                                    </span>
                                ))
                            ) : (
                                <span style={{ color: "#6c757d", fontSize: 13 }}>
                                    No users mapped
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );

};

export default InfoModal;
