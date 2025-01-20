export type ILoginResponse = {
  accessToken: string
  refreshToken: string
}

export type IRefreshTokenResponse = {
  accessToken: string
}

export type IForgotPasswordRequest = {
  email: string;
};

export type IResetPasswordRequest = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export type IVerifyTokenRequest = {
  token: string;
};
