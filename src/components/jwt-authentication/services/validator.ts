import { HttpErrors } from '@loopback/rest'
import { Credentials } from '..'

export function validateCredentials(credentials: Credentials) {
  if (!credentials.email) {
    throw new HttpErrors.UnprocessableEntity('email must not be empty')
  }

  if (credentials.password.length < 6) {
    throw new HttpErrors.UnprocessableEntity('password length should be greater than 6')
  }
}
