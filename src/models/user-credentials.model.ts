import { model, property, belongsTo } from '@loopback/repository'
import { Base } from './base.model'
import { User } from './user.model'

@model()
export class UserCredentials extends Base {
  @property({
    type: 'string',
    id: true,
    generated: true
  })
  id?: string

  @property({
    type: 'string',
    required: true
  })
  password: string

  @belongsTo(() => User)
  userId: string

  constructor(data?: Partial<UserCredentials>) {
    super(data)
  }
}

export interface UserCredentialsRelations {
  // describe navigational properties here
}

export type UserCredentialsWithRelations = UserCredentials & UserCredentialsRelations
