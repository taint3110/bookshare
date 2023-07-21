import {UserProfile} from '@loopback/security';
import {EAccountType, EUserRoleEnum} from '../../enums/user';

export type Credentials = {
  email: string;
  password: string;
};

export type EmailCredentials = {
  email: string;
  password?: string;
};

export type PhoneNumberCredentials = {
  phoneNumber: string;
};

export interface MyUserProfile extends UserProfile {
  id: string;
  name: string;
  // TODO: required after integrate gg account
  accountType?: EAccountType;
  role: EUserRoleEnum;
}
