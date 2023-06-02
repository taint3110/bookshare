import {Entity, model, property, hasMany} from '@loopback/repository';
import {Book} from './book.model';
import {Media} from './media.model';

@model()
export class Series extends Entity {
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
  })
  description?: string;

  @property({
    type: 'date',
  })
  releaseDate?: string;

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
    itemType: new Date(),
  })
  updatedAt?: string[];

  @hasMany(() => Book)
  books: Book[];

  @hasMany(() => Media)
  media: Media[];

  constructor(data?: Partial<Series>) {
    super(data);
  }
}

export interface SeriesRelations {
  // describe navigational properties here
}

export type SeriesWithRelations = Series & SeriesRelations;
