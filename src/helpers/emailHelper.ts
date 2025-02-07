import nodemailer from 'nodemailer'
import config from '../config'
import { errorLogger, logger } from '../shared/logger'
import { ISendEmail } from '../interfaces/email'

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: false,
  auth: {
    user: config.email.order,
    pass: config.email.pass,
  },
})

const sendEmail = async (values: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: `"Fremst clothing" ${config.email.order}`,
      to: values.to,
      subject: values.subject,  
      html: values.html,
    });

    logger.info('Mail send successfully', info.accepted);
  } catch (error) {
    console.log(error)
    errorLogger.error('Email', error);
  }
};

export const emailHelper = {
  sendEmail,
}
