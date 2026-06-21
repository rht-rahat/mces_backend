const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  serviceName: { type: String, required: true },
  date: { type: String },
  message: { type: String },
  // নতুন স্ট্যাটাস ফিল্ড (বাই ডিফল্ট pending থাকবে)
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);