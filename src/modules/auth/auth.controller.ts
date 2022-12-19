import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import {
  CommonIsSuccessResponse,
  GetTokenResponse,
  INewAuth,
  CommonResponse,
  jwtTokenDecode,
  IResetPasswordRequest,
  IResetPasswordConfirmRequest,
  IChangePasswordRequest,
  IVerifyEmailRequest,
  INewAuthInput,
  ChangePasswordOrEmail,
} from './interfaces/auth.interface';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { ErrorStatus } from '../../common/types';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
  ) {}

  @Post('/sign-up')
  async create(@Body() body: INewAuthInput): Promise<CommonIsSuccessResponse> {
    try {
      return await this.authService.createAuth(body);
    } catch (e) {
      return { isSuccess: false, error: ErrorStatus.USER_EXIST };
    }
  }

  @Delete(':id')
  async deleteAuth(@Param('id') id: string): Promise<CommonIsSuccessResponse> {
    return await this.authService.deleteAuth(id);
  }

  @Post('/user-exist')
  async checkUser(@Body() request: jwtTokenDecode): Promise<boolean> {
    const { auth } = await this.authService.getAuth(request.email);
    return (
      auth && auth.email == request.email && auth.id === request.clientAccountId
    );
  }

  @Post('/change-password')
  async changePasswordConfirm(
    @Body()
    request: IChangePasswordRequest,
  ): Promise<CommonResponse> {
    return await this.authService.changePassword(request);
  }

  @Post('/reset-password')
  async resetPassword(
    @Body()
    request: IResetPasswordRequest,
  ): Promise<CommonResponse> {
    return await this.authService.resetPassword(request);
  }

  @Post('/change-password-or-email')
  async changePasswordOrEmail(
    @Body()
    request: ChangePasswordOrEmail,
  ): Promise<CommonResponse> {
    return await this.authService.changePasswordOrEmail(request);
  }

  @Post('/resend-email-auth')
  async resendEmailAuth(
    @Body()
    request: IResetPasswordRequest,
  ): Promise<CommonResponse> {
    return await this.authService.resendEmailAuth(request);
  }

  @Post('/reset-password-confirm')
  async resetPasswordConfirm(
    @Body()
    request: IResetPasswordConfirmRequest,
  ): Promise<CommonResponse> {
    return await this.authService.resetPasswordConfirm(request);
  }

  @Post('/verify-email')
  async verifyEmail(
    @Body()
    request: IVerifyEmailRequest,
  ): Promise<CommonResponse> {
    return await this.authService.verifyEmail(request);
  }

  @Post('/sign-in')
  @HttpCode(200)
  async getAuth(@Body() body: INewAuth): Promise<GetTokenResponse> {
    const { auth } = await this.authService.getAuth(body.email);
    if (!auth) {
      return { error: ErrorStatus.USER_NOT_EXIST };
    }
    if (!auth.isVerified) {
      return { error: ErrorStatus.EMAIL_IS_NOT_VERIFIED };
    }
    const token = this.tokenService.createCustomJwt(auth.email, auth.id);
    if (auth.password === body.password) {
      return { token: token };
    } else {
      return { error: ErrorStatus.PASSWORD_ERROR };
    }
  }
}
