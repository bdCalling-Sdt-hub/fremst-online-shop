export type ILoginResponse = {
  accessToken: string
  refreshToken: string
  role: string
}

export type IRefreshTokenResponse = {
  accessToken: string
}

export type IForgotPasswordRequest = {
  email: string
}

export type IResetPasswordRequest = {
  token: string
  newPassword: string
  confirmPassword: string
}

export type IContactForm = {
  name: string;
  email: string;
  contact: string;
  message: string;
};