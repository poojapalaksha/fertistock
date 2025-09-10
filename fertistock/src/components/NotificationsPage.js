import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotificationsPage.css';

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('lowStock');

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/stock');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Group fertilizers by name and sum their quantities
        const quantityMap = {};
        res.data.forEach(item => {
          if (!quantityMap[item.fertilizerName]) {
            quantityMap[item.fertilizerName] = 0;
          }
          quantityMap[item.fertilizerName] += item.quantityReceived;
        });

        // Low stock notifications
        const lowStock = Object.entries(quantityMap)
          .filter(([_, totalQty]) => totalQty <= 50)
          .map(([fertilizerName, totalQty]) => ({
            id: fertilizerName + '-lowStock',
            type: 'lowStock',
            product: fertilizerName,
            details: `Total quantity remaining: ${totalQty} units`,
          }));

        // Expiring soon notifications (not yet expired)
        const expiring = res.data
          .filter(item => {
            if (!item.expiryDate) return false;
            const expiryDate = new Date(item.expiryDate);
            expiryDate.setHours(0, 0, 0, 0);
            const diffDays = (expiryDate - today) / (1000 * 60 * 60 * 24);
            return diffDays >= 0 && diffDays < 60;
          })
          .map(item => ({
            id: item._id + '-expiring',
            type: 'expiring',
            product: item.fertilizerName,
            details: `Expires in ${Math.ceil(
              (new Date(item.expiryDate) - today) / (1000 * 60 * 60 * 24)
            )} days`,
          }));

        // ✅ NEW - Expired notifications
        const expired = res.data
          .filter(item => {
            if (!item.expiryDate) return false;
            const expiryDate = new Date(item.expiryDate);
            expiryDate.setHours(0, 0, 0, 0);
            return expiryDate < today;
          })
          .map(item => ({
            id: item._id + '-expired',
            type: 'expired',
            product: item.fertilizerName,
            details: `has expired.`,
          }));

        setNotifications([...lowStock, ...expiring, ...expired]);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
  }, []);

  const lowStockCount = notifications.filter(n => n.type === 'lowStock').length;
  const expiringCount = notifications.filter(n => n.type === 'expiring').length;
  const expiredCount = notifications.filter(n => n.type === 'expired').length;

  const filteredNotifications = notifications.filter(n => n.type === activeTab);

  const handleIgnore = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleDismiss = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleRestock = () => navigate('/stock/entry');
  const handleReview = () => navigate('/inventory');

  return (
    <div className="notifications-container">
      <div className="sidebar">
        <div className="logo">FertiStock</div>
        <ul className="nav-links">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/inventory">Inventory</Link></li>
          <li><Link to="/sales">Sales</Link></li>
          <li><Link to="/stock">Stock</Link></li>
          <li className="active"><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </div>

      <div className="main-content">
        <header>
          <h2>Notifications</h2>
          <div className="notification-tabs">
            <button
              className={`tab ${activeTab === 'lowStock' ? 'active' : ''}`}
              onClick={() => setActiveTab('lowStock')}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              className={`tab ${activeTab === 'expiring' ? 'active' : ''}`}
              onClick={() => setActiveTab('expiring')}
            >
              Expiring Soon ({expiringCount})
            </button>
            <button
              className={`tab ${activeTab === 'expired' ? 'active' : ''}`}
              onClick={() => setActiveTab('expired')}
            >
              Expired ({expiredCount})
            </button>
          </div>
        </header>

        <div className="notifications-list">
          {filteredNotifications.length === 0 && <p>No new notifications.</p>}

          {filteredNotifications.map(notification => (
            <div key={notification.id} className={`notification-item ${notification.type}`}>
              <div className="notification-details">
                <strong>{notification.product}</strong> {notification.details}
              </div>
              <div className="notification-actions">
                {notification.type === 'lowStock' && (
                  <>
                    <button onClick={handleRestock}>Restock</button>
                    <button onClick={() => handleIgnore(notification.id)}>Ignore</button>
                  </>
                )}
                {notification.type === 'expiring' && (
                  <>
                    <button onClick={handleReview}>Review</button>
                    <button onClick={() => handleDismiss(notification.id)}>Dismiss</button>
                  </>
                )}
                {notification.type === 'expired' && (
                  <>
                    <button onClick={handleReview}>Review</button>
                    <button onClick={() => handleDismiss(notification.id)}>Dismiss</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
