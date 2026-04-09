import ActionMenu from "./ActionMenu";

export default function ClientTable({ clients, onEdit, onDeactivate }) {
  return (
    <div className="card shadow-sm">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase small">
            <tr>
              <th>Name</th>
              <th className="text-center">Shortcode</th>
              <th className="text-center">Contact Person</th>
              <th className="text-center">Contact Number</th>
              <th className="text-center">Domain</th>
              <th className="text-center">Multi Session</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td className="text-center">{client.shortcode}</td>
                <td className="text-center">{client.contactperson}</td>
                <td className="text-center">{client.contactnumber}</td>
                <td className="text-center">{client.domain_url}</td>

                <td className="text-center">
                  {client.isallowmultisession ? (
                    <span className="badge bg-success">Yes</span>
                  ) : (
                    <span className="badge bg-danger">No</span>
                  )}
                </td>

                <td className="text-center">
                  <ActionMenu
                    onEdit={() => onEdit(client)}
                    onDeactivate={() => onDeactivate(client.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}