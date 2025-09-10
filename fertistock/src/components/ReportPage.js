import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './ReportPage.css'; // Assuming this is your correct CSS file name

function ReportPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const reportRef = useRef();

    const [reportType, setReportType] = useState(location.state?.reportType || 'sales');
    const [reportData, setReportData] = useState(location.state?.dailyReport || []);
    const [reportDate, setReportDate] = useState(location.state?.reportDate || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReportData = async (date, type) => {
        if (!date || !type) {
            setError("Missing report date or type.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setReportData([]); // Clear previous data

        let apiUrl = '';
        if (type === 'sales') {
            apiUrl = `http://localhost:5000/api/sales/report-by-date?date=${date}`;
        } else if (type === 'stock') {
            apiUrl = `http://localhost:5000/api/fertilizers/stock-report-by-date?date=${date}`;
        } else {
            setError("Invalid report type.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!response.ok) {
                // Handle specific HTTP status codes if needed
                if (response.status === 404 || (response.status === 200 && data.length === 0)) {
                    // If backend returns 200 with an empty array or 404 (though 200 empty array is preferred)
                    setReportData([]);
                } else {
                    throw new Error(data.message || `Server responded with status ${response.status}`);
                }
            } else {
                setReportData(data);
            }
        } catch (err) {
            console.error("Error fetching report data:", err); // Log the actual error
            setError(`Failed to load report: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const newDate = location.state?.reportDate;
        const newType = location.state?.reportType;
        const newData = location.state?.dailyReport;

        // Update state with data from location.state
        setReportDate(newDate || '');
        setReportType(newType || 'sales');

        // Only fetch if data wasn't passed in state (e.g., direct URL access or page refresh)
        // AND if a date and type are available
        if (newDate && newType && (newData === undefined || newData === null || newData.length === 0)) {
            // Check if initial data is empty or not provided, then fetch
            fetchReportData(newDate, newType);
        } else {
            // If data is already in state, just set it
            setReportData(newData || []);
        }

        setError(null); // Clear any previous errors on state change
    }, [location.state]); // Re-run effect when location.state changes

    // Calculate totals
    const totalSalesAmount = reportType === 'sales' && reportData ? reportData.reduce((sum, s) => sum + s.totalAmount, 0) : 0;
    const totalTransactions = reportType === 'sales' ? reportData.length : 0;
    const totalStockItems = reportType === 'stock' ? reportData.length : 0;
    const totalStockQty = reportType === 'stock' ? reportData.reduce((sum, i) => sum + i.quantityReceived, 0) : 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        // Ensure date is parsed correctly, especially if it's a raw date string from DB
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleDownloadPdf = () => {
        if (!reportRef.current) return;
        html2canvas(reportRef.current, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
            const imgWidth = canvas.width * ratio;
            const imgHeight = canvas.height * ratio;
            pdf.addImage(imgData, 'PNG', (pdfWidth - imgWidth) / 2, 10, imgWidth, imgHeight);
            const title = reportType === 'sales' ? 'Sales_Report' : 'Stock_Report';
            pdf.save(`${title}_${reportDate.replace(/-/g, '_')}.pdf`);
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const title = reportType === 'sales' ? 'Daily Sales Report' : 'Daily Stock Report (Received)';

    if (loading) return (
        <div className="report-page-wrapper">
            <div className="report-container no-report">
                <p>Loading {reportType} report...</p>
                {/* Keep a back button here for loading state */}
                <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        </div>
    );

    if (error) return (
        <div className="report-page-wrapper">
            <div className="report-container no-report">
                <h2>Error: {error}</h2>
                {/* Keep a back button here for error state */}
                <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        </div>
    );

    return (
        <div className="report-page-wrapper">
            {/* The report content */}
            <div className="report-container" ref={reportRef}>
                <div className="report-header">
                    <h2>{title}</h2>
                    <h3>For: {formatDate(reportDate)}</h3>
                    <p className="company-info">Sri Anjaneya Agro Centre</p>
                    <p className="company-address">Surve No. 120/1A1, Near Allana Coffee Curing, H N Pura Road, Kanchanahalli, Hassan</p>
                    <p className="company-contact">Phone: +91 98765 43210 | Email: info@fertistock.com</p>
                </div>

                {reportData && reportData.length > 0 ? (
                    <>
                        <div className="report-summary">
                            {reportType === 'sales' ? (
                                <>
                                    <p><strong>Total Sales Amount:</strong> ₹{totalSalesAmount.toFixed(2)}</p>
                                    <p><strong>Transactions:</strong> {totalTransactions}</p>
                                </>
                            ) : (
                                <>
                                    <p><strong>Total Stock Items Received:</strong> {totalStockItems}</p>
                                    <p><strong>Total Quantity Received:</strong> {totalStockQty} units</p>
                                </>
                            )}
                        </div>

                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>{reportType === 'sales' ? 'Transaction ID' : 'Fertilizer Name'}</th>
                                    {reportType === 'sales' && <th>Customer</th>}
                                    {reportType === 'sales' && <th>Mobile No.</th>}
                                    <th>{reportType === 'sales' ? 'Items' : 'Quantity Received'}</th>
                                    <th>{reportType === 'sales' ? 'Amount (₹)' : 'Purchase Date'}</th>
                                    {reportType === 'stock' && <th>Invoice No.</th>}
                                    {reportType === 'stock' && <th>Expiry Date</th>}
                                    {reportType === 'stock' && <th>Price/Unit (₹)</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {reportType === 'sales' && reportData.map((sale) => (
                                    <tr key={sale._id}>
                                        <td>{sale._id.slice(0, 8)}...</td>
                                        <td>{sale.customerName || 'N/A'}</td>
                                        <td>{sale.mobileNumber || 'N/A'}</td>
                                        <td>
                                            <ul className="item-list">
                                                {sale.items.map((item, idx) => (
                                                    <li key={idx}>
                                                        {item.fertilizerName} ({item.quantity} units @ ₹{item.pricePerUnit.toFixed(2)})
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td>₹{sale.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}

                                {reportType === 'stock' && reportData.map((entry, index) => (
                                    <tr key={entry._id || index}> {/* Use _id for key if available, fallback to index */}
                                        <td>{entry.fertilizerName}</td>
                                        <td>{entry.quantityReceived}</td>
                                        <td>{formatDate(entry.purchaseDate)}</td>
                                        <td>{entry.invoiceNumber}</td>
                                        <td>{formatDate(entry.expiryDate)}</td>
                                        <td>₹{entry.price !== undefined ? entry.price.toFixed(2) : 'N/A'}</td> {/* Corrected: use entry.price */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <div className="no-report">
                        <p>No {reportType} report available for {formatDate(reportDate)}</p>
                    </div>
                )}
            </div>

            {/* Move the actions div to the bottom of the report-page-wrapper */}
            <div className="report-actions">
                <button className="download-button" onClick={handleDownloadPdf}>Download PDF</button>
                <button className="print-button" onClick={handlePrint}>Print</button>
                <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        </div>
    );
}

export default ReportPage;