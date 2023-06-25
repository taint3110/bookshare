import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Book, BookRelations, Media, Series, BookCategory} from '../models';
import {MediaRepository} from './media.repository';
import {SeriesRepository} from './series.repository';
import {BookCategoryRepository} from './book-category.repository';

export class BookRepository extends DefaultCrudRepository<
  Book,
  typeof Book.prototype.id,
  BookRelations
> {
  public readonly series: BelongsToAccessor<Series, typeof Book.prototype.id>;

  public readonly media: HasManyRepositoryFactory<
    Media,
    typeof Book.prototype.id
  >;

  public readonly bookCategories: HasManyRepositoryFactory<BookCategory, typeof Book.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('SeriesRepository')
    protected seriesRepositoryGetter: Getter<SeriesRepository>,
    @repository.getter('MediaRepository')
    protected mediaRepositoryGetter: Getter<MediaRepository>, @repository.getter('BookCategoryRepository') protected bookCategoryRepositoryGetter: Getter<BookCategoryRepository>,
  ) {
    super(Book, dataSource);
    this.bookCategories = this.createHasManyRepositoryFactoryFor('bookCategories', bookCategoryRepositoryGetter,);
    this.registerInclusionResolver('bookCategories', this.bookCategories.inclusionResolver);
    this.media = this.createHasManyRepositoryFactoryFor(
      'media',
      mediaRepositoryGetter,
    );
    this.registerInclusionResolver('media', this.media.inclusionResolver);
    this.series = this.createBelongsToAccessorFor(
      'series',
      seriesRepositoryGetter,
    );
    this.registerInclusionResolver('series', this.series.inclusionResolver);
  }
}
