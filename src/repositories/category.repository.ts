import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, HasOneRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Category, CategoryRelations, BookCategory, Media} from '../models';
import {BookCategoryRepository} from './book-category.repository';
import {MediaRepository} from './media.repository';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {

  public readonly bookCategories: HasManyRepositoryFactory<BookCategory, typeof Category.prototype.id>;

  public readonly media: HasOneRepositoryFactory<Media, typeof Category.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('BookCategoryRepository') protected bookCategoryRepositoryGetter: Getter<BookCategoryRepository>, @repository.getter('MediaRepository') protected mediaRepositoryGetter: Getter<MediaRepository>,
  ) {
    super(Category, dataSource);
    this.media = this.createHasOneRepositoryFactoryFor('media', mediaRepositoryGetter);
    this.registerInclusionResolver('media', this.media.inclusionResolver);
    this.bookCategories = this.createHasManyRepositoryFactoryFor('bookCategories', bookCategoryRepositoryGetter,);
    this.registerInclusionResolver('bookCategories', this.bookCategories.inclusionResolver);
  }
}
