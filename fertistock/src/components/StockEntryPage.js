import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StockEntryPage.css';

export const StockEntryPage = () => {
  const [fertilizerName, setFertilizerName] = useState('');
  const [quantityReceived, setQuantityReceived] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [price, setPrice] = useState(''); // State for price
  const [expiryDate, setExpiryDate] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Define predefined prices for each fertilizer type
  const fertilizerPrices = {
    "urea": 1000, // Example price within range
    "dap": 1500,
    "mop": 900,
    "npk": 1200,
    "ammonium_sulphate": 950,
    "calcium_nitrate": 1100,
    "zinc_sulphate": 1800,
    "potash": 850,
    "ssp": 900,
    "boronated": 1600,
    // Add more as needed
  };

  // Effect to calculate expiry date based on purchase date
  useEffect(() => {
    if (purchaseDate) {
      const purchase = new Date(purchaseDate);
      purchase.setFullYear(purchase.getFullYear() + 2); // 2 years from purchase date
      const yyyy = purchase.getFullYear();
      const mm = String(purchase.getMonth() + 1).padStart(2, '0');
      const dd = String(purchase.getDate()).padStart(2, '0');
      setExpiryDate(`${yyyy}-${mm}-${dd}`);
    } else {
      setExpiryDate('');
    }
  }, [purchaseDate]);

  // Effect to set price when fertilizerName changes
  useEffect(() => {
    if (fertilizerName && fertilizerPrices[fertilizerName]) {
      setPrice(fertilizerPrices[fertilizerName]);
    } else {
      setPrice(''); // Clear price if no fertilizer selected or price not found
    }
  }, [fertilizerName]); // Depend on fertilizerName

  const validateForm = () => {
    const errors = {};
    const numericPrice = Number(price); // Convert price to number for validation

    if (!fertilizerName.trim()) errors.fertilizerName = 'Fertilizer name is required';
    if (!quantityReceived || isNaN(quantityReceived) || Number(quantityReceived) <= 0) {
      errors.quantityReceived = 'Quantity must be a valid positive number';
    }

    // Price validation with min/max range
    if (!price || isNaN(numericPrice) || numericPrice <= 0) {
      errors.price = 'Price must be a valid positive number';
    } else if (numericPrice < 800) {
      errors.price = 'Price cannot be less than ₹800';
    } else if (numericPrice > 2000) {
      errors.price = 'Price cannot be more than ₹2000';
    }

    if (!purchaseDate) errors.purchaseDate = 'Purchase date is required';
    if (!invoiceNumber.trim()) errors.invoiceNumber = 'Invoice number is required';

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const newEntry = {
      fertilizerName,
      quantityReceived: Number(quantityReceived),
      price: Number(price), // Ensure price is sent as a number
      purchaseDate,
      invoiceNumber,
      expiryDate,
    };

    try {
      const response = await fetch('http://localhost:5000/api/fertilizers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Stock added successfully!');
        navigate('/stock');
      } else {
        alert(result.message || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong while adding the stock');
    }
  };

  return (
    <div className="stock-management-container">
      <div className="sidebar">
        <div className="logo">FertilizerStock</div>
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
        <div className="stockEntryContainer">
          <h2 className="stockEntryTitle">Stock Entry</h2>
          <p className="stockEntryDescription">Record new fertilizer stock arrivals and update inventory</p>

          <form onSubmit={handleSubmit} className="stockEntryForm">
            <div className="formGroup">
              <label htmlFor="fertilizerName" className="label">Fertilizer Name</label>
              <select
                id="fertilizerName"
                value={fertilizerName}
                onChange={(e) => setFertilizerName(e.target.value)}
                className={formErrors.fertilizerName ? 'error' : ''}
              >
                <option value="">Select Fertilizer</option>
                <option value="urea">Urea</option>
                <option value="dap">DAP</option>
                <option value="mop">MOP</option>
                <option value="npk">NPK</option>
                <option value="ammonium_sulphate">Ammonium Sulphate</option>
                <option value="calcium_nitrate">Calcium Nitrate</option>
                <option value="zinc_sulphate">Zinc Sulphate</option>
                <option value="potash">Potash</option>
                <option value="ssp">Single Super Phosphate (SSP)</option>
                <option value="boronated">Boronated Fertilizer</option>
              </select>
              {formErrors.fertilizerName && <p className="error">{formErrors.fertilizerName}</p>}
            </div>

            <div className="formGroup">
              <label htmlFor="quantityReceived" className="label">Quantity Received (kg)</label>
              <input
                type="number"
                id="quantityReceived"
                value={quantityReceived}
                onChange={(e) => setQuantityReceived(e.target.value)}
                placeholder="Enter quantity"
                className={formErrors.quantityReceived ? 'input error' : 'input'}
              />
              {formErrors.quantityReceived && <p className="error">{formErrors.quantityReceived}</p>}
            </div>

            <div className="formGroup">
              <label htmlFor="price" className="label">Price per unit (₹)</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price per unit"
                className={formErrors.price ? 'input error' : 'input'}
              />
              {formErrors.price && <p className="error">{formErrors.price}</p>}
            </div>

            <div className="formGroup">
              <label htmlFor="purchaseDate" className="label">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className={formErrors.purchaseDate ? 'input error' : 'input'}
              />
              {formErrors.purchaseDate && <p className="error">{formErrors.purchaseDate}</p>}
            </div>

            <div className="formGroup">
              <label htmlFor="expiryDate" className="label">Expiry Date (Auto-calculated)</label>
              <input
                type="date"
                id="expiryDate"
                value={expiryDate}
                disabled
                className="input"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="invoiceNumber" className="label">Invoice Number</label>
              <input
                type="text"
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Enter invoice number"
                className={formErrors.invoiceNumber ? 'input error' : 'input'}
              />
              {formErrors.invoiceNumber && <p className="error">{formErrors.invoiceNumber}</p>}
            </div>

            <button type="submit" className="addToInventoryButton">
              + Add to Inventory
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockEntryPage;