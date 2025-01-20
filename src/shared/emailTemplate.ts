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


export const emailTemplate = {
  createAccount,
  resetPassword,
}
