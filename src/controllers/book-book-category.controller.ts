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
  Book,
  BookCategory,
} from '../models';
import {BookRepository} from '../repositories';

export class BookBookCategoryController {
  constructor(
    @repository(BookRepository) protected bookRepository: BookRepository,
  ) { }

  @get('/books/{id}/book-categories', {
    responses: {
      '200': {
        description: 'Array of Book has many BookCategory',
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
    return this.bookRepository.bookCategories(id).find(filter);
  }

  @post('/books/{id}/book-categories', {
    responses: {
      '200': {
        description: 'Book model instance',
        content: {'application/json': {schema: getModelSchemaRef(BookCategory)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Book.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BookCategory, {
            title: 'NewBookCategoryInBook',
            exclude: ['id'],
            optional: ['bookId']
          }),
        },
      },
    }) bookCategory: Omit<BookCategory, 'id'>,
  ): Promise<BookCategory> {
    return this.bookRepository.bookCategories(id).create(bookCategory);
  }

  @patch('/books/{id}/book-categories', {
    responses: {
      '200': {
        description: 'Book.BookCategory PATCH success count',
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
    return this.bookRepository.bookCategories(id).patch(bookCategory, where);
  }

  @del('/books/{id}/book-categories', {
    responses: {
      '200': {
        description: 'Book.BookCategory DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(BookCategory)) where?: Where<BookCategory>,
  ): Promise<Count> {
    return this.bookRepository.bookCategories(id).delete(where);
  }
}
