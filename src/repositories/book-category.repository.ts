import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {BookCategory, BookCategoryRelations} from '../models';

export class BookCategoryRepository extends DefaultCrudRepository<
  BookCategory,
  typeof BookCategory.prototype.id,
  BookCategoryRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(BookCategory, dataSource);
  }
}
