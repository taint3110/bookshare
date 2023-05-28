import {Entity, model, property} from '@loopback/repository';
import {
  EBookConditionEnum,
  EBookCoverEnum,
  EBookStatusEnum,
} from '../enums/book';

@model()
export class Book extends Entity {
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
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  price: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  author?: string[];

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(EBookCoverEnum),
    },
  })
  bookCover: EBookCoverEnum;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(EBookConditionEnum),
    },
  })
  bookCondition: EBookConditionEnum;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(EBookStatusEnum),
    },
  })
  bookStatus: EBookStatusEnum;

  @property({
    type: 'number',
  })
  bonusPointPrice?: number;

  @property({
    type: 'date',
  })
  releaseDate?: string;

  @property({
    type: 'string',
  })
  publisher?: string;

  @property({
    type: 'string',
  })
  language?: string;

  @property({
    type: 'string',
  })
  isbn?: string;

  @property({
    type: 'number',
  })
  rentCount?: number;

  @property({
    type: 'date',
  })
  availableStartDate?: string;

  @property({
    type: 'date',
  })
  availableEndDate?: string;

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
  updateAt?: string;

  constructor(data?: Partial<Book>) {
    super(data);
  }
}

export interface BookRelations {
  // describe navigational properties here
}

export type BookWithRelations = Book & BookRelations;
