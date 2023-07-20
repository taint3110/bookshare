// Uncomment these imports to begin using these cool features!
import {authenticate} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings, securityId} from '@loopback/security';
import _get from 'lodash/get';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {
  Credentials,
  JWTService,
  MyUserProfile,
  MyUserService,
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../components/jwt-authentication';
import {BcryptHasher} from '../components/jwt-authentication/services/hash-password';
import {validateCredentials} from '../components/jwt-authentication/services/validator';
import {EPlatform} from '../enums/common';
import {EAccountType} from '../enums/user';
import {User, UserWithPassword, UserWithPasswordChange} from '../models';
import {UserWithRelations} from '../models/user.model';
import {EmailConfigurationRepository, UserRepository} from '../repositories';
import {sendResetPasswordEmail} from '../services/mail';
import {CredentialsRequestBody} from '../types/credential-schema';

@model({
  name: 'Reset Password Request',
})
export class ResetPasswordRequest {
  @property({
    type: 'string',
    required: true,
  })
  newPassword: string;

  @property({
    type: 'string',
    required: true,
  })
  confirmPassword: string;

  @property({
    type: 'string',
    required: true,
  })
  resetPasswordToken: string;
}

@model({
  name: 'Forgot Password Request',
})
class ForgotPasswordRequest {
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(EPlatform),
    },
    required: true,
  })
  platform: EPlatform;
}

export class AuthController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(EmailConfigurationRepository)
    public emailConfigurationRepository: EmailConfigurationRepository,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) {}

  @post('/auth/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {
              title: 'NewUser',
              exclude: ['lastSignInAt'],
            }),
          },
        },
      },
    },
  })
  async signup(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserWithPassword, {
            exclude: ['id', 'createdAt', 'lastSignInAt', 'updatedAt'],
          }),
        },
      },
    })
    userData: Omit<UserWithPassword, 'id'>,
  ) {
    validateCredentials(pick(userData, ['email', 'password']));

    const foundUser: User | null = await this.userRepository.findOne({
      where: {email: userData.email},
    });
    if (foundUser?.isActive) {
      throw new HttpErrors.UnprocessableEntity('email existed');
    }

    const newUserData: Partial<User> = {
      email: userData.email,
      role: userData.role,
      name: userData.name,
      accountType: userData?.accountType ?? EAccountType.CUSTOMER,
      phoneNumber: String(userData?.phoneNumber ?? '') ?? '',
      firstName: userData?.firstName ?? '',
      lastName: userData?.lastName ?? '',
      isActive: true,
    };

    let newUser: Partial<User>;

    if (foundUser && !foundUser?.isActive) {
      await this.userRepository.updateById(foundUser?.id, newUserData);
      newUser = {...foundUser, ...newUserData};
    } else {
      newUser = await this.userRepository.create(newUserData);
    }

    const hashedPassword: string = await this.hasher.hashPassword(
      userData.password,
    );
    await this.userRepository
      .userCredentials(newUser.id)
      .create({password: hashedPassword});
    return newUser;
  }

  @post('/auth/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'number',
                },
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{userId: string; token: string}> {
    const user: User = await this.userService.verifyCredentials(credentials);
    const userProfile: MyUserProfile =
      this.userService.convertToUserProfile(user);
    const token: string = await this.jwtService.generateToken(userProfile);
    await this.userRepository.updateById(user.id, {lastSignInAt: new Date()});
    return Promise.resolve({
      userId: userProfile.id,
      token: token,
      accountType: userProfile.accountType,
    });
  }

  @post('/auth/forgot-password', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async forgotPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ForgotPasswordRequest, {
            title: 'ForgotPassword',
          }),
        },
      },
    })
    forgotPasswordRequest: ForgotPasswordRequest,
  ): Promise<void> {
    const {email = '', platform} = forgotPasswordRequest;
    const foundUser: UserWithRelations | null =
      await this.userRepository.findOne({
        where: {email},
      });
    const invalidEmailError =
      'email-address-is-not-registered-please-check-again';

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidEmailError);
    } else {
      try {
        await sendResetPasswordEmail(
          foundUser,
          this.userRepository,
          this.emailConfigurationRepository,
          this.userService,
          this.jwtService,
          platform,
        );
      } catch (error) {
        throw new HttpErrors.UnprocessableEntity(_get(error, 'message', ''));
      }
    }
  }

  @post('/auth/reset-password', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async resetPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ResetPasswordRequest, {
            title: 'ResetPassword',
          }),
        },
      },
    })
    resetPasswordRequest: ResetPasswordRequest,
  ): Promise<boolean> {
    try {
      await this.userService.resetPassword(resetPasswordRequest);
      return true;
    } catch (error) {
      throw new HttpErrors.Conflict(_get(error, 'message', ''));
    }
  }

  @get('/auth/profile', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: 'application/json',
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: MyUserProfile,
  ): Promise<User> {
    const userId: string = currentUserProfile[securityId];
    const userDetail: User = await this.userRepository.findById(userId);
    return userDetail;
  }

  @patch('/auth/update-profile')
  @response(204, {
    description: 'Auth profile self PATCH success',
  })
  @authenticate('jwt')
  async patchCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: MyUserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserWithPasswordChange, {partial: true}),
        },
      },
    })
    user: UserWithPasswordChange,
  ): Promise<void> {
    const userId: string = currentUserProfile[securityId];
    if (user?.newPassword || user?.password || user?.confirmPassword) {
      const {password} = await this.userRepository
        .userCredentials(userId)
        .get();
      const comparePasswordResult: boolean = await this.hasher.comparePassword(
        user.password,
        password,
      );
      if (!comparePasswordResult) {
        throw new HttpErrors.UnprocessableEntity('Password is not valid');
      }
      if (
        user?.newPassword !== user?.confirmPassword ||
        !user?.confirmPassword ||
        !user?.newPassword
      ) {
        throw new HttpErrors.UnprocessableEntity(
          'New password and confirm password is not match',
        );
      }
      const hashedPassword: string = await this.hasher.hashPassword(
        user.newPassword,
      );
      await this.userRepository
        .userCredentials(userId)
        .patch({password: hashedPassword});
    }
    await this.userRepository.updateById(
      userId,
      omit(user, ['password', 'newPassword', 'confirmPassword']),
    );
  }
}
