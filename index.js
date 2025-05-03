const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// origin: 'https://mindfull.co.in',
// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error('MongoDB connection error:', error));

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email Endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  try {
    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Save to database
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    // Send email
  // In your server.js, update the mailOptions in the /api/contact endpoint
const mailOptions = {
  from: `"Mindfull Contact Form" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #11526B; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Mindfull Creative Studio</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #11526B;">New Contact Form Submission</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; width: 30%; font-weight: bold;">Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td>
          </tr>
          <tr>
          <td style="padding: 8px; font-weight: bold; vertical-align: top;">Message:</td>
          <td style="padding: 8px;">${message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
      <p>This email was sent from the Mindfull website contact form.</p>
      <p>© ${new Date().getFullYear()} Mindfull Creative Studio. All rights reserved.</p>
      </div>
    </div>
  `,
};
// <tr>
//   <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
//   <td style="padding: 8px; border-bottom: 1px solid #eee;">${subject || 'Not specified'}</td>
// </tr>

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});