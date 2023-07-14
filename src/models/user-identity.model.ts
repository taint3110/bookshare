import { belongsTo, Entity, model, property } from '@loopback/repository'
import { User } from './user.model'

@model()
export class UserIdentity extends Entity {
  @property({
    type: 'string',
    id: true
  })
  id: string

  @property({
    type: 'string',
    required: true
  })
  provider: string

  @property({
    type: 'object',
    required: true
  })
  profile: object

  @property({
    type: 'object'
  })
  credentials?: Record<string, unknown>

  @property({
    type: 'date',
    required: true
  })
  createdAt?: Date

  @belongsTo(() => User)
  userId: string

  constructor(data?: Partial<UserIdentity>) {
    super(data)
  }
}

export interface UserIdentityRelations {
  // describe navigational properties here
}

export type UserIdentityWithRelations = UserIdentity & UserIdentityRelations
