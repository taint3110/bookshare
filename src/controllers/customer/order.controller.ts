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
import omit from 'lodash/omit';
import {EBookStatusEnum} from '../../enums/book';
import {EOrderStatusEnum} from '../../enums/order';
import {EAccountType} from '../../enums/user';
import {Book, Order} from '../../models';
import {BookRepository, OrderRepository} from '../../repositories';
import {OrderService} from '../../services';
import {PaginationList} from '../../types';
import {getValidArray} from '../../utils/common';

@api({basePath: `/${EAccountType.CUSTOMER}`})
export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(BookRepository)
    public bookRepository: BookRepository,
    @service(OrderService)
    public orderService: OrderService,
  ) {}

  @post('/orders')
  @response(200, {
    description: 'Order model instance',
    content: {'application/json': {schema: getModelSchemaRef(Order)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            title: 'NewOrder',
            exclude: ['id'],
          }),
        },
      },
    })
    order: Omit<Order, 'id'>,
  ): Promise<Order> {
    return this.orderRepository.create(order);
  }

  @get('/orders/count')
  @response(200, {
    description: 'Order model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Order) where?: Where<Order>): Promise<Count> {
    return this.orderRepository.count(where);
  }

  @get('/orders')
  @response(200, {
    description: 'Array of Order model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Order) filter?: Filter<Order>): Promise<Order[]> {
    return this.orderRepository.find(filter);
  }

  @patch('/orders')
  @response(200, {
    description: 'Order PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Order,
    @param.where(Order) where?: Where<Order>,
  ): Promise<Count> {
    return this.orderRepository.updateAll(order, where);
  }

  @get('/orders/{id}')
  @response(200, {
    description: 'Order model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, {includeRelations: true}),
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Order> {
    return this.orderService.getDetails(id);
  }

  @patch('/orders')
  @response(204, {
    description: 'Order PATCH success',
  })
  async updateById(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            partial: true,
            includeRelations: true,
          }),
        },
      },
    })
    order: Order,
  ): Promise<void> {
    const foundOrder: Order | null = await this.orderRepository.findOne({
      where: {userId: order?.userId, orderStatus: EOrderStatusEnum.NEW},
    });
    if (foundOrder) {
      let totalPrice = 0;
      let totalBonusPointPrice = 0;
      if (Array.isArray(order?.bookList) && order?.bookList.length > 0) {
        getValidArray(order?.bookList).map(async (book: Book) => {
          if (book.bookStatus === EBookStatusEnum.ORDERED) {
            totalPrice += book?.price ?? 0;
            totalBonusPointPrice += book?.bonusPointPrice ?? 0;
          }
          await this.bookRepository.updateById(book.id, {
            ...book,
            orderId: foundOrder.id,
          });
        });
        await this.orderRepository.updateById(foundOrder.id, {
          ...omit(order, 'bookList', 'id'),
          totalPrice,
          totalBonusPointPrice,
        });
        return;
      }
    }
    if (Array.isArray(order?.bookList) && order?.bookList.length > 0) {
      const newOrder: Order = await this.orderRepository.create({
        ...omit(order, 'bookList', 'id'),
        orderStatus: EOrderStatusEnum.NEW,
        rentLength: 1,
        totalPrice: order.bookList[0].price,
        totalBonusPointPrice: order.bookList[0].bonusPointPrice,
      });
      getValidArray(order?.bookList).map(async (book: Book) => {
        await this.bookRepository.updateById(book.id, {
          ...book,
          orderId:
            book?.bookStatus === EBookStatusEnum.ORDERED
              ? newOrder?.id
              : order?.id,
        });
      });
    }
  }

  @put('/orders/{id}')
  @response(204, {
    description: 'Order PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() order: Order,
  ): Promise<void> {
    await this.orderRepository.replaceById(id, order);
  }

  @del('/orders/{id}')
  @response(204, {
    description: 'Order DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.orderRepository.deleteById(id);
  }

  @get('/orders/paginate')
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
    @param.filter(Order) filter?: Filter<Order>,
  ): Promise<PaginationList<Order>> {
    return this.orderService.paginate(filter);
  }
}
