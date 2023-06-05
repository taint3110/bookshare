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
  Series,
  Book,
} from '../models';
import {SeriesRepository} from '../repositories';

export class SeriesBookController {
  constructor(
    @repository(SeriesRepository) protected seriesRepository: SeriesRepository,
  ) { }

  @get('/series/{id}/books', {
    responses: {
      '200': {
        description: 'Array of Series has many Book',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Book)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Book>,
  ): Promise<Book[]> {
    return this.seriesRepository.books(id).find(filter);
  }

  @post('/series/{id}/books', {
    responses: {
      '200': {
        description: 'Series model instance',
        content: {'application/json': {schema: getModelSchemaRef(Book)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Series.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {
            title: 'NewBookInSeries',
            exclude: ['id'],
            optional: ['seriesId']
          }),
        },
      },
    }) book: Omit<Book, 'id'>,
  ): Promise<Book> {
    return this.seriesRepository.books(id).create(book);
  }

  @patch('/series/{id}/books', {
    responses: {
      '200': {
        description: 'Series.Book PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {partial: true}),
        },
      },
    })
    book: Partial<Book>,
    @param.query.object('where', getWhereSchemaFor(Book)) where?: Where<Book>,
  ): Promise<Count> {
    return this.seriesRepository.books(id).patch(book, where);
  }

  @del('/series/{id}/books', {
    responses: {
      '200': {
        description: 'Series.Book DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Book)) where?: Where<Book>,
  ): Promise<Count> {
    return this.seriesRepository.books(id).delete(where);
  }
}
