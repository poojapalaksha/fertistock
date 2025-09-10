// routes/fertilizers.js

const express = require('express');
const router = express.Router();
const Fertilizer = require('../models/Fertilizer'); // Assuming you have a Fertilizer model
const Notification = require('../models/Notification'); // Assuming you have a Notification model

// Define a threshold for low stock (e.g., 50 units)
const LOW_STOCK_THRESHOLD = 50;

// Helper function to create a notification
const createNotification = async (message, type, product, details = '') => {
  try {
    const newNotification = new Notification({
      message,
      type,
      product,
      details,
    });
    await newNotification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
    // Log the error but don't stop the main operation
  }
};

// GET all fertilizers (used by sales billing page to fetch stock)
router.get('/all', async (req, res) => {
  try {
    const fertilizers = await Fertilizer.find({});
    res.status(200).json(fertilizers);
  } catch (error) {
    console.error('Error fetching fertilizers:', error);
    res.status(500).json({ message: 'Server error while fetching fertilizers.' });
  }
});

// POST: Add a new fertilizer stock entry
router.post('/add', async (req, res) => {
  try {
    const { fertilizerName, quantityReceived, purchaseDate, invoiceNumber, expiryDate, price } = req.body;

    if (!fertilizerName || !quantityReceived || !purchaseDate || !invoiceNumber || !expiryDate || price === undefined) {
      return res.status(400).json({ message: 'All fields are required: fertilizerName, quantityReceived, purchaseDate, invoiceNumber, expiryDate, price.' });
    }

    // --- IMPORTANT: Ensure purchaseDate is stored consistently as UTC midnight ---
    // This takes the YYYY-MM-DD from the frontend and converts it to a Date object
    // representing the start of that day in UTC.
    const purchaseDateUTC = new Date(purchaseDate + 'T00:00:00.000Z');
    // Ensure expiryDate is also handled consistently if needed, though often just storing as date string is fine
    const expiryDateUTC = new Date(expiryDate + 'T00:00:00.000Z');


    const newFertilizer = new Fertilizer({
      fertilizerName,
      quantityReceived: Number(quantityReceived),
      purchaseDate: purchaseDateUTC, // Store the UTC date
      invoiceNumber,
      expiryDate: expiryDateUTC, // Store the UTC date
      price: Number(price)
    });

    await newFertilizer.save();

    // --- Create 'stockAdded' notification ---
    await createNotification(
      `New stock of ${fertilizerName} added. Quantity: ${quantityReceived} units.`,
      'stockAdded',
      fertilizerName,
      `Invoice: ${invoiceNumber}`
    );

    // After adding stock, check if the total quantity for this fertilizer is now low
    const totalCurrentQuantity = await Fertilizer.aggregate([
        { $match: { fertilizerName: fertilizerName } },
        { $group: { _id: null, total: { $sum: '$quantityReceived' } } }
    ]);
    const currentTotalQty = totalCurrentQuantity.length > 0 ? totalCurrentQuantity[0].total : 0;

    if (currentTotalQty <= LOW_STOCK_THRESHOLD) {
        // Check if an existing unread low stock notification already exists for this product
        const existingLowStockNotif = await Notification.findOne({
            product: fertilizerName,
            type: 'lowStock',
            read: false
        });
        if (!existingLowStockNotif) {
            await createNotification(
                `Low stock for ${fertilizerName}! Current quantity: ${currentTotalQty} units.`,
                'lowStock',
                fertilizerName,
                `Only ${currentTotalQty} units remaining after recent addition.`
            );
        }
    }


    res.status(201).json({ message: 'Fertilizer stock added successfully!', fertilizer: newFertilizer });
  } catch (error) {
    console.error('Error adding fertilizer stock:', error);
    res.status(500).json({ message: 'Server error while adding fertilizer stock.' });
  }
});

// GET: Inventory Summary (Total Quantity and Total Types)
router.get('/summary', async (req, res) => {
  try {
    const totalQuantityResult = await Fertilizer.aggregate([
      { $group: { _id: null, total: { $sum: '$quantityReceived' } } }
    ]);

    const totalTypesResult = await Fertilizer.aggregate([
      { $group: { _id: '$fertilizerName' } },
      { $count: 'total' }
    ]);

    const totalQuantity = totalQuantityResult.length > 0 ? totalQuantityResult[0].total : 0;
    const totalTypes = totalTypesResult.length > 0 ? totalTypesResult[0].total : 0;

    res.status(200).json({ totalQuantity, totalTypes });
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({ message: 'Server error while fetching inventory summary.' });
  }
});

// GET total quantity for each fertilizer type
router.get('/inventory-by-type', async (req, res) => {
    try {
        const inventoryByType = await Fertilizer.aggregate([
            {
                $group: {
                    _id: "$fertilizerName", // Group by fertilizerName
                    totalQuantity: { $sum: "$quantityReceived" } // Sum quantityReceived
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the default _id
                    name: "$_id", // Rename _id (which is fertilizerName) to 'name'
                    quantity: "$totalQuantity" // Rename totalQuantity to 'quantity'
                }
            },
            {
                $sort: { quantity: -1 } // Optional: Sort by quantity descending
            }
        ]);
        res.json(inventoryByType);
    } catch (err) {
        console.error('Error fetching inventory by type:', err.message);
        res.status(500).send('Server Error while fetching inventory by type');
    }
});

// NEW ROUTE: Get stock report by specific date (stock received on that date)
router.get('/stock-report-by-date', async (req, res) => {
    try {
        const { date } = req.query; // Get date from query parameters (e.g., ?date=YYYY-MM-DD)

        if (!date) {
            return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD).' });
        }

        // --- IMPORTANT: Ensure selectedDate is interpreted as UTC midnight ---
        // This explicitly tells JavaScript to parse "YYYY-MM-DD" as the start of that day in UTC.
        const selectedDate = new Date(date + 'T00:00:00.000Z');
        
        // Check if selectedDate is a valid date (e.g., prevents "Invalid Date" errors)
        if (isNaN(selectedDate.getTime())) {
            console.error(`Invalid date input for stock report: ${date}`);
            return res.status(400).json({ message: 'Invalid date format provided. Use YYYY-MM-DD.' });
        }

        // Calculate the end of the selected day in UTC (just before the next day starts in UTC)
        const endOfDay = new Date(selectedDate);
        endOfDay.setUTCDate(selectedDate.getUTCDate() + 1); // Increment day by 1 UTC day

        // *** IMPORTANT DEBUG LOG ***
        // Check your backend terminal for these logs!
        console.log(`[Backend Stock Report] Querying for dates between:`);
        console.log(`  Start (UTC): ${selectedDate.toISOString()}`);
        console.log(`  End (UTC, exclusive): ${endOfDay.toISOString()}`);
        console.log(`  Raw input date: ${date}`);


        // Find all stock entries (purchases) where purchaseDate falls on the selected day
        // Mongoose queries automatically handle Date objects against BSON Dates in MongoDB
        const stockEntries = await Fertilizer.find({
            purchaseDate: {
                $gte: selectedDate, // Greater than or equal to start of selected day (UTC)
                $lt: endOfDay,       // Less than start of next day (UTC)
            },
        }).sort({ purchaseDate: 1 }); // Sort by purchase date for chronological reports

        if (stockEntries.length === 0) {
            // Return 200 OK with empty array if no stock entries found for the date
            return res.status(200).json([]);
        }

        res.json(stockEntries);
    } catch (error) {
        console.error('Error fetching stock report by date:', error);
        res.status(500).json({ message: 'Server error while fetching stock report by date.', error: error.message });
    }
});


module.exports = router;