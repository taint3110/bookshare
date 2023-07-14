/* eslint-disable @typescript-eslint/no-explicit-any */

import {UserIdentityService} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';
import {Profile} from 'passport';
import {User} from '../../models';

export type ProfileFunction = (
  accessToken: string,
  done: (error?: Error | null, profile?: any) => void,
) => void;

export type VerifyFunction = (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: (error: any, user?: any, info?: any) => void,
) => void;

export namespace PassportAuthenticationBindings {
  export const OAUTH2_STRATEGY = 'passport.authentication.oauth2.strategy';
}

/**
 * provides an appropriate verify function for oauth2 strategies
 * @param accessToken
 * @param refreshToken
 * @param profile
 * @param done
 */
export const verifyFunctionFactory = function (
  userIdentityService: UserIdentityService<Profile, User>,
): VerifyFunction {
  return async function (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    try {
      const user: User = await userIdentityService.findOrCreateUser(profile);
      done(null, user);
    } catch (error) {
      done(error);
    }
  };
};

/**
 * map passport profile to UserProfile in `@loopback/security`
 * @param user
 */
export const mapProfile = function (user: User): UserProfile {
  const userProfile: UserProfile = {
    [securityId]: '' + user.id,
    profile: {
      ...user,
    },
  };
  return userProfile;
};
