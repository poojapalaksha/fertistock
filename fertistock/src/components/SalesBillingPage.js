import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SalesBillingPage.css';

function SalesBillingPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [billItems, setBillItems] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
    const [suggestions, setSuggestions] = useState([]);
    const [expiredSearchMessage, setExpiredSearchMessage] = useState('');

    const navigate = useNavigate();

    const fetchStock = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/fertilizers/all');
            if (!response.ok) throw new Error('Failed to fetch fertilizers');
            const data = await response.json();
            const products = data.map(fert => ({
                _id: fert._id,
                name: fert.fertilizerName,
                stock: fert.quantityReceived,
                price: fert.price || 2000,
                expiryDate: fert.expiryDate,
            }));
            setAvailableProducts(products);
        } catch (error) {
            console.error('Error fetching fertilizers:', error);
        }
    };

    useEffect(() => {
        fetchStock();
    }, []);

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        const today = new Date().toISOString().split('T')[0];
        return expiryDate < today;
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setExpiredSearchMessage('');

        if (term.length > 0) {
            const groupedProducts = availableProducts.reduce((acc, product) => {
                if (isExpired(product.expiryDate)) return acc;

                if (acc[product.name]) {
                    acc[product.name].stock += product.stock;
                } else {
                    acc[product.name] = { ...product, stock: product.stock };
                }
                return acc;
            }, {});

            const filteredSuggestions = Object.values(groupedProducts).filter(
                p => p.name.toLowerCase().includes(term.toLowerCase()) && p.stock > 0
            );

            setSuggestions(filteredSuggestions);

            // check if searched term matches any expired product
            const expiredMatch = availableProducts.find(p =>
                p.name.toLowerCase() === term.toLowerCase() &&
                isExpired(p.expiryDate)
            );

            if (expiredMatch) {
                setExpiredSearchMessage(
                    `Product ${expiredMatch.name} is expired. Sale cannot be done.`
                );
            } else if (filteredSuggestions.length === 0) {
                setExpiredSearchMessage('');
            }

        } else {
            setSuggestions([]);
            setExpiredSearchMessage('');
        }

        setSelectedProduct(null);
        setQuantity('');
    };

    const handleSelectSuggestion = (productName) => {
        setSearchTerm(productName);

        const matchedProducts = availableProducts.filter(
            p => p.name.toLowerCase() === productName.toLowerCase()
        );

        if (matchedProducts.length > 0) {
            const totalStock = matchedProducts.reduce((sum, p) => sum + p.stock, 0);
            const representative = {
                ...matchedProducts[0],
                stock: totalStock
            };
            setSelectedProduct(representative);
        } else {
            setSelectedProduct(null);
        }

        setSuggestions([]);
        setQuantity('');
        setExpiredSearchMessage('');
    };

    const handleAddToCart = () => {
        if (!selectedProduct) {
            alert('Please search and select a product.');
            return;
        }

        if (isExpired(selectedProduct.expiryDate)) {
            alert(`Cannot add product ${selectedProduct.name} because it is expired.`);
            return;
        }

        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            alert('Please enter a valid quantity.');
            return;
        }
        if (parsedQuantity > selectedProduct.stock) {
            alert(`Only ${selectedProduct.stock} bags available.`);
            return;
        }

        const existingItem = billItems.find(item => item.name === selectedProduct.name);
        if (existingItem) {
            const newQuantity = existingItem.quantity + parsedQuantity;
            if (newQuantity > selectedProduct.stock) {
                alert(`Cannot add more than ${selectedProduct.stock} bags.`);
                return;
            }
            setBillItems(billItems.map(item =>
                item.name === selectedProduct.name ? { ...item, quantity: newQuantity } : item
            ));
        } else {
            setBillItems([...billItems, { ...selectedProduct, quantity: parsedQuantity }]);
        }

        setSearchTerm('');
        setSelectedProduct(null);
        setQuantity('');
        setSuggestions([]);
        setExpiredSearchMessage('');
    };

    const handleQuantityChange = (e) => {
        const val = e.target.value;
        setQuantity(val);
    };

    const handleRemoveItem = (productName) => {
        setBillItems(billItems.filter(item => item.name !== productName));
    };

    const subtotal = billItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.18;
    const tax = subtotal * taxRate;
    const grandTotal = subtotal + tax;

    const handleGenerateInvoice = async () => {
        if (billItems.length === 0) {
            alert('Add items to bill');
            return;
        }
        if (!customerName.trim()) {
            alert('Enter customer name');
            return;
        }
        if (!mobileNumber.trim()) {
            alert('Enter mobile number');
            return;
        }

        const invoiceData = {
            customerName,
            mobileNumber,
            items: billItems,
            date: saleDate,
            subtotal,
            tax,
            grandTotal
        };

        try {
            const response = await fetch('http://localhost:5000/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Invoice generation failed');
            }

            await response.json();
            alert('Invoice generated and stock updated!');

            setBillItems([]);
            setCustomerName('');
            setMobileNumber('');
            setSearchTerm('');
            setSelectedProduct(null);
            setQuantity('');
            setSuggestions([]);
            setExpiredSearchMessage('');

            await fetchStock();

            navigate('/invoice', { state: { invoice: invoiceData } });

        } catch (error) {
            console.error('Error generating invoice:', error);
            alert(`Failed to generate invoice: ${error.message}`);
        }
    };

    return (
        <div className="sales-billing-container">
            <div className="sidebar">
                <div className="logo">FertiStock</div>
                <ul className="nav-links">
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/inventory">Inventory</Link></li>
                    <li className="active"><Link to="/sales">Sales</Link></li>
                    <li><Link to="/stock">Stock</Link></li>
                    <li><Link to="/notifications">Notifications</Link></li>
                    <li><Link to="/">Logout</Link></li>
                </ul>
            </div>

            <div className="main-content">
                <header>
                    <h2>Sales & Billing</h2>
                </header>

                <div className="sales-billing-body">
                    <div className="product-selection">
                        <div className="search-input">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            {suggestions.length > 0 && searchTerm.length > 0 && (
                                <ul className="suggestions-list">
                                    {suggestions.map(product => (
                                        <li key={product._id} onClick={() => handleSelectSuggestion(product.name)}>
                                            {product.name} (Total Stock: {product.stock})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {expiredSearchMessage && (
                            <div className="search-results" style={{ color: 'red', fontWeight: 'bold' }}>
                                {expiredSearchMessage}
                            </div>
                        )}

                        {!expiredSearchMessage && selectedProduct && (
                            <div className="search-results">
                                <div><strong>Product:</strong> {selectedProduct.name}</div>
                                <div><strong>Stock:</strong> {selectedProduct.stock} bags</div>
                                <div><strong>Price:</strong> ₹ {selectedProduct.price}/bag</div>
                                {/* <div><strong>Expiry Date:</strong> {selectedProduct.expiryDate || "N/A"}</div> */}
                                {isExpired(selectedProduct.expiryDate) && (
                                    <div style={{ color: 'red', fontWeight: 'bold' }}>
                                        This product is expired and cannot be sold!
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedProduct && !isExpired(selectedProduct.expiryDate) && (
                            <div className="quantity-input">
                                <label htmlFor="quantity">Quantity:</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min="1"
                                    max={selectedProduct.stock}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                />
                                <button onClick={handleAddToCart}>Add to Cart</button>
                            </div>
                        )}

                        {!selectedProduct && !expiredSearchMessage && searchTerm && suggestions.length === 0 && (
                            <div className="search-results">No matching products found.</div>
                        )}
                    </div>

                    <div className="bill-summary">
                        <h3>Bill Summary</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billItems.map(item => (
                                    <tr key={item.name}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹ {item.price}</td>
                                        <td>₹ {(item.price * item.quantity).toFixed(2)}</td>
                                        <td>
                                            <button className="remove-item" onClick={() => handleRemoveItem(item.name)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                                {billItems.length === 0 && (
                                    <tr><td colSpan="5">No items in the cart.</td></tr>
                                )}
                            </tbody>
                        </table>

                        <div className="bill-totals">
                            <div className="total-item">
                                <span>Subtotal</span><span>₹ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="total-item">
                                <span>Tax (18%)</span><span>₹ {tax.toFixed(2)}</span>
                            </div>
                            <div className="total-item grand-total">
                                <span>Grand Total</span><span>₹ {grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="customer-details">
                        <h3>Customer Details</h3>
                        <div className="form-group">
                            <label htmlFor="customerName">Customer Name:</label>
                            <input
                                type="text"
                                id="customerName"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                placeholder="Enter Customer Name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mobileNumber">Mobile Number:</label>
                            <input
                                type="text"
                                id="mobileNumber"
                                value={mobileNumber}
                                onChange={e => setMobileNumber(e.target.value)}
                                placeholder="Enter Mobile Number"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="saleDate">Sale Date:</label>
                            <input
                                type="date"
                                id="saleDate"
                                value={saleDate}
                                onChange={e => setSaleDate(e.target.value)}
                            />
                        </div>
                        <button className="generate-button" onClick={handleGenerateInvoice}>
                            Generate Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SalesBillingPage;
