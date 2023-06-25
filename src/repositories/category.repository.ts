import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Category, CategoryRelations, BookCategory} from '../models';
import {BookCategoryRepository} from './book-category.repository';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {

  public readonly bookCategories: HasManyRepositoryFactory<BookCategory, typeof Category.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('BookCategoryRepository') protected bookCategoryRepositoryGetter: Getter<BookCategoryRepository>,
  ) {
    super(Category, dataSource);
    this.bookCategories = this.createHasManyRepositoryFactoryFor('bookCategories', bookCategoryRepositoryGetter,);
    this.registerInclusionResolver('bookCategories', this.bookCategories.inclusionResolver);
  }
}
