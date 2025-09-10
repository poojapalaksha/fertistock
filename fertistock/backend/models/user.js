// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   userId: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, required: true } // 'admin' or 'worker'
// });

// module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
}, { collection: 'user' });  // specify collection if needed

module.exports = mongoose.model('User', UserSchema);
