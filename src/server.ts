import colors from 'colors'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import app from './app'
import config from './config'

import { errorLogger, logger } from './shared/logger'
import { socketHelper } from './helpers/socketHelper'
import { User } from './app/modules/user/user.model'

//uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandledException Detected', error)
  process.exit(1)
})

let server: any
async function main() {
  try {
    mongoose.connect(config.database_url as string)
    logger.info(colors.green('🚀 Database connected successfully'))

    // Super Admin creation
    const existingAdmin = await User.findOne({ role: 'SUPER_ADMIN' })

    if (!existingAdmin) {
      try {
        const superAdmin = {
          name: 'Super Admin',
          username: 'superadmin',
          email: 'superadmin@example.com',
          password: 'superadmin',
          role: 'super-admin',
        }
        const newAdmin = await User.create(superAdmin)
        if (!newAdmin) {
          logger.error(colors.red('Failed to create Super Admin'))
        }
        logger.info(colors.green('Super Admin created successfully'))
      } catch (error) {
        errorLogger.error('Failed to create Super Admin', error)
      }
    } else {
      logger.info(colors.blue('Super Admin already exists'))
    }

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port)

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(`♻️  Application listening on port:${config.port}`),
      )
    })

    //socket
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    })
    socketHelper.socket(io)
    //@ts-ignore
    global.io = io
  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect Database'))
  }

  //handle unhandleRejection
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandledRejection Detected', error)
        process.exit(1)
      })
    } else {
      process.exit(1)
    }
  })
}

main()

//SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVE')
  if (server) {
    server.close()
  }
})
