// routes/reports.js
const express = require('express');
const PDFDocument = require('pdfkit'); // Make sure you have 'pdfkit' installed (npm install pdfkit)
const Sale = require('../models/Sales'); // Assuming your Sale model is in ../models/Sales.js
const Fertilizer = require('../models/Fertilizer'); // Assuming your Fertilizer model is in ../models/Fertilizer.js

const router = express.Router();

/**
 * Helper function to add a header to the PDF document.
 * @param {PDFDocument} doc - The PDF document instance.
 * @param {string} title - The title of the report.
 */
const addReportHeader = (doc, title) => {
    doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.moveDown(2);
};

/**
 * Generates a PDF report for sales data.
 * This endpoint fetches all sales and streams a PDF to the client.
 */
router.get('/sales-pdf', async (req, res) => {
    try {
        const sales = await Sale.find({}).sort({ date: 1 }); // Fetch all sales, sorted by date

        const doc = new PDFDocument();
        // Set HTTP headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"'); // Forces download with a filename
        doc.pipe(res); // Pipe the PDF document directly to the response stream

        addReportHeader(doc, 'Sales Report');

        if (sales.length === 0) {
            console.log('No sales data found for PDF report.'); // Added for debugging
            doc.fontSize(14).text('No sales data available.', { align: 'center' });
        } else {
            // Table Headers
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Date', 50, doc.y, { width: 80, align: 'left' });
            doc.text('Customer', 130, doc.y, { width: 120, align: 'left' });
            doc.text('Mobile', 250, doc.y, { width: 80, align: 'left' });
            doc.text('Items', 330, doc.y, { width: 150, align: 'left' });
            doc.text('Total (INR)', 480, doc.y, { width: 80, align: 'right' });
            doc.moveDown(0.5);
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.font('Helvetica');
            let totalGrandSales = 0;

            // Table Rows
            sales.forEach(sale => {
                const saleDate = new Date(sale.date).toLocaleDateString();
                const customerName = sale.customerName;
                const mobileNumber = sale.mobileNumber;
                // Format items for display in a single cell
                const itemsList = sale.items.map(item => `${item.fertilizerName} (${item.quantity} units)`).join(', ');
                const totalAmount = sale.totalAmount.toFixed(2); // Assuming totalAmount is stored with tax

                doc.fontSize(9);
                // Check if current position is too low for the next row, add new page if needed
                if (doc.y + 20 > doc.page.height - doc.page.margins.bottom) { // 20 is an estimate for row height
                    doc.addPage();
                    addReportHeader(doc, 'Sales Report (Continued)');
                    doc.fontSize(10).font('Helvetica-Bold');
                    doc.text('Date', 50, doc.y, { width: 80, align: 'left' });
                    doc.text('Customer', 130, doc.y, { width: 120, align: 'left' });
                    doc.text('Mobile', 250, doc.y, { width: 80, align: 'left' });
                    doc.text('Items', 330, doc.y, { width: 150, align: 'left' });
                    doc.text('Total (INR)', 480, doc.y, { width: 80, align: 'right' });
                    doc.moveDown(0.5);
                    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                    doc.moveDown(0.5);
                    doc.font('Helvetica');
                }

                doc.text(saleDate, 50, doc.y, { width: 80, align: 'left' });
                doc.text(customerName, 130, doc.y, { width: 120, align: 'left' });
                doc.text(mobileNumber, 250, doc.y, { width: 80, align: 'left' });
                doc.text(itemsList, 330, doc.y, { width: 150, align: 'left' });
                doc.text(totalAmount, 480, doc.y, { width: 80, align: 'right' });
                doc.moveDown(0.5);

                totalGrandSales += sale.totalAmount;

                // Add a line after each row for better readability
                doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);
            });

            doc.moveDown(1);
            doc.fontSize(12).font('Helvetica-Bold').text(`Grand Total Sales: INR ${totalGrandSales.toFixed(2)}`, { align: 'right' });
        }

        doc.end(); // Finalize the PDF document
    } catch (error) {
        console.error('Error generating sales PDF:', error);
        // Ensure an error response is sent even if PDF generation fails
        if (!res.headersSent) { // Prevent "Headers already sent" error
            res.status(500).json({ message: 'Error generating sales report PDF.' });
        }
    }
});

/**
 * Generates a PDF report for fertilizer inventory data.
 * This endpoint fetches aggregated inventory data and streams a PDF to the client.
 */
router.get('/inventory-pdf', async (req, res) => {
    try {
        // Aggregate total quantity for each fertilizer type
        const inventoryByType = await Fertilizer.aggregate([
            {
                $group: {
                    _id: "$fertilizerName",
                    totalQuantity: { $sum: "$quantityReceived" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    quantity: "$totalQuantity"
                }
            },
            {
                $sort: { name: 1 } // Sort by fertilizer name
            }
        ]);

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="inventory_report.pdf"');
        doc.pipe(res);

        addReportHeader(doc, 'Fertilizer Inventory Report');

        if (inventoryByType.length === 0) {
            console.log('No inventory data found for PDF report.'); // Added for debugging
            doc.fontSize(14).text('No inventory data available.', { align: 'center' });
        } else {
            // Table Headers
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Fertilizer Name', 50, doc.y, { width: 250, align: 'left' });
            doc.text('Total Quantity (Units)', 300, doc.y, { width: 250, align: 'right' });
            doc.moveDown(0.5);
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.font('Helvetica');
            let totalItems = 0;
            let totalOverallQuantity = 0;

            // Table Rows
            inventoryByType.forEach(item => {
                doc.fontSize(10);
                // Check if current position is too low for the next row, add new page if needed
                if (doc.y + 20 > doc.page.height - doc.page.margins.bottom) { // 20 is an estimate for row height
                    doc.addPage();
                    addReportHeader(doc, 'Fertilizer Inventory Report (Continued)');
                    doc.fontSize(10).font('Helvetica-Bold');
                    doc.text('Fertilizer Name', 50, doc.y, { width: 250, align: 'left' });
                    doc.text('Total Quantity (Units)', 300, doc.y, { width: 250, align: 'right' });
                    doc.moveDown(0.5);
                    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                    doc.moveDown(0.5);
                    doc.font('Helvetica');
                }

                doc.text(item.name, 50, doc.y, { width: 250, align: 'left' });
                doc.text(item.quantity.toString(), 300, doc.y, { width: 250, align: 'right' });
                doc.moveDown(0.5);

                totalItems++;
                totalOverallQuantity += item.quantity;

                // Add a line after each row for better readability
                doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);
            });

            doc.moveDown(1);
            doc.fontSize(12).font('Helvetica-Bold').text(`Total Fertilizer Types: ${totalItems}`, { align: 'right' });
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica-Bold').text(`Overall Total Quantity: ${totalOverallQuantity} units`, { align: 'right' });
        }

        doc.end(); // Finalize the PDF document
    } catch (error) {
        console.error('Error generating inventory PDF:', error);
        // Ensure an error response is sent even if PDF generation fails
        if (!res.headersSent) { // Prevent "Headers already sent" error
            res.status(500).json({ message: 'Error generating inventory report PDF.' });
        }
    }
});

module.exports = router;
