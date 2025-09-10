const express = require('express');
const router = express.Router();
const Sale = require('../models/Sales');
const Stock = require('../models/Fertilizer'); // Renamed to Fertilizer for clarity

// --- CRITICAL HELPER FUNCTION ---
// This function ensures that any date (either from a 'YYYY-MM-DD' string or 'today')
// is consistently converted to the very beginning of that calendar day in UTC.
const getStartOfDayUTC = (dateString) => {
    let dateObj;
    if (dateString) {
        // If a date string (YYYY-MM-DD) is provided, parse it as UTC midnight.
        // E.g., "2025-05-26" + "T00:00:00.000Z" -> 2025-05-26T00:00:00.000Z
        dateObj = new Date(dateString + 'T00:00:00.000Z');
        console.log(`[getStartOfDayUTC] Input string: ${dateString}, Parsed as UTC: ${dateObj.toISOString()}`);
    } else {
        // If no date string (for 'today' or real-time sales), get current local date components,
        // then create a UTC date from them at midnight.
        const now = new Date();
        const localYear = now.getFullYear();
        const localMonth = now.getMonth();
        const localDay = now.getDate();
        dateObj = new Date(Date.UTC(localYear, localMonth, localDay, 0, 0, 0));
        console.log(`[getStartOfDayUTC] No input string, Current local date: ${now.toLocaleDateString()}, Converted to UTC: ${dateObj.toISOString()}`);
    }
    // Basic validation to ensure a valid date was created
    if (isNaN(dateObj.getTime())) {
        console.error(`[getStartOfDayUTC] Invalid Date created for input: ${dateString || 'current date'}`);
        throw new Error('Invalid date generated for internal use.');
    }
    return dateObj;
};

