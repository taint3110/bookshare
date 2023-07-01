import {Entity, model, property} from '@loopback/repository';

@model()
export class BookCategory extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

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

  @property({
    type: 'string',
  })
  bookId?: string;

  @property({
    type: 'string',
  })
  categoryId?: string;

  constructor(data?: Partial<BookCategory>) {
    super(data);
  }
}

export interface BookCategoryRelations {
  // describe navigational properties here
}

export type BookCategoryWithRelations = BookCategory & BookCategoryRelations;
