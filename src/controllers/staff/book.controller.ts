import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  api,
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {EUserRoleEnum} from '../../enums/user';
import {Book, BookWithRelations} from '../../models';
import {BookCategoryRepository, BookRepository} from '../../repositories';
import {BookService} from '../../services';
import {PaginationList} from '../../types';
import {getValidArray} from '../../utils/common';

@api({basePath: `/${EUserRoleEnum.STAFF}`})
export class BookController {
  constructor(
    @repository(BookRepository)
    public bookRepository: BookRepository,
    @repository(BookCategoryRepository)
    public bookCategoryRepository: BookCategoryRepository,
    @service(BookService)
    public bookService: BookService,
  ) {}

  @post('/books')
  @response(200, {
    description: 'Book model instance',
    content: {'application/json': {schema: getModelSchemaRef(Book)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {
            title: 'NewBook',
            exclude: ['id'],
          }),
        },
      },
    })
    book: Omit<Book, 'id'>,
  ): Promise<Book> {
    return this.bookRepository.create(book);
  }

  @get('/books/count')
  @response(200, {
    description: 'Book model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Book) where?: Where<Book>): Promise<Count> {
    return this.bookRepository.count(where);
  }

  @get('/books')
  @response(200, {
    description: 'Array of Book model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Book, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Book) filter?: Filter<Book>): Promise<Book[]> {
    return this.bookRepository.find(filter);
  }

  @patch('/books')
  @response(200, {
    description: 'Book PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {partial: true}),
        },
      },
    })
    book: Book,
    @param.where(Book) where?: Where<Book>,
  ): Promise<Count> {
    return this.bookRepository.updateAll(book, where);
  }

  @get('/books/{id}')
  @response(200, {
    description: 'Book model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Book, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<BookWithRelations> {
    return this.bookService.getDetails(id);
  }

  @patch('/books/{id}')
  @response(204, {
    description: 'Book PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {partial: true}),
        },
      },
    })
    book: BookWithRelations,
    @param.query.string('categoryIds') categoryIds?: string,
  ): Promise<void> {
    await this.bookRepository.bookCategories(id).delete();
    if (categoryIds) {
      const ids: string[] = getValidArray(categoryIds.split(','));
      if (Array.isArray(ids) && ids.length > 0) {
        getValidArray(ids).map(async categoryId => {
          await this.bookCategoryRepository.create({
            bookId: id,
            categoryId: String(categoryId),
          });
        });
      }
    }
    await this.bookRepository.updateById(id, {...book, updatedAt: new Date()});
  }

  @put('/books/{id}')
  @response(204, {
    description: 'Book PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() book: Book,
  ): Promise<void> {
    await this.bookRepository.replaceById(id, book);
  }

  @del('/books/{id}')
  @response(204, {
    description: 'Book DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.bookRepository.updateById(id, {
      isDeleted: true,
    });
  }

  @get('/books/paginate')
  @response(200, {
    description: 'Array of Boook model instances',
    content: {
      'application/json': {
        schema: {
          type: 'object',
        },
      },
    },
  })
  async paginate(
    @param.filter(Book) filter?: Filter<Book>,
  ): Promise<PaginationList<Book>> {
    return this.bookService.paginate(filter);
  }
}
