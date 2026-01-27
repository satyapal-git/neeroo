const axios = require('axios');

// OTP Service Configuration
const OTP_CONFIG = {
  // For production, use a real SMS service like Twilio, MSG91, etc.
  SERVICE: process.env.SMS_SERVICE || 'console', // 'twilio', 'msg91', 'console'
  
  // Twilio Configuration
  TWILIO: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER
  },
  
  // MSG91 Configuration
  MSG91: {
    // apiKey: process.env.MSG91_API_KEY,
    apiKey: "469097AOyNKomwNo68c72227P1",
    senderId: process.env.MSG91_SENDER_ID || 'SPCPRD',
    route: process.env.MSG91_ROUTE || '4'
  },
  
  // Fast2SMS Configuration
  FAST2SMS: {
    apiKey: process.env.FAST2SMS_API_KEY,
    senderId: process.env.FAST2SMS_SENDER_ID || 'FSTSMS'
  }
};

/**
 * Send OTP via Console (for development)
 */
const sendOTPViaConsole = async (mobile, otp) => {
  try {
    console.log('\n🔐 =================================');
    console.log('📱 OTP SERVICE - DEVELOPMENT MODE');
    console.log('=================================');
    console.log(`📞 Mobile: +91${mobile}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log('⏰ Expires in: 10 minutes');
    console.log('=================================\n');
    
    return {
      success: true,
      message: 'OTP sent successfully (console)',
      service: 'console'
    };
  } catch (error) {
    console.error('Console OTP Error:', error);
    return {
      success: false,
      message: 'Failed to send OTP via console',
      error: error.message
    };
  }
};

/**
 * Send OTP via Twilio
 */
const sendOTPViaTwilio = async (mobile, otp) => {
  try {
    const { accountSid, authToken, fromNumber } = OTP_CONFIG.TWILIO;
    
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio configuration missing');
    }

    const client = require('twilio')(accountSid, authToken);
    
    const message = `Your Spice Paradise OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
    
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: `+91${mobile}`
    });
    
    console.log('Twilio SMS sent:', result.sid);
    
    return {
      success: true,
      message: 'OTP sent successfully via Twilio',
      service: 'twilio',
      messageId: result.sid
    };
    
  } catch (error) {
    console.error('Twilio OTP Error:', error);
    return {
      success: false,
      message: 'Failed to send OTP via Twilio',
      error: error.message
    };
  }
};

/**
 * Send OTP via MSG91
 */
const sendOTPViaMSG91 = async (mobile, otp) => {
  // try {
  //   const { apiKey, senderId, route } = OTP_CONFIG.MSG91;
    
  //   if (!apiKey) {
  //     throw new Error('MSG91 API key missing');
  //   }

  //   const message = `Your Spice Paradise OTP is ${otp}. Valid for 10 minutes. Do not share. - SPICE PARADISE`;
    
  //   const response = await axios.post('https://api.msg91.com/api/sendhttp.php', {
  //     params: {
  //       authkey: apiKey,
  //       mobiles: mobile,
  //       message: message,
  //       sender: senderId,
  //       route: route,
  //       country: '91'
  //     }
  //   });
    
  //   console.log('MSG91 Response:', response.data);
  //   console.log('MSG91 Response:', response.status);
    
  //   if (response.data && typeof response.data === "string" && !response.data.includes("error")) {
  //     return {
  //       success: true,
  //       message: 'OTP sent successfully via MSG91',
  //       service: 'msg91',
  //       response: response.data
  //     };
  //   } else {
  //     throw new Error(`MSG91 API error: ${response.data}`);
  //   }

    
  // } catch (error) {
  //   console.error('MSG91 OTP Error:', error);
  //   return {
  //     success: false,
  //     message: 'Failed to send OTP via MSG91',
  //     error: error.message
  //   };
  // }
  try {
    const response = await axios.post(
      "https://control.msg91.com/api/v5/otp",
      {
        template_id: "68c839e9d051293e944f3b76", // replace with your template ID
        mobile: `91${mobile}`,     // prefix with country code (91 for India)
        authkey: "469097AWIwts9D68c83db8P1",        // replace with your MSG91 auth key
        otp: otp,                        // you can generate your own OTP or let MSG91 generate
        realTimeResponse: 1          // set to true to get real-time response
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("OTP Sent:", response.data);
    console.log("response status:", response.status);
  } catch (error) {
    console.error("Error sending OTP:", error.response ? error.response.data : error.message);
  }
};

/**
 * Send OTP via Fast2SMS
 */
const sendOTPViaFast2SMS = async (mobile, otp) => {
  try {
    const { apiKey, senderId } = OTP_CONFIG.FAST2SMS;
    
    if (!apiKey) {
      throw new Error('Fast2SMS API key missing');
    }

    const message = `Your Spice Paradise OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
    
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      variables_values: otp,
      route: 'otp',
      numbers: mobile,
      message: message
    }, {
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Fast2SMS Response:', response.data);
    
    return {
      success: response.data.return,
      message: 'OTP sent successfully via Fast2SMS',
      service: 'fast2sms',
      response: response.data
    };
    
  } catch (error) {
    console.error('Fast2SMS OTP Error:', error);
    return {
      success: false,
      message: 'Failed to send OTP via Fast2SMS',
      error: error.message
    };
  }
};

/**
 * Validate Indian mobile number
 */
const validateMobileNumber = (mobile) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

/**
 * Generate OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  console.log('Generated OTP:', otp);
  return otp;
};

/**
 * Main function to send OTP
 */
const sendOTP = async (mobile, otp) => {
  try {
    // Validate mobile number
    if (!validateMobileNumber(mobile)) {
      console.log('Invalid mobile number:', mobile);
      return {
        success: false,
        message: 'Invalid mobile number format'
      };
    }

    // Send OTP based on configured service
    // switch (OTP_CONFIG.SERVICE.toLowerCase()) {
    //   case 'twilio':
    //     return await sendOTPViaTwilio(mobile, otp);
    //   case 'msg91':
    //     return await sendOTPViaMSG91(mobile, otp);
    //   case 'fast2sms':
    //     return await sendOTPViaFast2SMS(mobile, otp);
    //     case 'console':
    //       default:
    //         return await sendOTPViaConsole(mobile, otp);
    //       }
          console.log('sendOTP completed');
          const res =   await sendOTPViaMSG91(mobile, otp);
          console.log('res', res);
          return res;
    
  } catch (error) {
    console.error('Send OTP Error:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    };
  }
};

/**
 * Verify OTP format
 */
const verifyOTPFormat = (otp) => {
  return /^\d{6}$/.test(otp);
};

module.exports = {
  sendOTP,
  generateOTP,
  validateMobileNumber,
  verifyOTPFormat,
  OTP_CONFIG
};

sendOTP(9365946001, 324321); // For testing purpose only, remove in production