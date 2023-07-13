import {BindingScope, injectable} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {Order} from '../models';
import {OrderRepository} from '../repositories';
import {AggregationCount, AggregationPipeline, PaginationList} from '../types';
import {
  getBookDetailPipeline,
  getDefaultPipeline,
  getTitleFilterPipeline,
} from '../utils/order';

@injectable({scope: BindingScope.TRANSIENT})
export class OrderService {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  async paginate(filter?: Filter<Order>): Promise<PaginationList<Order>> {
    const pipeline: AggregationPipeline = getDefaultPipeline(filter);
    const titleQuery: AggregationPipeline | null =
      getTitleFilterPipeline(filter);
    const countPipeline: AggregationPipeline = [
      ...pipeline,
      {
        $count: 'totalCount',
      },
    ];
    const skip = filter?.skip ?? filter?.offset;
    if (skip) {
      pipeline.push({
        $skip: skip,
      });
    }
    if (filter?.limit) {
      pipeline.push({
        $limit: filter?.limit,
      });
    }
    if (titleQuery) {
      pipeline.unshift(...titleQuery);
      countPipeline.unshift(...titleQuery);
    }
    const bookCollection =
      this.orderRepository.dataSource?.connector?.collection(
        this.orderRepository?.modelClass?.name,
      );
    const [results, countResponse] = (await Promise.all([
      bookCollection.aggregate(pipeline).get(),
      bookCollection.aggregate(countPipeline).get(),
    ])) as [Order[], [AggregationCount]];

    return {results, totalCount: countResponse[0]?.totalCount};
  }

  async deleteById(id: string): Promise<void> {
    await this.orderRepository.deleteById(id);
  }

  async getDetails(orderId: string): Promise<Order> {
    const pipeline: AggregationPipeline = getBookDetailPipeline(orderId);
    const bookCollection =
      this.orderRepository.dataSource?.connector?.collection(
        this.orderRepository?.modelClass?.name,
      );
    const [result] = (await bookCollection.aggregate(pipeline).get()) as [
      Order,
    ];
    return result;
  }
}
