import cors from 'cors'
import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import router from './routes'
import { Morgan } from './shared/morgan'
import cookieParser from 'cookie-parser'
import globalErrorHandler from './app/middleware/globalErrorHandler'
const app = express()
// [
//   'http://164.90.205.5:3000',
//   'http://164.90.205.5:4174',
//   'http://admin.fremst.nu',
//   'http://fremst.nu',
//   'https://fremst.nu',
//   'https://admin.fremst.nu',
//   'http://kladportal.fremst.nu',
//   'https://kladportal.fremst.nu',
// ],
//morgan
app.use(Morgan.successHandler)
app.use(Morgan.errorHandler)
//body parser
app.use(
  cors({
    origin: '*',
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('uploads'))

//router
app.use('/api/v1', router)

//live response
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1 style="text-align:center; color:#A55FEF; font-family:Verdana;">Hey, How can I assist you today!</h1>',
  )
})

//global error handle
app.use(globalErrorHandler)

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  })
})

export default app
