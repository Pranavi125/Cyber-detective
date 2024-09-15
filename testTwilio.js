require('dotenv').config(); // Ensure you have the dotenv package installed
const twilio = require('twilio');

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
client.messages.create({
  body: 'Testing Twilio SMS!',
  from: process.env.TWILIO_PHONE_NUMBER, // Ensure this is in E.164 format (e.g., +1234567890)
  to: '+919246368451' // Replace with your phone number in E.164 format (e.g., +1234567890)
})
.then(message => console.log('Message sent:', message.sid))
.catch(error => console.error('Twilio Error:', error));
