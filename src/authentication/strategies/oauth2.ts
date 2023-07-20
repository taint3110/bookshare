/* eslint-disable @typescript-eslint/no-explicit-any */
import { asAuthStrategy, AuthenticationStrategy } from '@loopback/authentication'
import { StrategyAdapter } from '@loopback/authentication-passport'
import { extensions, Getter, inject, injectable } from '@loopback/core'
import { HttpErrors, Request } from '@loopback/rest'
import { Strategy } from 'passport-oauth2'
import { OAUTH2_PROVIDER_NAME } from '../../constants/oauth2'
import { EAuthenticationProvider } from '../../enums/oauth2'
import { User } from '../../models'
import { mapProfile, PassportAuthenticationBindings } from './types'

@injectable(asAuthStrategy)
export class Oauth2AuthStrategy implements AuthenticationStrategy {
  name = 'oauth2'
  protected strategy: StrategyAdapter<User>

  /**
   * create an oauth2 strategy
   */
  constructor(
    /**
     * enable extensions for provider specific oauth2 implementations
     * reroute to the specific extension based on given provider name
     */
    @extensions(PassportAuthenticationBindings.OAUTH2_STRATEGY)
    private getStrategies: Getter<Oauth2AuthStrategy[]>,
    @inject('oauth2Strategy')
    public passportstrategy: Strategy
  ) {
    this.strategy = new StrategyAdapter(this.passportstrategy, this.name, mapProfile.bind(this))
  }

  /**
   * authenticate a request
   * @param request
   */
  async authenticate(request: Request): Promise<any> {
    if (request.query[OAUTH2_PROVIDER_NAME] && request.query[OAUTH2_PROVIDER_NAME] !== EAuthenticationProvider.OAUTH2) {
      /**
       * if provider name is given then reroute to the provider extension
       */
      const providerName = request.query[OAUTH2_PROVIDER_NAME]
      const strategies: Oauth2AuthStrategy[] = await this.getStrategies()
      const strategy: Oauth2AuthStrategy | undefined = strategies.find(
        (strategyItem: Oauth2AuthStrategy) => strategyItem?.name === 'oauth2-' + providerName
      )
      if (!strategy) throw new HttpErrors.NotFound('Provider not found')

      return strategy.authenticate(request)
    }
    /**
     * provider not given, use passport-oauth2 for custom provider implementation
     */
    return this.strategy.authenticate(request)
  }
}
