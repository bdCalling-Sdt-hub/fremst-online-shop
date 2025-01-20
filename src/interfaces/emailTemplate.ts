export type ICreateAccount = {
  name: string
  email: string
  otp: number
}

export type IResetPassword = {
  email: string
  resetLink: string
}
