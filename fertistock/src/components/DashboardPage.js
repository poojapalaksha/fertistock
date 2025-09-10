// components/DashboardPage.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DashboardPage.css'; // Make sure you have this CSS file

function DashboardPage() {
    const navigate = useNavigate();

    const [totalInventoryQuantity, setTotalInventoryQuantity] = useState(0);
    const [totalFertilizerTypes, setTotalFertilizerTypes] = useState(0);
    const [todaysSales, setTodaysSales] = useState(0);
    const [weeklySalesData, setWeeklySalesData] = useState([]);
    const [inventoryByTypeData, setInventoryByTypeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState("Guest"); // Placeholder, integrate actual user auth

    // STATES FOR SALES REPORT GENERATION
    const [reportDate, setReportDate] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);

    // NEW STATES FOR STOCK REPORT GENERATION
    const [stockReportDate, setStockReportDate] = useState('');
    const [stockReportLoading, setStockReportLoading] = useState(false);
    const [stockReportError, setStockReportError] = useState(null);

    const barColors = [
        '#B0E0E6', '#FFC0CB', '#DDA0DD', '#FFDAB9', '#ADD8E6',
        '#F0E68C', '#E6E6FA', '#FFEBCD', '#AFEEEE', '#F5DEB3',
    ];

    const getBarColor = (index) => {
        return barColors[index % barColors.length];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // You would fetch the actual username from your authentication system here
                setUsername("Admin User"); // Example

                const inventoryRes = await fetch('http://localhost:5000/api/fertilizers/summary');
                if (!inventoryRes.ok) throw new Error('Failed to fetch inventory summary');
                const inventoryData = await inventoryRes.json();
                setTotalInventoryQuantity(inventoryData.totalQuantity || 0);
                setTotalFertilizerTypes(inventoryData.totalTypes || 0);

                const salesTodayRes = await fetch('http://localhost:5000/api/sales/today');
                if (!salesTodayRes.ok) throw new Error('Failed to fetch today\'s sales');
                const salesTodayData = await salesTodayRes.json();
                setTodaysSales(salesTodayData.totalSales || 0);

                const weeklySalesRes = await fetch('http://localhost:5000/api/sales/weekly');
                if (!weeklySalesRes.ok) throw new Error('Failed to fetch weekly sales');
                const weeklySalesDataRaw = await weeklySalesRes.json();

                const chartDataMap = new Map();
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalize to start of day

                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const formattedDate = date.toISOString().split('T')[0];
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    chartDataMap.set(formattedDate, { date: formattedDate, name: dayName, sales: 0 });
                }

                weeklySalesDataRaw.forEach(item => {
                    if (chartDataMap.has(item._id)) {
                        const existing = chartDataMap.get(item._id);
                        chartDataMap.set(item._id, { ...existing, sales: item.totalSales });
                    }
                });

                const sortedSalesData = Array.from(chartDataMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
                setWeeklySalesData(sortedSalesData);

                const inventoryByTypeRes = await fetch('http://localhost:5000/api/fertilizers/inventory-by-type');
                if (!inventoryByTypeRes.ok) throw new Error('Failed to fetch inventory by type');
                const inventoryByTypeDataRaw = await inventoryByTypeRes.json();
                setInventoryByTypeData(inventoryByTypeDataRaw);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Initialize report dates to today's date
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedToday = `${year}-${month}-${day}`;

        setReportDate(formattedToday); // Initialize sales report date
        setStockReportDate(formattedToday); // Initialize stock report date

    }, []);

    // Function to handle daily sales report generation
    const generateDailyReport = async () => {
        if (!reportDate) {
            setReportError('Please select a date for the sales report.');
            return;
        }

        setReportLoading(true);
        setReportError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/sales/report-by-date?date=${reportDate}`);
            const data = await response.json(); // Always try to parse JSON
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`[DashboardPage] No sales found for ${reportDate} (404 response). Navigating with empty data.`);
                    // >>> Sales report navigates to /report
                    navigate('/report', { state: { reportDate, dailyReport: [], reportType: 'sales' } });
                } else {
                    throw new Error(`Failed to fetch sales report: ${data.message || response.statusText}`);
                }
            } else {
                console.log('[DashboardPage] Navigating to Sales Report with state:', { reportDate, dailyReport: data, reportType: 'sales' });
                // >>> Sales report navigates to /report
                navigate('/report', { state: { reportDate, dailyReport: data, reportType: 'sales' } });
            }
        } catch (err) {
            console.error('Error fetching daily sales report:', err);
            setReportError(`Error generating sales report: ${err.message}`);
        } finally {
            setReportLoading(false);
        }
    };

    // NEW FUNCTION: Handle daily stock report generation
    const generateDailyStockReport = async () => {
        if (!stockReportDate) {
            setStockReportError('Please select a date for the stock report.');
            return;
        }

        setStockReportLoading(true);
        setStockReportError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/fertilizers/stock-report-by-date?date=${stockReportDate}`);
            const data = await response.json(); // Always try to parse JSON

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`[DashboardPage] No stock entries found for ${stockReportDate} (404 response). Navigating with empty data.`);
                    // >>> Stock report navigates to /reportpage
                    navigate('/reportpage', { state: { reportDate: stockReportDate, dailyReport: [], reportType: 'stock' } });
                } else {
                    throw new Error(`Failed to fetch stock report: ${data.message || response.statusText}`);
                }
            } else {
                console.log('[DashboardPage] Navigating to Stock Report with state:', { reportDate: stockReportDate, dailyReport: data, reportType: 'stock' });
                // >>> Stock report navigates to /reportpage
                navigate('/reportpage', { state: { reportDate: stockReportDate, dailyReport: data, reportType: 'stock' } });
            }
        } catch (err) {
            console.error('Error fetching daily stock report:', err);
            setStockReportError(`Error generating stock report: ${err.message}`);
        } finally {
            setStockReportLoading(false);
        }
    };


    const currentMaxSales = Math.max(...weeklySalesData.map(d => d.sales), 0);
    const displayMaxSales = Math.max(currentMaxSales * 1.1, 1);
    const midSales = displayMaxSales * 0.5;

    const currentMaxQuantity = Math.max(...inventoryByTypeData.map(d => d.quantity), 0);
    const displayMaxQuantity = Math.max(currentMaxQuantity * 1.1, 1);
    const midQuantity = displayMaxQuantity * 0.5;

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="sidebar">
                    <div className="logo">FertiStock</div>
                    <ul className="nav-links">
                        <li className="active"><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/inventory">Inventory</Link></li>
                        <li><Link to="/sales">Sales</Link></li>
                        <li><Link to="/stock">Stock</Link></li>
                        <li><Link to="/notifications">Notifications</Link></li>
                        <li><Link to="/">Logout</Link></li>
                    </ul>
                </div>
                <div className="main-content">
                    <header><h2>Dashboard Overview</h2></header>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="sidebar">
                    <div className="logo">FertiStock</div>
                    <ul className="nav-links">
                        <li className="active"><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/inventory">Inventory</Link></li>
                        <li><Link to="/sales">Sales</Link></li>
                        <li><Link to="/stock">Stock</Link></li>
                        <li><Link to="/notifications">Notifications</Link></li>
                        <li><Link to="/">Logout</Link></li>
                    </ul>
                </div>
                <div className="main-content">
                    <header><h2>Dashboard Overview</h2></header>
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="logo">FertiStock</div>
                <ul className="nav-links">
                    <li className="active"><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/inventory">Inventory</Link></li>
                    <li><Link to="/sales">Sales</Link></li>
                    <li><Link to="/stock">Stock</Link></li>
                    <li><Link to="/notifications">Notifications</Link></li>
                    <li><Link to="/">Logout</Link></li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <header>
                    <h2>Dashboard Overview</h2>
                    {/* <p className="welcome-message">Welcome, {username}!</p> */}
                </header>
                <div className="overview-cards">
                    {/* Inventory Level Card */}
                    <div className="card">
                        <div className="card-header">Total Inventory</div>
                        <div className="card-body">
                            <span className="value">{totalInventoryQuantity.toLocaleString()}</span>
                        </div>
                        <div className="card-footer">
                            <small>{totalFertilizerTypes} fertilizer types</small>
                        </div>
                    </div>

                    {/* Today's Sales Card */}
                    <div className="card">
                        <div className="card-header">Today's Sales</div>
                        <div className="card-body">
                            <span className="value">₹ {todaysSales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="card-footer">
                            <small>Total revenue generated today</small>
                        </div>
                    </div>
                </div>

                {/* Sales Over Last 7 Days Custom Bar Chart */}
                <div className="sales-chart chart-card">
                    <h3>Sales Over Last 7 Days</h3>
                    <div className="bar-chart-container">
                        <div className="y-axis">
                            <div className="y-label">{displayMaxSales > 0 ? `₹${displayMaxSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}</div>
                            <div className="y-label middle">{midSales > 0 ? `₹${midSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}</div>
                            <div className="y-label bottom">₹0</div>
                        </div>
                        <div className="bars-and-x-axis">
                            <div className="bars">
                                {weeklySalesData.map((dataPoint, index) => (
                                    <div key={index} className="bar-wrapper">
                                        <div
                                            className="bar"
                                            style={{
                                                height: `${(dataPoint.sales / displayMaxSales) * 100}%`,
                                                minHeight: dataPoint.sales > 0 ? '1px' : '0',
                                                backgroundColor: getBarColor(index)
                                            }}
                                            title={`Sales: ₹${dataPoint.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })} on ${dataPoint.name}`}
                                        >
                                            {dataPoint.sales > 0 && (
                                                <span className="bar-value">
                                                    ₹{dataPoint.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bar-label">{dataPoint.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Level by Fertilizer Type Chart */}
                <div className="inventory-chart chart-card">
                    <h3>Inventory Level by Fertilizer Type</h3>
                    <div className="bar-chart-container">
                        <div className="y-axis">
                            <div className="y-label">{displayMaxQuantity > 0 ? `${displayMaxQuantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}</div>
                            <div className="y-label middle">{midQuantity > 0 ? `${midQuantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}</div>
                            <div className="y-label bottom">0</div>
                        </div>
                        <div className="bars-and-x-axis">
                            <div className="bars">
                                {inventoryByTypeData.map((dataPoint, index) => (
                                    <div key={index} className="bar-wrapper">
                                        <div
                                            className="bar"
                                            style={{
                                                height: `${(dataPoint.quantity / displayMaxQuantity) * 100}%`,
                                                minHeight: dataPoint.quantity > 0 ? '1px' : '0',
                                                backgroundColor: getBarColor(index)
                                            }}
                                            title={`Quantity: ${dataPoint.quantity.toLocaleString(undefined, { maximumFractionDigits: 0 })} units of ${dataPoint.name}`}
                                        >
                                            {dataPoint.quantity > 0 && (
                                                <span className="bar-value">
                                                    {dataPoint.quantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bar-label">{dataPoint.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Sales Report Section */}
                <div className="daily-report-section chart-card">
                    <h3>Generate Daily Sales Report</h3>
                    <div className="report-controls">
                        <label htmlFor="reportDate">Select Date:</label>
                        <input
                            type="date"
                            id="reportDate"
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className="report-date-input"
                        />
                        <button
                            onClick={generateDailyReport}
                            className="generate-report-button"
                            disabled={reportLoading}
                        >
                            {reportLoading ? 'Generating...' : 'Generate Sales Report'}
                        </button>
                    </div>
                    {reportError && <p className="error-message">{reportError}</p>}
                </div>

                {/* NEW: Daily Stock Report Section */}
                <div className="daily-report-section chart-card">
                    <h3>Generate Daily Stock Report</h3>
                    <div className="report-controls">
                        <label htmlFor="stockReportDate">Select Date:</label>
                        <input
                            type="date"
                            id="stockReportDate"
                            value={stockReportDate}
                            onChange={(e) => setStockReportDate(e.target.value)}
                            className="report-date-input"
                        />
                        <button
                            onClick={generateDailyStockReport}
                            className="generate-report-button"
                            disabled={stockReportLoading}
                        >
                            {stockReportLoading ? 'Generating...' : 'Generate Stock Report'}
                        </button>
                    </div>
                    {stockReportError && <p className="error-message">{stockReportError}</p>}
                </div>

            </div>
        </div>
    );
}

export default DashboardPage; 