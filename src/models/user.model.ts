import {Entity, model, property} from '@loopback/repository';
import {EUserRoleEnum} from '../enums/user';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(EUserRoleEnum),
    },
  })
  role: EUserRoleEnum;

  @property({
    type: 'array',
    itemType: 'string',
  })
  oldPassword?: string[];

  @property({
    type: 'string',
  })
  firstName?: string;

  @property({
    type: 'string',
  })
  lastName?: string;

  @property({
    type: 'date',
  })
  dateOfBirth?: string;

  @property({
    type: 'number',
  })
  phoneNumber?: number;

  @property({
    type: 'number',
  })
  bonusPoint?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;

  @property({
    type: 'date',
    default: new Date(),
  })
  createdAt?: string;

  @property({
    type: 'date',
    default: new Date(),
  })
  updatedAt?: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
