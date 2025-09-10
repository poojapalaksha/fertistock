import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './StockManagementPage.css';

function StockManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [stockHistory, setStockHistory] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch fertilizer stock from backend
  const fetchStock = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fertilizers/all');

      if (!response.ok) {
        throw new Error('Failed to fetch fertilizers');
      }
      const data = await response.json();
      setStockHistory(data);
      setFilteredStock(data);
    } catch (error) {
      console.error('Error fetching fertilizers:', error);
    }
  };

  // Fetch stock on mount and when redirected with updated state
  useEffect(() => {
    fetchStock();
  }, []);

  // Refresh data when navigated back after update
  useEffect(() => {
    if (location.state?.updated) {
      navigate(location.pathname, { replace: true, state: {} });
      fetchStock();
    }
  }, [location.state, navigate, location.pathname]);

  // Filter whenever search, date or stock changes
  useEffect(() => {
    handleSearch();
  }, [searchTerm, invoiceDate, stockHistory]); // This useEffect will now automatically trigger filtering

  // Filter stock based on search term, date, and quantity > 0
  const handleSearch = () => {
    const filtered = stockHistory.filter(item => {
      const matchesProduct =
        searchTerm === '' ||
        item.fertilizerName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate =
        invoiceDate === '' ||
        (item.purchaseDate && item.purchaseDate.startsWith(invoiceDate));

      const hasQuantity = item.quantityReceived > 0;

      return matchesProduct && matchesDate && hasQuantity;
    });
    setFilteredStock(filtered);
  };

  // Navigate to Add Stock Entry page
  const handleAddStockClick = () => {
    navigate('/stock/entry');
  };

  // Reset filters and show full stock
  const handleReset = () => {
    setSearchTerm('');
    setInvoiceDate('');
    setFilteredStock(stockHistory.filter(item => item.quantityReceived > 0));
  };

  return (
    <div className="stock-management-container">
      <div className="sidebar">
        <div className="logo">FertiStock</div>
        <ul className="nav-links">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/inventory">Inventory</Link></li>
          <li><Link to="/sales">Sales</Link></li>
          <li className="active"><Link to="/stock">Stock</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </div>

      <div className="main-content">
        <header>
          <h2>Stock Management</h2>
          {/* <p>Track and manage your fertilizer stock purchases</p> */}
          <div className="stock-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search fertilizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="date-filter">
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            {/* Removed the Search button as requested */}
            <button className="reset-button" onClick={handleReset}>
              Reset
            </button>
            <button className="add-stock-button" onClick={handleAddStockClick}>
              + Add Stock
            </button>
          </div>
        </header>

        <div className="stock-history">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Purchase Date</th>
                <th>Expiry Date</th>
                <th>Invoice No</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.length > 0 ? (
                filteredStock.map((item) => (
                  <tr key={item._id || item.invoiceNumber}>
                    <td>{item.fertilizerName}</td>
                    <td>{item.quantityReceived}</td>
                    <td>{item.purchaseDate?.split('T')[0]}</td>
                    <td>{item.expiryDate?.split('T')[0]}</td>
                    <td>{item.invoiceNumber}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No matching stock entries found.
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

export default StockManagementPage;
