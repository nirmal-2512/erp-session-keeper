import "dotenv/config";
import crypto from "crypto";
import { BrevoClient } from "@getbrevo/brevo";


const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

export const sendOTPEmail = async (email, name, otp) => {
  const result = await brevo.transactionalEmails.sendTransacEmail({
    subject: "Your ERP Keeper verification code",

    sender: {
      name: process.env.BREVO_SENDER_NAME || "ERP Keeper",
      email: process.env.BREVO_SENDER_EMAIL,
    },

    to: [
      {
        email,
        name,
      },
    ],

    htmlContent: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: 40px auto;
        padding: 24px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
      ">

        <h2>Verify your ERP Keeper account</h2>

        <p>Hello ${name},</p>

        <p>
          Use the following verification code to verify your
          ERP Keeper account:
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 24px 0;
        ">
          ${otp}
        </div>

        <p>
          This code will expire in
          <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not create an ERP Keeper account,
          you can safely ignore this email.
        </p>

        <p>
          Regards,<br>
          ERP Keeper
        </p>

      </div>
    `,
  });

  return result;
};