import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Book, BookRelations, Series, Category, Media} from '../models';
import {SeriesRepository} from './series.repository';
import {CategoryRepository} from './category.repository';
import {MediaRepository} from './media.repository';

export class BookRepository extends DefaultCrudRepository<
  Book,
  typeof Book.prototype.id,
  BookRelations
> {

  public readonly series: BelongsToAccessor<Series, typeof Book.prototype.id>;

  public readonly categories: HasManyRepositoryFactory<Category, typeof Book.prototype.id>;

  public readonly media: HasManyRepositoryFactory<Media, typeof Book.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('SeriesRepository') protected seriesRepositoryGetter: Getter<SeriesRepository>, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>, @repository.getter('MediaRepository') protected mediaRepositoryGetter: Getter<MediaRepository>,
  ) {
    super(Book, dataSource);
    this.media = this.createHasManyRepositoryFactoryFor('media', mediaRepositoryGetter,);
    this.registerInclusionResolver('media', this.media.inclusionResolver);
    this.categories = this.createHasManyRepositoryFactoryFor('categories', categoryRepositoryGetter,);
    this.registerInclusionResolver('categories', this.categories.inclusionResolver);
    this.series = this.createBelongsToAccessorFor('series', seriesRepositoryGetter,);
    this.registerInclusionResolver('series', this.series.inclusionResolver);
  }
}
