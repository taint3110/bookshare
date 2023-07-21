import { UserIdentityService } from '@loopback/authentication'
import { BindingKey } from '@loopback/core'
import { Profile as PassportProfile } from 'passport'
import { User } from '../models'

export namespace UserServiceBindings {
  export const PASSPORT_USER_IDENTITY_SERVICE =
    BindingKey.create<UserIdentityService<PassportProfile, User>>('services.passport.identity')
}
