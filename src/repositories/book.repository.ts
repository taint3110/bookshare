import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Book, BookCategory, BookRelations, Media, Series} from '../models';
import {BookCategoryRepository} from './book-category.repository';
import {MediaRepository} from './media.repository';
import {SeriesRepository} from './series.repository';

export class BookRepository extends DefaultCrudRepository<
  Book,
  typeof Book.prototype.id,
  BookRelations
> {
  public readonly series: BelongsToAccessor<Series, typeof Book.prototype.id>;

  public readonly bookCategories: HasManyRepositoryFactory<
    BookCategory,
    typeof Book.prototype.id
  >;

  public readonly media: HasOneRepositoryFactory<
    Media,
    typeof Book.prototype.id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('SeriesRepository')
    protected seriesRepositoryGetter: Getter<SeriesRepository>,
    @repository.getter('BookCategoryRepository')
    protected bookCategoryRepositoryGetter: Getter<BookCategoryRepository>,
    @repository.getter('MediaRepository')
    protected mediaRepositoryGetter: Getter<MediaRepository>,
  ) {
    super(Book, dataSource);
    this.media = this.createHasOneRepositoryFactoryFor(
      'media',
      mediaRepositoryGetter,
    );
    this.registerInclusionResolver('media', this.media.inclusionResolver);
    this.bookCategories = this.createHasManyRepositoryFactoryFor(
      'bookCategories',
      bookCategoryRepositoryGetter,
    );
    this.registerInclusionResolver(
      'bookCategories',
      this.bookCategories.inclusionResolver,
    );
    this.series = this.createBelongsToAccessorFor(
      'series',
      seriesRepositoryGetter,
    );
    this.registerInclusionResolver('series', this.series.inclusionResolver);
  }
}
