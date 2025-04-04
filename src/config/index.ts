/* eslint-disable no-undef */
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env') })

export default {
  ip_address: process.env.IP_ADDRESS,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  application_fee: process.env.APPLICATION_FEE,
  instant_transfer_fee: process.env.INSTANT_TRANSFER_FEE,
  openAi_api_key: process.env.OPENAI_API_KEY,
  stripe_secret: process.env.STRIPE_SECRET_KEY,
  stripe_account_id: process.env.STRIPE_ACCOUNT_ID,
  webhook_secret: process.env.WEBHOOK_SECRET,
  frontend_url: process.env.FRONTEND_URL,
  business_email: process.env.BUSINESS_EMAIL,

  admin_order_receiving_code: process.env.ADMIN_ORDER_RECEIVING_CODE,
  allowed_origins: process.env.ALLOWED_ORIGINS ,
  email:{
    order: process.env.ORDER_EMAIL,
    info: process.env.INFO_EMAIL,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_SERVER,
    pass: process.env.EMAIL_PASSWORD
  },
  twilio: {
    account_sid: process.env.TWILIO_ACCOUNT_SID,
    auth_token: process.env.TWILIO_AUTH_TOKEN,
    phone_number: process.env.TWILIO_PHONE_NUMBER,
  },
  cloudinary: {
    cloudinary_name: process.env.CLOUDINARY_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_secret: process.env.CLOUDINARY_SECRET,
  },
  aws: {
    bucket_name: process.env.S3_BUCKET_NAME,
    aws_region: process.env.AWS_REGION,
  },
}
