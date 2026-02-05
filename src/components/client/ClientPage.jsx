import { ThreeDotsVertical, PlusLg, Search } from "react-bootstrap-icons";
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";


export default function ClientsPage() {
  const clients = [
    {
      id: 1,
      name: "ABC Pharma",
      shortcode: "ABC",
      contactperson: "John Doe",
      contactnumber: "9876543210",
      domain_url: "abcpharma.com",
      isallowmultisession: true,
    },
    {
      id: 2,
      name: "Netcast Services",
      shortcode: "NET",
      contactperson: "Amit Sharma",
      contactnumber: "9123456780",
      domain_url: "netcastservice.com",
      isallowmultisession: false,
    },
  ];

  const [showModal, setShowModal] = useState(false);

const [clientsData, setClientsData] = useState(clients);
const [editId, setEditId] = useState(null);


const [form, setForm] = useState({
  name: "",
  shortcode: "",
  contactperson: "",
  contactnumber: "",
  domain_url: "",
  isallowmultisession: false,
  disabled: false,
});

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setForm({
    ...form,
    [name]: type === "checkbox" ? checked : value,
  });
};

const handleSave = () => {
  if (editId) {
    // update
    setClientsData(
      clientsData.map((c) =>
        c.id === editId ? { ...form, id: editId } : c
      )
    );
  } else {
    // add
    setClientsData([
      ...clientsData,
      { ...form, id: Date.now() },
    ]);
  }

  setShowModal(false);
  setEditId(null);

  setForm({
    name: "",
    shortcode: "",
    contactperson: "",
    contactnumber: "",
    domain_url: "",
    isallowmultisession: false,
    disabled: false,
  });
};

const handleEdit = (client) => {
  setForm(client);
  setEditId(client.id);
  setShowModal(true);
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
          <input placeholder="Search for..." />
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
            {clients.map((c) => (
       <tr key={c.id} className={c.disabled ? "row-disabled" : ""}>
                <td className="fw-semibold">{c.name}</td>
                <td>{c.shortcode}</td>
                <td>{c.contactperson}</td>
                <td>{c.contactnumber}</td>
                <td className="text-primary">{c.domain_url}</td>

                {/* status badge */}
                <td>
                  <span
                    className={
                      c.isallowmultisession
                        ? "badge-success-soft"
                        : "badge-danger-soft"
                    }
                  >
                    {c.isallowmultisession ? "Yes" : "No"}
                  </span>
                </td>

                {/* ===== 3 Dot Menu ===== */}
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
      onClick={() => handleEdit(c)}
    >
      Edit
    </button>
  </li>

  <li>
    <button
      className="dropdown-item text-warning"
      onClick={() => handleDisable(c.id)}
    >
      {c.disabled ? "Enable" : "Disable"}
    </button>
  </li>
</ul>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
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

    </>
  );
}
