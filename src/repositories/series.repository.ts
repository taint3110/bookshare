import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository, HasOneRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Book, Series, SeriesRelations, Media} from '../models';
import {BookRepository} from './book.repository';
import {MediaRepository} from './media.repository';

export class SeriesRepository extends DefaultCrudRepository<
  Series,
  typeof Series.prototype.id,
  SeriesRelations
> {
  public readonly books: HasManyRepositoryFactory<
    Book,
    typeof Series.prototype.id
  >;

  public readonly media: HasOneRepositoryFactory<Media, typeof Series.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('BookRepository')
    protected bookRepositoryGetter: Getter<BookRepository>, @repository.getter('MediaRepository') protected mediaRepositoryGetter: Getter<MediaRepository>,
  ) {
    super(Series, dataSource);
    this.media = this.createHasOneRepositoryFactoryFor('media', mediaRepositoryGetter);
    this.registerInclusionResolver('media', this.media.inclusionResolver);
    this.books = this.createHasManyRepositoryFactoryFor(
      'books',
      bookRepositoryGetter,
    );
    this.registerInclusionResolver('books', this.books.inclusionResolver);
  }
}
