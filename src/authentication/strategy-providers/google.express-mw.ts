const passport = require('passport')
import { BindingScope, inject, injectable, Provider } from '@loopback/core'
import { ExpressRequestHandler } from '@loopback/rest'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'
import { EAuthenticationProvider } from '../../enums/oauth2'

@injectable.provider({ scope: BindingScope.SINGLETON })
export class GoogleOauth2ExpressMiddleware implements Provider<ExpressRequestHandler> {
  constructor(
    @inject('googleStrategy')
    public strategy: GoogleStrategy
  ) {
    passport.use(this.strategy)
  }

  value() {
    return passport.authenticate(EAuthenticationProvider.GOOGLE)
  }
}
