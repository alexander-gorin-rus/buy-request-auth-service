import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from '../../common/common.service';
import {
  CommonIsSuccessResponse,
  IGetAuthResponse,
  INewAuth,
  IAuth,
  CommonResponse,
  IResetPasswordRequest,
  IResetPasswordConfirmRequest,
  IChangePasswordRequest,
  IVerifyEmailRequest,
  INewAuthInput,
  ChangePasswordOrEmail,
} from './interfaces/auth.interface';
import Auth from './auth.entity';
import { AmqpService } from '../../amqp/amqp.service';
import { ConfigService } from '@nestjs/config';
import { ErrorStatus } from '../../common/types';
import { checkCodeTimeout, generateRandomCode } from '../../utils/helpers';

@Injectable()
export class AuthService extends CommonService {
  constructor(
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
    private amqpService: AmqpService,
    private config: ConfigService,
  ) {
    super(authRepository);
  }

  private async setCode(auth: IAuth) {
    if (auth.code) {
      throw ErrorStatus.CODE_ALREADY_GENERATED;
    }
    const newCode = generateRandomCode(6);
    await this.save<IAuth, IAuth>({
      ...auth,
      code: newCode,
      codeCreatedAt: new Date().toISOString(),
    });

    await this.amqpService.publish(
      this.config.get('amqp').exchanges.events.name,
      'event.notification-service.code.send',
      'notificationService.NewCodeGenerated',
      {
        email: auth.email,
        authId: auth.id,
        code: newCode,
      },
    );
  }

  private async checkCode(
    auth: IAuth,
    code: string,
    newValues: {
      password?: string;
    },
  ) {
    if (!auth.code) {
      throw ErrorStatus.NO_ONE_TIME_CODE;
    }
    if (!checkCodeTimeout(new Date(auth.codeCreatedAt))) {
      await this.save<IAuth, IAuth>({
        ...auth,
        code: null,
        codeCreatedAt: null,
      });
      throw ErrorStatus.CODE_TIMEOUT;
    }
    if (auth.code !== code) {
      throw ErrorStatus.INCORRECT_CODE;
    }
    await this.save<IAuth, IAuth>({
      ...auth,
      code: null,
      codeCreatedAt: null,
      ...newValues,
    });
  }

  async createAuth(request: INewAuthInput): Promise<CommonIsSuccessResponse> {
    const { email, password, locale } = request;
    try {
      const data = await this.save<INewAuth, IAuth>({
        email,
        password,
      });
      await this.amqpService.publish(
        this.config.get('amqp').exchanges.events.name,
        'event.notification-service.newUser.created',
        'notificationService.NewUserCreated',
        {
          email,
          authId: data.id,
          link: `${this.config.get('dashboardUrl')}/verify-email/${data.id}`,
          locale,
        },
      );

      return {
        id: data.id,
        isSuccess: true,
      };
    } catch (error) {
      throw new Error();
    }
  }

  async deleteAuth(id: string): Promise<CommonIsSuccessResponse> {
    try {
      await this.remove(id);
      return {
        isSuccess: true,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error,
      };
    }
  }

  async changePassword(
    request: IChangePasswordRequest,
  ): Promise<CommonResponse> {
    try {
      const { id, oldPassword, newPassword } = request;
      const auth = await this.findOneByCriteria<IAuth>({
        where: { id },
      });
      if (!auth) {
        throw ErrorStatus.USER_NOT_EXIST;
      }
      if (auth.password !== oldPassword) {
        throw ErrorStatus.PASSWORD_ERROR;
      }
      await this.save<IAuth, IAuth>({
        ...auth,
        password: newPassword,
      });

      await this.amqpService.publish(
        this.config.get('amqp').exchanges.events.name,
        'event.notification-service.password-change.send',
        'notificationService.PasswordChange',
        {
          email: auth.email,
          authId: auth.id,
        },
      );

      return {
        isSuccess: true,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error,
      };
    }
  }

