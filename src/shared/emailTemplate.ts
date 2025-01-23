import { IContactForm } from '../app/modules/auth/auth.interface';
import config from '../config';
import { ICreateAccount, IResetPassword } from '../interfaces/emailTemplate'

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://ibb.co.com/qxFPvpn" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #4D3859; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name},Your salon-go Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background: #4D3859; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  }
  return data
}

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/dmvht7o8m/image/upload/v1737370875/zcd3awdjgvsenzewd4t0.png" alt="Fremst Logo" style="height: 60px;">
    </div>
    <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
      We received a request to reset your password. If you did not make this request, please ignore this email.  
    </p>
    <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
      To reset your password, please click the link below:
    </p>
    <p>
      <a href="${values.resetLink}" style="display: inline-block; background-color: #4D3859; margin:5px 0px; color: #ffffff; text-decoration: none; padding: 10px 10px; border-radius: 4px; font-weight: bold; font-family: Arial, sans-serif; font-size: 16px;">
          Reset Password
      </a>
    </p>
    <p style="font-family: Arial, sans-serif; font-size: 14px; color: #666;">
      If the button above does not work, copy and paste the following link into your browser:
    </p>
    <p style="font-family: Arial, sans-serif; font-size: 14px; color: #007bff; margin-top: 5px;">
      <a href="${values.resetLink}" style="color: #007bff; text-decoration: none;">${values.resetLink}</a>
    </p>
    <p style="font-family: Arial, sans-serif; font-size: 14px; color: #666; margin-top: 5px ;">
      This link will expire in 5 minutes for your security.
    </p>
    <p style="font-family: Arial, sans-serif; font-size: 14px; color: #333; margin-top: 20px;">
      Thank you,<br>
      The Fremst Team
    </p>
    `,
  };
  return data;
};


const contactForm = (payload: IContactForm) => {
  const data = {
    to: config.business_email as string,
    subject: `Contact Form Submission - ${payload.name}`,
    html:`
     <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%;">
    <tr>
      <td width="100%" style="min-width:100%;padding:10px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding:30px 40px;background-color:#292C61;border-radius:8px 8px 0 0;text-align:center;">
              <img src="https://res.cloudinary.com/dmvht7o8m/image/upload/v1737624138/Heading_1_Link_FREMST_LOGOTYPE-01.svg_1_txcggv.png" alt="Logo" style="width:100px;margin-bottom:20px;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">New Contact Message</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <!-- Contact Details -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:30px;">
                    <h2 style="color:#292C61;font-size:18px;margin:0 0 15px;">Contact Details</h2>
                    <div style="background-color:#f8f9fa;padding:20px;border-radius:6px;">
                      <p style="margin:0 0 10px;">
                        <span style="color:#666666;">Name:</span>
                        <strong style="color:#333333;margin-left:10px;">${payload.name}</strong>
                      </p>
                      <p style="margin:0 0 10px;">
                        <span style="color:#666666;">Email:</span>
                        <strong style="color:#333333;margin-left:10px;">${payload.email}</strong>
                      </p>
                      <p style="margin:0;">
                        <span style="color:#666666;">Phone:</span>
                        <strong style="color:#333333;margin-left:10px;">${payload.contact}</strong>
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Message -->
                <tr>
                  <td>
                    <h2 style="color:#292C61;font-size:18px;margin:0 0 15px;">Message</h2>
                    <div style="background-color:#f8f9fa;padding:20px;border-radius:6px;">
                      <p style="color:#333333;margin:0;white-space:pre-wrap;">${payload.message}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px;background-color:#f8f9fa;border-radius:0 0 8px 8px;text-align:center;">
              <p style="margin:0;color:#666666;font-size:14px;">
                This email was sent from Fremst Online Shop's contact form
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

    `,
  };
  return data;
};


const replyContactForm = (payload: IContactForm) => {
  const data = {
    to: payload.email, // Send the reply email to the user who submitted the form
    subject: 'Thank You for Contacting Us!',
    html: `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Thank You for Contacting Us</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%;">
    <tr>
      <td width="100%" style="min-width:100%;padding:10px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding:30px 40px;background-color:#292C61;border-radius:8px 8px 0 0;text-align:center;">
              <img src="https://res.cloudinary.com/dmvht7o8m/image/upload/v1737624138/Heading_1_Link_FREMST_LOGOTYPE-01.svg_1_txcggv.png" alt="Logo" style="width:100px;margin-bottom:20px;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">Thank You for Reaching Out</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <!-- Greeting -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:30px;">
                    <h2 style="color:#292C61;font-size:18px;margin:0 0 15px;">Hello ${payload.name},</h2>
                    <p style="color:#333333;margin:0 0 15px;">
                      Thank you for getting in touch with us! We’ve received your message and will get back to you as soon as possible. Here’s a summary of your submission:
                    </p>
                  </td>
                </tr>
                
                <!-- Submission Details -->
                <tr>
                  <td style="padding-bottom:30px;">
                    <h2 style="color:#292C61;font-size:18px;margin:0 0 15px;">Your Message</h2>
                    <div style="background-color:#f8f9fa;padding:20px;border-radius:6px;">
                      <p style="margin:0 0 10px;">
                        <span style="color:#666666;">Name:</span>
                        <strong style="color:#333333;margin-left:10px;">${payload.name}</strong>
                      </p>
                      <p style="margin:0 0 10px;">
                        <span style="color:#666666;">Email:</span>
                        <strong style="color:#333333;margin-left:10px;">${payload.email}</strong>
                      </p>
                      <p style="margin:0 0 10px;">
                        <span style="color:#666666;">Phone:</span>
                        <strong style="color:#333333;margin-left:10px;">${payload.contact}</strong>
                      </p>
                      <p style="margin:0;">
                        <span style="color:#666666;">Message:</span>
                        <strong style="color:#333333;margin-left:10px;white-space:pre-wrap;">${payload.message}</strong>
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Additional Info -->
                <tr>
                  <td>
                    <p style="color:#333333;margin:0 0 15px;">
                      We appreciate your interest and look forward to assisting you further. If you have additional information or inquiries, feel free to reply to this email.
                    </p>
                    <p style="color:#333333;margin:0;">
                      Best regards, <br>
                      Fremst Online Shop Team
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px;background-color:#f8f9fa;border-radius:0 0 8px 8px;text-align:center;">
              <p style="margin:0;color:#666666;font-size:14px;">
                This email was sent from Fremst Online Shop. If you didn’t contact us, please disregard this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
  return data;
};


export const emailTemplate = {
  createAccount,
  resetPassword,
  contactForm,
  replyContactForm
}
