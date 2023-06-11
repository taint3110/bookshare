import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Order, OrderRelations, Book} from '../models';
import {BookRepository} from './book.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {

  public readonly books: HasManyRepositoryFactory<Book, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('BookRepository') protected bookRepositoryGetter: Getter<BookRepository>,
  ) {
    super(Order, dataSource);
    this.books = this.createHasManyRepositoryFactoryFor('books', bookRepositoryGetter,);
    this.registerInclusionResolver('books', this.books.inclusionResolver);
  }
}
