import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Create a function to access environment variables safely
const getEnvVar = (name: string, defaultValue: string = ''): string => {
  return process.env[name] || defaultValue;
};

// Set up transporter using environment variables directly
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: getEnvVar('GMAIL_USER', 'tb123983@gmail.com'),
    pass: getEnvVar('GMAIL_PASS', 'mnyp daku hnok soju')
  }
});

interface OTPData {
  email: string;
  otp: string;
}

exports.sendOTPEmail = functions.https.onCall(async (request: functions.https.CallableRequest<OTPData>, context) => {
  try {
    const { email, otp } = request.data;

    // Validate input data
    if (!email || !otp) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'Email and OTP are required'
      );
    }

    const mailOptions = {
      from: getEnvVar('GMAIL_USER', 'tb123983@gmail.com'),
      to: email,
      subject: 'Your AdiVote Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Verification Code</h2>
          <p>Here is your verification code for AdiVote:</p>
          <h1 style="font-size: 32px; letter-spacing: 2px; background: #f3f4f6; padding: 20px; text-align: center;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new functions.https.HttpsError(
      'internal', 
      'Failed to send email: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});
