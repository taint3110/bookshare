import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Category,
  BookCategory,
} from '../models';
import {CategoryRepository} from '../repositories';

export class CategoryBookCategoryController {
  constructor(
    @repository(CategoryRepository) protected categoryRepository: CategoryRepository,
  ) { }

  @get('/categories/{id}/book-categories', {
    responses: {
      '200': {
        description: 'Array of Category has many BookCategory',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(BookCategory)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<BookCategory>,
  ): Promise<BookCategory[]> {
    return this.categoryRepository.bookCategories(id).find(filter);
  }

  @post('/categories/{id}/book-categories', {
    responses: {
      '200': {
        description: 'Category model instance',
        content: {'application/json': {schema: getModelSchemaRef(BookCategory)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Category.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BookCategory, {
            title: 'NewBookCategoryInCategory',
            exclude: ['id'],
            optional: ['categoryId']
          }),
        },
      },
    }) bookCategory: Omit<BookCategory, 'id'>,
  ): Promise<BookCategory> {
    return this.categoryRepository.bookCategories(id).create(bookCategory);
  }

  @patch('/categories/{id}/book-categories', {
    responses: {
      '200': {
        description: 'Category.BookCategory PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BookCategory, {partial: true}),
        },
      },
    })
    bookCategory: Partial<BookCategory>,
    @param.query.object('where', getWhereSchemaFor(BookCategory)) where?: Where<BookCategory>,
  ): Promise<Count> {
    return this.categoryRepository.bookCategories(id).patch(bookCategory, where);
  }

  @del('/categories/{id}/book-categories', {
    responses: {
      '200': {
        description: 'Category.BookCategory DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(BookCategory)) where?: Where<BookCategory>,
  ): Promise<Count> {
    return this.categoryRepository.bookCategories(id).delete(where);
  }
}
