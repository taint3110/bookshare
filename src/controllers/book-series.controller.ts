import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Book,
  Series,
} from '../models';
import {BookRepository} from '../repositories';

export class BookSeriesController {
  constructor(
    @repository(BookRepository)
    public bookRepository: BookRepository,
  ) { }

  @get('/books/{id}/series', {
    responses: {
      '200': {
        description: 'Series belonging to Book',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Series),
          },
        },
      },
    },
  })
  async getSeries(
    @param.path.string('id') id: typeof Book.prototype.id,
  ): Promise<Series> {
    return this.bookRepository.series(id);
  }
}
