import { ThreeDotsVertical, PlusLg, Search } from "react-bootstrap-icons";
import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { BASEURL } from "../../constant";
import Select from "react-select";
import EditClientModal from "./EditModal";
import InfoModal from "./InfoModal";


export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const [clientsData, setClientsData] = useState(clients);
  const [editId, setEditId] = useState(null);

  const [userOptions, setUserOptions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");



  const [editModal, setEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [infoModal, setInfoModal] = useState(false);
  const [infoClient, setInfoClient] = useState(null);

  const openEdit = (client) => {
    setSelectedClient(client);
    setEditModal(true);
  };
  const openInfo = (client) => {
    setInfoClient(client);
    setInfoModal(true);
  };


  const [formData, setFormData] = useState({
    name: "",
    shortcode: "",
    contactperson: "",
    contactnumber: "",
    domain_url: "",
    layoutid: "",
    themeid: "",
    isallowmultisession: "Y",
    clientlogo: null,
  });
  useEffect(() => {
    if (clientSearch) {
      let timer = setTimeout(() => {
        fetchClients(page);

      }, 500)

      return () => {
        clearTimeout(timer)
      }
    }
    else {
      fetchClients(page);
    }
  }, [clientSearch, page]);

  const fetchClients = async (pageNumber) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/clients/getClientList?page=${pageNumber}&limit=${limit}&search=${clientSearch}`
      );

      setClients(res.data.data);
      setTotal(res.data.pagination.total);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async (search = "") => {
    try {
      const res = await axios.get(`${BASEURL}/users`, {
        params: {
          page: 1,
          limit: 20,
          search
        }
      });

      const options = res.data.data.map(u => ({
        value: u.userid,
        label: `${u.displayname} (${u.username})`
      }));

      setUserOptions(options);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };
  useEffect(() => {
    if (showModal) {
      fetchUsers();
    }
  }, [showModal])
  const totalPages = Math.ceil(total / limit);
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: checked ? "Y" : "N"
      }));
    }
    else if (type === "file") {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleClientSearch = (event) => {
    setClientSearch(event.target.value);
  }



  const handleSave = async () => {
    try {
      const data = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });

      data.append("createdby", 1);

      // ✅ STEP 1: create client
      const res = await axios.post(
        `${BASEURL}/clients/addNewClient`,
        data
      );

      const clientCode =
        res.data?.data?.client_code ||
        res.data?.client_code;

      // ✅ STEP 2: map users (ONLY if selected)
      if (selectedUsers.length > 0 && clientCode) {
        const mappings = selectedUsers.map(u => ({
          userid: u.value,
          client_code: clientCode,
          status: "Y",
          // createdby: 1
        }));

        await axios.post(
          `${BASEURL}/users/user-client-mapping`,
          { mappings }
        );
      }

      alert("Client created successfully");

      setSelectedUsers([]);
      setShowModal(false);

    } catch (err) {
      console.error(err);
      alert("Error creating client");
    } finally {
      fetchClients(page);
    }
  };

  const handleDisable = (id) => {
    setClientsData(
      clientsData.map((c) =>
        c.id === id ? { ...c, disabled: !c.disabled } : c
      )
    );
  };


  return (
    <>
      <div className="erp-page">

        {/* ================= Toolbar ================= */}
        <div className="toolbar">

          {/* Search */}
          <div className="search-box">
            <input type="text" placeholder="Search for..."  onChange={(e)=>handleClientSearch(e)}/>
            <button>
              <Search />
            </button>
          </div>

          {/* Create Client */}
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <PlusLg className="me-2" />
            Create Client
          </button>
        </div>


        {/* ================= Table ================= */}
        <div className="table-wrapper">

          <table className="erp-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>Shortcode</th>
                <th>Contact Person</th>
                <th>Contact Number</th>
                <th>Domain URL</th>
                <th>Multi Session</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No clients found
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr
                    key={c.client_code}   // 🔥 use API key directly
                    className={c.status === "N" ? "row-disabled" : ""}
                  >
                    <td className="fw-semibold">{c.name}</td>
                    <td>{c.shortcode}</td>
                    <td>{c.contactperson}</td>
                    <td>{c.contactnumber}</td>
                    <td className="text-primary">{c.domain_url}</td>

                    {/* Multi session badge */}
                    <td>
                      <span
                        className={
                          c.isallowmultisession === "Y"
                            ? "badge-success-soft"
                            : "badge-danger-soft"
                        }
                      >
                        {c.isallowmultisession === "Y" ? "Yes" : "No"}
                      </span>
                    </td>

                    {/* Action menu */}
                    <td className="text-center">
                      <div className="dropdown position-static">
                        <button
                          className="icon-menu-btn"
                          data-bs-toggle="dropdown"
                        >
                          <ThreeDotsVertical />
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end shadow">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => openInfo(c)}
                            >
                              Info
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => openEdit(c)}
                            >
                              Edit
                            </button>
                          </li>

                          <li>
                            <button
                              className="dropdown-item text-warning"
                              onClick={() => handleDisable(c.client_code)}
                            >
                              {c.status === "N" ? "Enable" : "Disable"}
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>


          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">

          <span className="text-muted">
            Page {page} of {totalPages}
          </span>

          <div className="d-flex gap-2">

            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>

            {[...Array(totalPages)].slice(0, 5).map((_, i) => {
              const pageNumber = i + 1;

              return (
                <button
                  key={pageNumber}
                  className={`btn btn-sm ${page === pageNumber
                    ? "btn-primary"
                    : "btn-outline-secondary"
                    }`}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>

          </div>
        </div>
      </div>
      {/* ========= Create Client Modal ========= */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Client</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>

            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Shortcode</Form.Label>
              <Form.Control name="shortcode" onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control name="contactperson" onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control name="contactnumber" onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Domain URL</Form.Label>
              <Form.Control name="domain_url" onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Select Users</Form.Label>

              <Select
                isMulti
                options={userOptions}
                value={selectedUsers}
                onChange={(selected) => setSelectedUsers(selected)}
                onInputChange={(input) => {
                  setUserSearch(input);
                  fetchUsers(input);
                }}
                placeholder="Search and select users..."
                noOptionsMessage={() => "No users found"}
              />
            </Form.Group>


            <Form.Check
              type="checkbox"
              label="Allow Multi Session"
              name="isallowmultisession"
              onChange={handleChange}
            />

          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button style={{ background: "#0b3a6f" }} onClick={handleSave}>
            Save Client
          </Button>
        </Modal.Footer>
      </Modal>

      <EditClientModal
        show={editModal}
        onClose={() => setEditModal(false)}
        client={selectedClient}
        BASEURL={BASEURL}
        onSuccess={fetchClients}
      />
      <InfoModal
        show={infoModal}
        onClose={() => setInfoModal(false)}
        client={infoClient}
        BASEURL={BASEURL}
      // onSuccess={fetchClients}
      />

    </>
  );
}
