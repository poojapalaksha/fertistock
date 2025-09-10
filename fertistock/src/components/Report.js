import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Report.css';
function Report() {
    const location = useLocation();
    const navigate = useNavigate();
    const reportRef = useRef();

    const [dailyReport, setDailyReport] = useState(location.state?.dailyReport || null);
    
    const [reportDate, setReportDate] = useState(() => {
        const initialDate = location.state?.reportDate;
        if (initialDate) {
            return initialDate;
        } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReportData = async (date) => {
        if (!date) {
            setError("No report date selected.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            console.log(`[Report.js] Fetching report for date: ${date}`);
            const response = await fetch(`http://localhost:5000/api/sales/report-by-date?date=${date}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    setDailyReport([]);
                    console.warn(`[Report.js] No sales found for ${date} (404 response).`);
                    return;
                }
                throw new Error(`Failed to fetch report: ${response.statusText}`);
            }
            const data = await response.json();
            console.log(`[Report.js] Successfully fetched report data for ${date}:`, data);
            setDailyReport(data);
        } catch (err) {
            console.error('Error fetching daily report:', err);
            setError(`Error loading report: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reportDate) {
            fetchReportData(reportDate);
        } else {
            setError("No report date selected/available to fetch.");
        }
    }, [reportDate, location.state]);

    const totalSalesAmount = dailyReport ? dailyReport.reduce((sum, sale) => sum + sale.totalAmount, 0) : 0;
    const numberOfTransactions = dailyReport ? dailyReport.length : 0;

    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // PDF Download Handler (no changes needed here)
    const handleDownloadPdf = () => {
        if (!reportRef.current) return;
        html2canvas(reportRef.current, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const newImgWidth = imgWidth * ratio;
            const newImgHeight = imgHeight * ratio;
            const x = (pdfWidth - newImgWidth) / 2;
            const y = (pdfHeight - newImgHeight) / 2;
            pdf.addImage(imgData, 'PNG', x, y, newImgWidth, newImgHeight);
            pdf.save(`Daily_Sales_Report_${reportDate.replace(/-/g, '_')}.pdf`);
        });
    };

    // Print Handler (no changes needed here)
    const handlePrint = () => {
        if (!reportRef.current) return;
        const originalContents = document.body.innerHTML;
        const printContents = reportRef.current.outerHTML;

        const style = document.createElement('style');
        style.innerHTML = `
            body > *:not(.report-page-wrapper) { display: none !important; }
            .report-page-wrapper { margin: 0; padding: 0; width: 100%; }
            .report-actions { display: none; }
        `;
        document.head.appendChild(style);

        window.print();

        document.body.innerHTML = originalContents;
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    };

    if (loading) {
        return (
            <div className="report-page-wrapper">
                <div className="report-container no-report">
                    <p>Loading daily sales report...</p>
                    <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="report-page-wrapper">
                <div className="report-container no-report">
                    <h2>Error: {error}</h2>
                    <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="report-page-wrapper">
            <div className="report-container" ref={reportRef}>
                <div className="report-header">
                    <h2>Daily Sales Report</h2>
                    <h3>For: {formatDisplayDate(reportDate)}</h3>
                    <p className="company-info">Sri Anjaneya Agro Centre</p>
                    <p className="company-address">Surve No. 120/1A1,Near Allana Coffee Curing, H N Pura Road,Kanchanahalli. HAssan</p>
                    <p className="company-contact">Phone: +91 98765 43210 | Email: info@fertistock.com</p>
                </div>

                {dailyReport && dailyReport.length > 0 ? (
                    <>
                        <div className="report-summary">
                            <p><strong>Total Sales Amount:</strong> ₹{totalSalesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Number of Transactions:</strong> {numberOfTransactions}</p>
                        </div>

                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    {/* Removed the "Time" header */}
                                    <th>Customer Name</th>
                                    <th>Mobile No.</th>
                                    <th>Items</th>
                                    <th className="text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyReport.map((sale) => (
                                    <tr key={sale._id}>
                                        <td>{sale._id.substring(0, 8)}...</td>
                                        {/* Removed the time display cell */}
                                        <td>{sale.customerName || 'N/A'}</td>
                                        <td>{sale.mobileNumber || 'N/A'}</td>
                                        <td>
                                            <ul className="item-list">
                                                {sale.items.map((item, idx) => (
                                                    <li key={idx}>
                                                        {item.fertilizerName} ({item.quantity} units @ ₹{Number(item.pricePerUnit).toFixed(2)})
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="text-right">{Number(sale.totalAmount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <div className="no-report-data">
                        <p>No sales recorded for {formatDisplayDate(reportDate)}.</p>
                    </div>
                )}
            </div>

            <div className="report-actions">
                <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                {dailyReport && dailyReport.length > 0 && (
                    <>
                        <button className="download-button" onClick={handleDownloadPdf}>Download Report (PDF)</button>
                        <button className="print-button" onClick={handlePrint}>Print Report</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Report;