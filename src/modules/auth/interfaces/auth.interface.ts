import { ErrorStatus } from '../../../common/types';

export interface INewAuth {
  password: string;
  email: string;
}

export interface INewAuthInput {
  password: string;
  email: string;
  locale: string;
}

export type jwtTokenDecode = {
  email: string;
  userId: string;
  clientAccountId: string;
};

export interface IJwtItem {
  key: string;
  value: any;
}

export interface IAuth extends INewAuth {
  id: string;
  code?: string;
  codeCreatedAt?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CommonIsSuccessResponse =
  | {
      id?: string;
      isSuccess: true;
    }
  | {
      isSuccess: false;
      error?: ErrorStatus;
    };

export interface IGetAuthResponse {
  auth: IAuth;
}

export type CommonResponse = {
  isSuccess: boolean;
  error?: ErrorStatus;
};

export type GetTokenResponse =
  | {
      token: string;
    }
  | { error: ErrorStatus };

export interface IChangePasswordRequest {
  id: string;
  oldPassword: string;
  newPassword: string;
}

export interface IResetPasswordRequest {
  email: string;
}

export type ChangePasswordOrEmail = {
  id: string;
  email?: string;
  passwordChange?: Omit<IChangePasswordRequest, 'id'>;
};

export interface IResetPasswordConfirmRequest {
  code: string;
  email: string;
  newPassword: string;
}

export interface IVerifyEmailRequest {
  id: string;
}

export type IJwtCustomParams = Array<IJwtItem>;
