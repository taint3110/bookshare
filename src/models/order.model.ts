import {Entity, model, property, hasMany} from '@loopback/repository';
import {EOrderStatusEnum} from '../enums/order';
import {Book} from './book.model';

@model()
export class Order extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(EOrderStatusEnum),
    },
  })
  orderStatus: EOrderStatusEnum;

  @property({
    type: 'number',
  })
  totalPrice?: number;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'number',
  })
  rentLength?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;

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

  @hasMany(() => Book)
  books: Book[];

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
