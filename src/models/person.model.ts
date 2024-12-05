import {Entity, model, property} from '@loopback/repository';

@model()
export class Person extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  gender?: string;

  @property({
    type: 'string',
  })
  dateOfBirth?: string;

  @property({
    type: 'number',
  })
  age?: number;

  @property({
    type: 'string',
  })
  partnerId?: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  parentIds?: string[];

  @property({
    type: 'array',
    itemType: 'string',
  })
  childrenIds?: string[];

  constructor(data?: Partial<Person>) {
    super(data);
  }
}

export interface PersonRelations {
  // describe navigational properties here
}

export type PersonWithRelations = Person & PersonRelations;
