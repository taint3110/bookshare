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
  Media,
} from '../models';
import {BookRepository} from '../repositories';

export class BookMediaController {
  constructor(
    @repository(BookRepository) protected bookRepository: BookRepository,
  ) { }

  @get('/books/{id}/media', {
    responses: {
      '200': {
        description: 'Book has one Media',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Media),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Media>,
  ): Promise<Media> {
    return this.bookRepository.media(id).get(filter);
  }

  @post('/books/{id}/media', {
    responses: {
      '200': {
        description: 'Book model instance',
        content: {'application/json': {schema: getModelSchemaRef(Media)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Book.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Media, {
            title: 'NewMediaInBook',
            exclude: ['id'],
            optional: ['bookId']
          }),
        },
      },
    }) media: Omit<Media, 'id'>,
  ): Promise<Media> {
    return this.bookRepository.media(id).create(media);
  }

  @patch('/books/{id}/media', {
    responses: {
      '200': {
        description: 'Book.Media PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Media, {partial: true}),
        },
      },
    })
    media: Partial<Media>,
    @param.query.object('where', getWhereSchemaFor(Media)) where?: Where<Media>,
  ): Promise<Count> {
    return this.bookRepository.media(id).patch(media, where);
  }

  @del('/books/{id}/media', {
    responses: {
      '200': {
        description: 'Book.Media DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Media)) where?: Where<Media>,
  ): Promise<Count> {
    return this.bookRepository.media(id).delete(where);
  }
}
