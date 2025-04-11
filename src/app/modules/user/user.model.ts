import { Schema, model } from 'mongoose'
import { IUser, UserModel } from './user.interface'
import bcrypt from 'bcrypt'
import config from '../../../config'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { USER_STATUS } from './user.constants'

const userSchema = new Schema<IUser, UserModel>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    contact: { type: String },
    status: {
      type: String,
      enum: [USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED],
      default: 'active',
    },
    password: { type: String, select: 0, required: true, trim: true },
    profile: { type: String },
    address: {
      _id: false,
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    role: { type: String, required: true },
    authentication: {
      type: {
        passwordChangedAt: {
          type: Date,
        },
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
  },
  {
    timestamps: true,
  },
)

userSchema.statics.isPasswordMatched = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword)
}

userSchema.pre('save', async function (next) {
  //check user
  const isExist = await User.findOne({
    email: this.email,
    status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED] },
  })
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!')
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  )
  next()
})

export const User = model<IUser, UserModel>('User', userSchema)
