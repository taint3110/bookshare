import { asAuthStrategy, AuthenticationStrategy } from '@loopback/authentication'
import { StrategyAdapter } from '@loopback/authentication-passport'
import { extensionFor, inject, injectable } from '@loopback/core'
import { Request } from '@loopback/rest'
import { Strategy } from 'passport-google-oauth2'
import { User } from '../../models'
import { mapProfile, PassportAuthenticationBindings } from './types'

@injectable(asAuthStrategy, extensionFor(PassportAuthenticationBindings.OAUTH2_STRATEGY))
export class GoogleOauth2Authentication implements AuthenticationStrategy {
  name = 'oauth2-google'
  protected strategy: StrategyAdapter<User>

  /**
   * create an oauth2 strategy for google
   */
  constructor(
    @inject('googleStrategy')
    public passportstrategy: Strategy
  ) {
    this.strategy = new StrategyAdapter(this.passportstrategy, this.name, mapProfile.bind(this))
  }

  /**
   * authenticate a request
   * @param request
   */
  // *INFO: using any because the UserProfile with third party authentication don't have security-id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async authenticate(request: Request): Promise<any> {
    return this.strategy.authenticate(request)
  }
}
