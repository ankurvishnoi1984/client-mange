import ActionMenu from "./ActionMenu";

export default function ClientTable({ clients, onEdit, onDeactivate }) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-center">Shortcode</th>
            <th className="p-4 text-center">Contact Person</th>
            <th className="p-4 text-center">Contact Number</th>
            <th className="p-4 text-center">Domain</th>
            <th className="p-4 text-center">Multi Session</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-t hover:bg-gray-50">
              <td className="p-4">{client.name}</td>
              <td className="p-4 text-center">{client.shortcode}</td>
              <td className="p-4 text-center">{client.contactperson}</td>
              <td className="p-4 text-center">{client.contactnumber}</td>
              <td className="p-4 text-center">{client.domain_url}</td>

              <td className="p-4 text-center">
                {client.isallowmultisession ? "Yes" : "No"}
              </td>

              <td className="p-4 text-center">
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
  );
}