// POST: Create a new sale
router.post('/', async (req, res) => {
    try {
        const { customerName, mobileNumber, items, date } = req.body; // 'date' here should be 'YYYY-MM-DD' from frontend

        console.log(`[POST /api/sales] Received date from frontend: ${date}`);

        if (!customerName || !mobileNumber || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Missing required fields: customerName, mobileNumber, or items.' });
        }

        // PHASE 1: Validate all stock availability
        for (const item of items) {
            if (!item || !item.name || !item.quantity || item.quantity <= 0 || !item.price) {
                return res.status(400).json({ message: 'Each item must have a name, a positive quantity, and a price.' });
            }

            // Find all stock entries for the fertilizer by name and positive quantity
            const stockEntries = await Stock.find({ fertilizerName: item.name, quantityReceived: { $gt: 0 } }).sort({ purchaseDate: 1 });
            const totalAvailable = stockEntries.reduce((sum, stock) => sum + stock.quantityReceived, 0);

            if (totalAvailable < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${item.name}. Requested: ${item.quantity}, Available: ${totalAvailable}`,
                });
            }
        }

        // PHASE 2: Deduct quantities from stock (FIFO)
        for (const item of items) {
            let remainingQty = item.quantity;

            const stockEntries = await Stock.find({ fertilizerName: item.name, quantityReceived: { $gt: 0 } }).sort({ purchaseDate: 1 });

            for (const stock of stockEntries) {
                if (remainingQty <= 0) break; // All quantity deducted

                const deduction = Math.min(stock.quantityReceived, remainingQty);
                stock.quantityReceived -= deduction;
                remainingQty -= deduction;

                await stock.save();
            }
        }

        // Transform items array to match Sale model schema and calculate totalAmount on backend for robustness
        const saleItems = items.map(item => ({
            fertilizerName: item.name,
            quantity: item.quantity,
            pricePerUnit: item.price, // Use item.price which is sent from frontend
        }));

        const computedTotalAmount = saleItems.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
        const taxRate = 0.18; // 18% tax
        const totalAmountWithTax = computedTotalAmount * (1 + taxRate);

        // Determine the date to store for the sale - CRITICAL PART
        // This will be the beginning of the *calendar day* in UTC.
        const saleDateToStore = getStartOfDayUTC(date);
        console.log(`[POST /api/sales] Date to be stored in DB (UTC): ${saleDateToStore.toISOString()}`);


        // Save the sale record
        const newSale = new Sale({
            customerName,
            mobileNumber, // Include mobileNumber
            items: saleItems,
            totalAmount: totalAmountWithTax, // Calculated total with tax on backend
            date: saleDateToStore, // Use the date normalized to UTC start of day
            // Mongoose will automatically add 'createdAt' and 'updatedAt' if timestamps: true is in schema
        });

        await newSale.save();
        console.log(`[POST /api/sales] Sale saved successfully with ID: ${newSale._id} and date: ${newSale.date.toISOString()}`);

        res.status(201).json({ message: 'Sale recorded successfully', sale: newSale });
    } catch (error) {
        console.error('Error recording sale:', error);
        res.status(500).json({ message: 'Server error while recording sale.', error: error.message });
    }
});

// GET: Today's sales
router.get('/today', async (req, res) => {
    try {
        const startOfDay = getStartOfDayUTC(null); // Get start of current day in UTC
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCDate(startOfDay.getUTCDate() + 1); // Get start of next day in UTC

        console.log(`[GET /api/sales/today] Querying for: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

        const sales = await Sale.aggregate([
            {
                $match: {
                    date: { $gte: startOfDay, $lt: endOfDay }, // Query against the 'date' field
                },
            },
            {
                $unwind: '$items',
            },
            {
                $group: {
                    _id: null,
                    totalSales: {
                        $sum: {
                            $multiply: ['$items.quantity', '$items.pricePerUnit'],
                        },
                    },
                },
            },
        ]);

        const totalSales = sales[0]?.totalSales || 0;
        console.log(`[GET /api/sales/today] Found ${sales.length} sales records. Total: ${totalSales}`);
        res.json({ totalSales });
    } catch (error) {
        console.error("Error fetching today's sales:", error);
        res.status(500).json({ message: "Error fetching today's sales" });
    }
});

// GET: Weekly sales
router.get('/weekly', async (req, res) => {
    try {
        // Get the start of today in UTC
        const endOfTodayUTC = getStartOfDayUTC(null); // This is actually the start of current local calendar day in UTC
        const startOfNextDayUTC = new Date(endOfTodayUTC);
        startOfNextDayUTC.setUTCDate(endOfTodayUTC.getUTCDate() + 1); // Represents end of today

        // Get the start of 7 days ago (including today) in UTC
        const startOfLastWeekUTC = new Date(endOfTodayUTC);
        startOfLastWeekUTC.setUTCDate(endOfTodayUTC.getUTCDate() - 6); // 7 days ago including today

        console.log(`[GET /api/sales/weekly] Querying for: ${startOfLastWeekUTC.toISOString()} to ${startOfNextDayUTC.toISOString()}`);

        const sales = await Sale.aggregate([
            {
                $match: {
                    date: { $gte: startOfLastWeekUTC, $lt: startOfNextDayUTC }, // Query against 'date' field
                },
            },
            {
                $unwind: '$items',
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$date' }, // Group by the 'date' field
                    },
                    totalSales: {
                        $sum: {
                            $multiply: ['$items.quantity', '$items.pricePerUnit'],
                        },
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        console.log(`[GET /api/sales/weekly] Found ${sales.length} weekly sales records.`);
        res.json(sales);
    } catch (error) {
        console.error('Error fetching weekly sales:', error);
        res.status(500).json({ message: 'Error fetching weekly sales' });
    }
});

// NEW ROUTE: Get sales report by specific date
router.get('/report-by-date', async (req, res) => {
    try {
        const { date } = req.query; // Get date from query parameters (e.g., ?date=YYYY-MM-DD)

        console.log(`[GET /api/sales/report-by-date] Received date from frontend: ${date}`);

        if (!date) {
            return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD).' });
        }

        // Get the start of the selected day in UTC using the helper.
        // This will produce a date like 2025-05-26T00:00:00.000Z
        const startOfDayUTC = getStartOfDayUTC(date);

        // Calculate the end of the selected day in UTC (which is the start of the next day)
        const endOfDayUTC = new Date(startOfDayUTC);
        endOfDayUTC.setUTCDate(startOfDayUTC.getUTCDate() + 1); // Move to the next day

        console.log(`[GET /api/sales/report-by-date] Querying for date range (UTC): ${startOfDayUTC.toISOString()} to ${endOfDayUTC.toISOString()}`);


        const sales = await Sale.find({
            date: {
                $gte: startOfDayUTC, // Greater than or equal to the start of the day in UTC
                $lt: endOfDayUTC,    // Less than the start of the *next* day in UTC
            },
        }).sort({ date: 1 }); // Sort by the 'date' field for chronological reports

        console.log(`[GET /api/sales/report-by-date] Found ${sales.length} sales for date: ${date}`);

        if (sales.length === 0) {
            return res.status(404).json({ message: 'No sales found for the specified date.' });
        }

        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales report by date:', error);
        res.status(500).json({ message: 'Server error while fetching sales report by date.', error: error.message });
    }
});


module.exports = router;