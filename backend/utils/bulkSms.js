import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendBulkSMS = async ({ users, message }) => {
  const results = [];

  for (const user of users) {
    if (!user.phoneNumber) continue;

    try {
      await client.messages.create({
        body: message.replace("{{name}}", user.fullName || "User"),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phoneNumber,
      });

      results.push({ to: user.phoneNumber, success: true });
    } catch (error) {
      console.error(`Failed to send to ${user.phoneNumber}`, error.message);
      results.push({ to: user.phoneNumber, success: false, error: error.message });
    }
  }

  return results;
};
