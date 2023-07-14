import {Entity, hasMany, hasOne, model, property} from '@loopback/repository';
import {EAccountType, EUserRoleEnum} from '../enums/user';
import {Order} from './order.model';
import {UserCredentials} from './user-credentials.model';

@model({
  settings: {
    indexes: {
      uniqueEmail: {
        keys: {
          email: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  },
})
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
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(EUserRoleEnum),
    },
  })
  role: EUserRoleEnum;

  @property({
    type: 'string',
    required: true,
  })
  accountType: EAccountType;

  @property({
    type: 'string',
  })
  avatarUrl?: string;

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
    type: 'boolean',
    default: false,
  })
  isActive?: boolean;

  @property({
    type: 'string',
  })
  phoneNumber?: string;

  @property({
    type: 'string',
  })
  forgotPassword?: string;

  @property({
    type: 'string',
  })
  resetPasswordToken: string;

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
    default: () => new Date(),
  })
  lastSignInAt: Date;

  @property({
    type: 'date',
    default: new Date(),
  })
  createdAt?: Date;

  @property({
    type: 'date',
    default: new Date(),
  })
  updatedAt?: Date;

  @hasMany(() => Order)
  orders: Order[];

  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
