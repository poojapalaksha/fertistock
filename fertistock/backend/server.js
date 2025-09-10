const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Import Routes =====
const loginRoute = require('./routes/login');
const adminRoute = require('./routes/admin');
const fertilizerRoute = require('./routes/fertilizers');
const salesRoute = require('./routes/sales');

// ===== Import Models =====
const User = require('./models/User');
const Fertilizer = require('./models/Fertilizer');
const notificationRoutes = require('./routes/notifications');


// ===== Mount Routes =====
app.use('/api', loginRoute);
app.use('/api', adminRoute);
app.use('/api/fertilizers', fertilizerRoute);
app.use('/api/sales', salesRoute);
app.use('/api/notifications', notificationRoutes);


// ===== Fertilizer Stock Route (for Stock Management Page) =====
app.get('/api/stock', async (req, res) => {
  try {
    const stockItems = await Fertilizer.find();
    res.json(stockItems);
  } catch (err) {
    console.error('Error fetching stock data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Fertilizer Inventory Route (for Inventory Page) =====
app.get('/api/fertilizers/all', async (req, res) => {
  try {
    const fertilizers = await Fertilizer.find();
    res.json(fertilizers);
  } catch (error) {
    console.error('Error fetching fertilizers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== MongoDB Connection and Server Start =====
mongoose.connect('mongodb://localhost:27017/fertistock', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');

  // ===== Create Default Admin User if Not Exists =====
  const defaultAdmin = await User.findOne({ userId: 'admin' });

  // if (!defaultAdmin) {
  //   const newAdmin = new User({
  //     userId: 'admin',
  //     password: 'admin123', // 🔐 Hash this in production
  //     role: 'admin',
  //   });
  //   await newAdmin.save();
  //   console.log('Default admin user created');
  // } else {
  //   console.log('Default admin user already exists');
  // }

  // ===== Start Server =====
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
