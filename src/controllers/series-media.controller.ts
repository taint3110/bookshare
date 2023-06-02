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
  Media,
} from '../models';
import {SeriesRepository} from '../repositories';

export class SeriesMediaController {
  constructor(
    @repository(SeriesRepository) protected seriesRepository: SeriesRepository,
  ) { }

  @get('/series/{id}/media', {
    responses: {
      '200': {
        description: 'Array of Series has many Media',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Media)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Media>,
  ): Promise<Media[]> {
    return this.seriesRepository.media(id).find(filter);
  }

  @post('/series/{id}/media', {
    responses: {
      '200': {
        description: 'Series model instance',
        content: {'application/json': {schema: getModelSchemaRef(Media)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Series.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Media, {
            title: 'NewMediaInSeries',
            exclude: ['id'],
            optional: ['seriesId']
          }),
        },
      },
    }) media: Omit<Media, 'id'>,
  ): Promise<Media> {
    return this.seriesRepository.media(id).create(media);
  }

  @patch('/series/{id}/media', {
    responses: {
      '200': {
        description: 'Series.Media PATCH success count',
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
    return this.seriesRepository.media(id).patch(media, where);
  }

  @del('/series/{id}/media', {
    responses: {
      '200': {
        description: 'Series.Media DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Media)) where?: Where<Media>,
  ): Promise<Count> {
    return this.seriesRepository.media(id).delete(where);
  }
}
