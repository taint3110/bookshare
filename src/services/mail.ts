import {HttpErrors} from '@loopback/rest';
import sgMail, {MailDataRequired} from '@sendgrid/mail';
import get from 'lodash/get';
import {MyUserService} from '../components/jwt-authentication/services/my-user.service';
import {EEmailConfigurationId} from '../enums/email-configuration';
import {EPlatform} from '../enums/common';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {EmailConfigurationRepository} from '../repositories/email-configuration.repository';
import {CommonError} from '../types';
import {handleError} from '../utils/error';
import {JWTService} from './../components/jwt-authentication/services/jwt.service';
import {MyUserProfile} from './../components/jwt-authentication/type';
require('dotenv').config();

const CMS_RESET_PASSWORD_PATH = 'cms/reset-password/';
const WEBSITE_RESET_PASSWORD_PATH = '?resetPassword=';

sgMail.setApiKey('');

export async function sendResetPasswordEmail(
  user: User,
  userRepository: UserRepository,
  emailConfigurationRepository: EmailConfigurationRepository,
  userService: MyUserService,
  jwtService: JWTService,
  platform: EPlatform,
): Promise<void> {
  const email: string = get(user, 'email', '');
  const id: string = get(user, 'id', '');
  const name: string = get(user, 'name', '');
  const userProfile: MyUserProfile = userService.convertToUserProfile(user);
  const resetPasswordPath: string =
    platform === EPlatform.CMS
      ? CMS_RESET_PASSWORD_PATH
      : WEBSITE_RESET_PASSWORD_PATH;
  const resetPasswordToken: string = await jwtService.generateToken(
    userProfile,
  );

  const resetPasswordUrl = `${process.env.CLIENT_BASE_URL}/${resetPasswordPath}${resetPasswordToken}`;

  const emailSetting = await emailConfigurationRepository.findById(
    EEmailConfigurationId.RESET_PASSWORD,
  );

  const templateId = emailSetting?.templateId ?? '';

  const message: MailDataRequired = {
    to: email,
    from: emailSetting?.senderEmail ?? '',
    text: 'Here is the link to reset your account',
    html: emailSetting?.subject ?? '',
    templateId,
    dynamicTemplateData: {
      name,
      resetPasswordUrl,
    },
  };

  try {
    await userRepository.updateById(id, {...user, resetPasswordToken});
    await sgMail.send(message);
  } catch (error) {
    handleError(
      error as CommonError,
      'src/services/mail.ts',
      'sendResetPasswordEmail',
    );
    throw new HttpErrors.InternalServerError();
  }
}
