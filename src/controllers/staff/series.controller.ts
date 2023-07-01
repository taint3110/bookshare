import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
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
import {Series} from '../../models';
import {MediaRepository, SeriesRepository} from '../../repositories';
import {SeriesService} from '../../services/series.service';
import {PaginationList} from '../../types';

@api({basePath: `/${EUserRoleEnum.STAFF}`})
export class SeriesController {
  constructor(
    @repository(SeriesRepository)
    public seriesRepository: SeriesRepository,
    @repository(MediaRepository)
    public mediaRepository: MediaRepository,
    @service(SeriesService)
    public seriesService: SeriesService,
  ) {}

  @post('/series')
  @response(200, {
    description: 'Series model instance',
    content: {'application/json': {schema: getModelSchemaRef(Series)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Series, {
            title: 'NewSeries',
            exclude: ['id'],
          }),
        },
      },
    })
    series: Omit<Series, 'id'>,
  ): Promise<Series> {
    return this.seriesRepository.create(series);
  }

  @get('/series/count')
  @response(200, {
    description: 'Series model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Series) where?: Where<Series>): Promise<Count> {
    return this.seriesRepository.count(where);
  }

  @get('/series')
  @response(200, {
    description: 'Array of Series model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Series, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Series) filter?: Filter<Series>): Promise<Series[]> {
    return this.seriesRepository.find(filter);
  }

  @patch('/series')
  @response(200, {
    description: 'Series PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Series, {partial: true}),
        },
      },
    })
    series: Series,
    @param.where(Series) where?: Where<Series>,
  ): Promise<Count> {
    return this.seriesRepository.updateAll(series, where);
  }

  @get('/series/{id}')
  @response(200, {
    description: 'Series model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Series, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Series, {exclude: 'where'})
    filter?: FilterExcludingWhere<Series>,
  ): Promise<Series> {
    return this.seriesRepository.findById(id, filter);
  }

  @patch('/series/{id}')
  @response(204, {
    description: 'Series PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Series, {partial: true}),
        },
      },
    })
    series: Series,
  ): Promise<void> {
    await this.seriesRepository.updateById(id, {
      ...series,
      updatedAt: new Date(),
    });
  }

  @put('/series/{id}')
  @response(204, {
    description: 'Series PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() series: Series,
  ): Promise<void> {
    await this.seriesRepository.replaceById(id, series);
  }

  @del('/series/{id}')
  @response(204, {
    description: 'Series DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await Promise.all([
      this.seriesRepository.updateById(id, {
        isDeleted: true,
      }),
      this.seriesRepository.books(id).patch({
        isDeleted: true,
      }),
      this.mediaRepository.deleteAll({
        seriesId: id,
      }),
    ]);
  }

  @get('/series/paginate')
  @response(200, {
    description: 'Array of Series model instances',
    content: {
      'application/json': {
        schema: {
          type: 'object',
        },
      },
    },
  })
  async paginate(
    @param.filter(Series) filter?: Filter<Series>,
  ): Promise<PaginationList<Series>> {
    return this.seriesService.paginate(filter);
  }
}
