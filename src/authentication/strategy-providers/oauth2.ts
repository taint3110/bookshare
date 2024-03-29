import { UserIdentityService } from '@loopback/authentication'
import { BindingScope, inject, injectable, Provider } from '@loopback/core'
import { Profile } from 'passport'
import { Strategy as OAuth2Strategy, StrategyOptions as OAuth2StrategyOptions } from 'passport-oauth2'
import { User } from '../../models'
import { UserServiceBindings } from '../../services'
import { ProfileFunction, verifyFunctionFactory } from '../strategies/types'

@injectable.provider({ scope: BindingScope.SINGLETON })
export class CustomOauth2 implements Provider<OAuth2Strategy> {
  strategy: OAuth2Strategy

  constructor(
    @inject('customOAuth2Options')
    public oauth2Options: OAuth2StrategyOptions,
    @inject('authentication.oauth2.profile.function', { optional: true })
    public profileFn: ProfileFunction,
    @inject(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE)
    public userService: UserIdentityService<Profile, User>
  ) {
    if (profileFn) {
      OAuth2Strategy.prototype.userProfile = profileFn
    }
    this.strategy = new OAuth2Strategy(this.oauth2Options, verifyFunctionFactory(this.userService))
  }

  value() {
    return this.strategy
  }
}
