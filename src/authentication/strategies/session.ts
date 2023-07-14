/* eslint-disable @typescript-eslint/no-explicit-any */
import {asAuthStrategy, AuthenticationStrategy} from '@loopback/authentication';
import {injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, RedirectRoute} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {User} from '../../models';
import {UserRepository} from '../../repositories';
import {mapProfile} from './types';

@injectable(asAuthStrategy)
export class SessionStrategy implements AuthenticationStrategy {
  name = 'session';

  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  /**
   * authenticate a request
   * @param request
   */
  async authenticate(
    request: any,
  ): Promise<UserProfile | RedirectRoute | undefined> {
    if (!request?.session?.user) {
      throw new HttpErrors.Unauthorized(`Invalid Session`);
    }
    const user: User = request?.session?.user as User;
    if (!user?.email || !user.id) {
      throw new HttpErrors.Unauthorized(`Invalid user profile`);
    }
    const users: User[] = await this.userRepository.find({
      where: {
        email: user?.email,
      },
    });
    if (!users?.length) {
      throw new HttpErrors.Unauthorized(`User not registered`);
    }
    return mapProfile(request.session.user as User);
  }
}
