const twilio = require('twilio');
const axios = require('axios');
const smsConfig = require('../config/otp.config');
const logger = require('../utils/logger.util');

class WhatsAppService {
  constructor() {
    this.provider = smsConfig.whatsappProvider;
    
    // Initialize Twilio client if configured
    if (this.provider === 'TWILIO' && smsConfig.twilio.accountSid) {
      this.twilioClient = twilio(
        smsConfig.twilio.accountSid,
        smsConfig.twilio.authToken
      );
    }
  }

  /**
   * Send WhatsApp message
   * @param {string} mobile - Mobile number (with country code)
   * @param {string} message - Message to send
   */
  async sendMessage(mobile, message) {
    try {
      // Format mobile number (add +91 if not present)
      const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;

      switch (this.provider) {
        case 'TWILIO':
          return await this.sendViaTwilio(formattedMobile, message);
        
        case 'MSG91':
          return await this.sendViaMsg91(formattedMobile, message);
        
        case 'CONSOLE':
        default:
          return this.sendViaConsole(formattedMobile, message);
      }
    } catch (error) {
      logger.error(`WhatsApp send error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send via Twilio WhatsApp
   */
  async sendViaTwilio(mobile, message) {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: smsConfig.twilio.whatsappNumber,
        to: `whatsapp:${mobile}`,
      });

      logger.info(`✅ WhatsApp sent via Twilio to ${mobile}: ${result.sid}`);
      return {
        success: true,
        provider: 'TWILIO',
        messageId: result.sid,
      };
    } catch (error) {
      logger.error(`❌ Twilio WhatsApp error: ${error.message}`);
      throw new Error(`WhatsApp delivery failed: ${error.message}`);
    }
  }

  /**
   * Send via MSG91 WhatsApp
   */
  async sendViaMsg91(mobile, message) {
    try {
      const cleanMobile = mobile.replace('+', '');
      
      const response = await axios.post(
        'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/',
        {
          integrated_number: smsConfig.msg91.senderId,
          content_type: 'template',
          payload: {
            to: cleanMobile,
            type: 'template',
            template: {
              name: smsConfig.msg91.whatsappTemplateId,
              language: { code: 'en' },
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: message }],
                },
              ],
            },
          },
        },
        {
          headers: {
            authkey: smsConfig.msg91.authKey,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`✅ WhatsApp sent via MSG91 to ${mobile}`);
      return {
        success: true,
        provider: 'MSG91',
        messageId: response.data.message_id,
      };
    } catch (error) {
      logger.error(`❌ MSG91 WhatsApp error: ${error.message}`);
      throw new Error(`WhatsApp delivery failed: ${error.message}`);
    }
  }

  /**
   * Console logging (for development/testing)
   */
  sendViaConsole(mobile, message) {
    logger.info(`
╔═══════════════════════════════════════════════════════╗
║           📱 WhatsApp MESSAGE (CONSOLE)              ║
╠═══════════════════════════════════════════════════════╣
║ To: ${mobile.padEnd(48)} ║
║ Message:                                             ║
║ ${message.padEnd(52)} ║
╚═══════════════════════════════════════════════════════╝
    `);

    return {
      success: true,
      provider: 'CONSOLE',
      messageId: 'console-' + Date.now(),
    };
  }
}

module.exports = new WhatsAppService();