  private async validatePasswordAndEmail(
    auth: IAuth,
    email?: string,
    oldPassword?: string,
    newPassword?: string,
  ) {
    if (!auth) {
      throw ErrorStatus.USER_NOT_EXIST;
    }

    if (email) {
      const existEmail = await this.findByCriteria<IAuth>({
        where: { email },
      });
      if (existEmail.length) {
        throw ErrorStatus.EMAIL_EXIST;
      }

      auth.email = email;
      auth.isVerified = false;
    }

    if (oldPassword) {
      if (auth.password !== oldPassword) {
        throw ErrorStatus.PASSWORD_ERROR;
      }

      auth.password = newPassword;
    }
  }

  async changePasswordOrEmail(request: ChangePasswordOrEmail) {
    try {
      const { email, id } = request;
      const { newPassword, oldPassword } = request?.passwordChange;
      const auth = await this.findOneByCriteria<IAuth>({
        where: { id },
      });

      await this.validatePasswordAndEmail(
        auth,
        email,
        oldPassword,
        newPassword,
      );

      await this.save<IAuth, IAuth>({
        ...auth,
      });

      //TODO I have no idea how remove second if block
      if (request.passwordChange && newPassword && oldPassword) {
        await this.amqpService.publish(
          this.config.get('amqp').exchanges.events.name,
          'event.notification-service.password-change.send',
          'notificationService.PasswordChange',
          {
            email: auth.email,
            authId: auth.id,
          },
        );
      }
      if (email) {
        await this.sendCodeToEmail(auth.id, email);
      }

      return {
        isSuccess: true,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error,
      };
    }
  }

  async resetPassword(request: IResetPasswordRequest): Promise<CommonResponse> {
    try {
      const { email } = request;
      const auth = await this.findOneByCriteria<IAuth>({
        where: { email },
      });

      if (!auth) {
        throw ErrorStatus.USER_NOT_EXIST;
      }

      if (!auth.isVerified) {
        throw ErrorStatus.EMAIL_IS_NOT_VERIFIED;
      }

      await this.setCode(auth);
      return {
        isSuccess: true,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error,
      };
    }
  }

  async resendEmailAuth(
    request: IResetPasswordRequest,
  ): Promise<CommonResponse> {
    try {
      const { email } = request;
      const auth = await this.findOneByCriteria<IAuth>({
        where: { email },
      });

      if (!auth) {
        throw ErrorStatus.USER_NOT_EXIST;
      }

      if (auth.isVerified) {
        throw ErrorStatus.EMAIL_IS_ALREADY_VERIFIED;
      }

      await this.sendCodeToEmail(auth.id, email);

      return {
        isSuccess: true,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error,
      };
    }
  }

  private async sendCodeToEmail(id: string, email: string): Promise<void> {
    //TODO change this in next iteration
    const code = id;
    await this.amqpService.publish(
      this.config.get('amqp').exchanges.events.name,
      'event.notification-service.newUser.created',
      'notificationService.NewUserCreated',
      {
        authId: id,
        email,
        link: `${this.config.get('dashboardUrl')}/verify-email/${code}`,
      },
    );
  }

  async resetPasswordConfirm(
    request: IResetPasswordConfirmRequest,
  ): Promise<CommonResponse> {
    try {
      const { email, code, newPassword } = request;
      const auth = await this.findOneByCriteria<IAuth>({
        where: { email },
      });
      if (!auth) {
        throw ErrorStatus.USER_NOT_EXIST;
      }
      await this.checkCode(auth, code, {
        password: newPassword,
      });
      return {
        isSuccess: true,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error,
      };
    }
  }

  async verifyEmail(request: IVerifyEmailRequest): Promise<CommonResponse> {
    try {
      const { id } = request;
      const auth = await this.findOneByCriteria<IAuth>({
        where: { id },
      });
      if (!auth) {
        throw ErrorStatus.USER_NOT_EXIST;
      }
      if (auth.isVerified) {
        throw ErrorStatus.EMAIL_IS_ALREADY_VERIFIED;
      }
      await this.save<IAuth, IAuth>({
        ...auth,
        isVerified: true,
      });
      return {
        isSuccess: true,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error,
      };
    }
  }

  async getAuth(email: string): Promise<IGetAuthResponse> {
    try {
      const auth = await this.findOneByCriteria<IAuth>({
        where: { email: email },
      });
      return {
        auth,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
