import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {
  EBookConditionEnum,
  EBookCoverEnum,
  EBookStatusEnum,
} from '../enums/book';
import {Series} from './series.model';
import {Category} from './category.model';
import {Media} from './media.model';

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
    type: 'number',
    required: true,
  })
  price: number;

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
  createdAt?: Date;

  @property({
    type: 'date',
    default: new Date(),
  })
  updatedAt?: string;

  @belongsTo(() => Series)
  seriesId: string;

  @property({
    type: 'string',
  })
  orderId?: string;

  @hasMany(() => Category)
  categories: Category[];

  @hasMany(() => Media)
  media: Media[];

  constructor(data?: Partial<Book>) {
    super(data);
  }
}

export interface BookRelations {
  // describe navigational properties here
}

export type BookWithRelations = Book & BookRelations;
