import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId} from '@loopback/security';
import lodashGet from 'lodash/get';
import {JWTService} from '.';
import {ResetPasswordRequest} from '../../../controllers/auth.controller';
import {User} from '../../../models';
import {UserRepository} from '../../../repositories';
import {CommonError} from '../../../types';
import {handleError} from '../../../utils/error';
import {PasswordHasherBindings, TokenServiceBindings} from '../keys';
import {
  Credentials,
  EmailCredentials,
  MyUserProfile,
  PhoneNumberCredentials,
} from '../type';
import {BcryptHasher} from './hash-password';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {
        email: credentials.email,
      },
      include: ['userCredentials'],
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized('User not found');
    }
    return this.verifyPassword(foundUser, credentials.password);
  }

  convertToUserProfile(user: User): MyUserProfile {
    return {
      [securityId]: user.id!,
      id: user.id!,
      email: user.email,
      name: user.name,
      accountType: user.accountType,
      role: user.role,
    };
  }
  async clearExpiredResetToken(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    const updatedUser: Partial<User> = {
      ...user,
      forgotPassword: '',
      isActive: true,
    };
    await this.userRepository.updateById(userId, updatedUser);
  }

  async resetPassword(
    resetPasswordRequest: ResetPasswordRequest,
  ): Promise<void> {
    const newPassword = lodashGet(resetPasswordRequest, 'newPassword', '');
    const resetPasswordToken = lodashGet(
      resetPasswordRequest,
      'resetPasswordToken',
      '',
    );
    const decodedToken = await this.jwtService.decodeToken(resetPasswordToken);
    let userId;
    try {
      await this.verifyResetPasswordConditions(resetPasswordRequest);
      const password = await this.hasher.hashPassword(newPassword);
      userId = lodashGet(decodedToken, 'id');

      await this.userRepository.userCredentials(userId).patch({password});
      await this.clearExpiredResetToken(userId);
    } catch (error) {
      handleError(
        error as CommonError,
        'src/components/jwt-authentication/services/my-user.service.ts',
        'resetPassword',
      );
      throw new HttpErrors.InternalServerError(lodashGet(error, 'message', ''));
    }
  }

  async verifyResetPasswordConditions(
    resetPasswordRequest: ResetPasswordRequest,
  ): Promise<void> {
    const resetPasswordToken = lodashGet(
      resetPasswordRequest,
      'resetPasswordToken',
      '',
    );
    const decodedToken = await this.jwtService.decodeToken(resetPasswordToken);
    const userId = lodashGet(decodedToken, 'id');
    const user = await this.userRepository.findById(userId);
    const confirmNewPassword = lodashGet(
      resetPasswordRequest,
      'confirmPassword',
      '',
    );
    const expiredDate = lodashGet(decodedToken, 'exp', 0);
    const userResetPasswordToken = lodashGet(user, 'resetPasswordToken', '');
    const newPassword = lodashGet(resetPasswordRequest, 'newPassword', '');

    if (expiredDate * 1000 <= Date.now()) {
      await this.clearExpiredResetToken(userId);
      throw new HttpErrors.Conflict('token-expired');
    }

    if (newPassword !== confirmNewPassword) {
      throw new HttpErrors.Conflict('password-does-not-match');
    }

    if (userResetPasswordToken !== resetPasswordToken) {
      throw new HttpErrors.Conflict('token-does-not-exist');
    }
  }

  async verifyPassword(user: User, password: string): Promise<User> {
    const passwordMatched = await this.hasher.comparePassword(
      password,
      user?.userCredentials?.password,
    );
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Password is not valid');
    }
    return user;
  }

  async verifyEmailCredential(
    credentials: EmailCredentials,
  ): Promise<User | null> {
    const foundUser = await this.userRepository.findOne({
      where: {
        email: credentials.email,
      },
      include: ['userCredentials'],
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized('User not found');
    }
    if (credentials?.password) {
      return this.verifyPassword(foundUser, credentials.password);
    }
    return null;
  }

  async verifyPhoneNumberCredential(
    credentials: PhoneNumberCredentials,
  ): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {
        phoneNumber: credentials.phoneNumber,
      },
      include: ['userCredentials'],
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized('User not found');
    }
    return foundUser;
  }
}
