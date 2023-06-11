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
  Order,
  Book,
} from '../models';
import {OrderRepository} from '../repositories';

export class OrderBookController {
  constructor(
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) { }

  @get('/orders/{id}/books', {
    responses: {
      '200': {
        description: 'Array of Order has many Book',
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
    return this.orderRepository.books(id).find(filter);
  }

  @post('/orders/{id}/books', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(Book)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Order.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {
            title: 'NewBookInOrder',
            exclude: ['id'],
            optional: ['orderId']
          }),
        },
      },
    }) book: Omit<Book, 'id'>,
  ): Promise<Book> {
    return this.orderRepository.books(id).create(book);
  }

  @patch('/orders/{id}/books', {
    responses: {
      '200': {
        description: 'Order.Book PATCH success count',
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
    return this.orderRepository.books(id).patch(book, where);
  }

  @del('/orders/{id}/books', {
    responses: {
      '200': {
        description: 'Order.Book DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Book)) where?: Where<Book>,
  ): Promise<Count> {
    return this.orderRepository.books(id).delete(where);
  }
}
