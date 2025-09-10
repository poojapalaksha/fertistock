import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './InventoryPage.css'; // Make sure this path is correct

function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryStatusFilter, setExpiryStatusFilter] = useState('');
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [searchTerm, expiryStatusFilter, inventory]);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchInventoryData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fertilizers/all');
      const data = await response.json();

      const today = new Date();

      const enriched = data
        .filter((item) => item.quantityReceived > 0)
        .map((item) => {
          const expiry = new Date(item.expiryDate);
          const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

          let status = 'Good';
          if (daysRemaining < 0) {
            status = 'Expired';
          } else if (daysRemaining <= 60) {
            status = 'Near Expiry';
          }

          return {
            id: item._id,
            name: item.fertilizerName || 'Unknown',
            quantity: item.quantityReceived || 0,
            expiry: formatDate(expiry),
            status,
          };
        });

      setInventory(enriched);
      setFilteredInventory(enriched);
    } catch (error) {
      console.error('Error fetching fertilizers:', error);
    }
  };

  const filterInventory = () => {
    const filtered = inventory.filter((item) => {
      const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = expiryStatusFilter === '' || item.status === expiryStatusFilter;
      return matchesName && matchesStatus;
    });
    setFilteredInventory(filtered);
  };

  return (
    <div className="inventory-container">
      <div className="sidebar">
        <div className="logo">FertiStock</div>
        <ul className="nav-links">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li className="active"><Link to="/inventory">Inventory</Link></li>
          <li><Link to="/sales">Sales</Link></li>
          <li><Link to="/stock">Stock</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </div>

      <div className="main-content">
        <header>
          <h2>Fertilizer Inventory</h2>
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={expiryStatusFilter}
              onChange={(e) => setExpiryStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option className="status-good" value="Good">Good</option>
              <option className="status-near-expiry" value="Near Expiry">Near Expiry</option>
              <option className="status-expired" value="Expired">Expired</option>
            </select>
          </div>
        </header>

        <div className="inventory-list">
          <table>
            <thead>
              <tr>
                <th>Fertilizer Name</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.expiry}</td>
                    <td className={`status-${item.status.toLowerCase().replace(' ', '-')}`}>
                      {/* THIS IS THE CHANGE: Wrap status text in a span for the badge */}
                      <span className="status-text-badge">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
                    No fertilizers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InventoryPage;