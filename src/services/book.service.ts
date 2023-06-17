import {BindingScope, injectable} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {Book} from '../models';
import {BookRepository} from '../repositories';
import {AggregationCount, AggregationPipeline, PaginationList} from '../types';
import {getDefaultPipeline, getTitleFilterPipeline} from '../utils/book';

@injectable({scope: BindingScope.TRANSIENT})
export class BookService {
  constructor(
    @repository(BookRepository)
    public bookRepository: BookRepository,
  ) {}

  async paginate(filter?: Filter<Book>): Promise<PaginationList<Book>> {
    const pipeline: AggregationPipeline = getDefaultPipeline(filter);
    const titleQuery: AggregationPipeline | null =
      getTitleFilterPipeline(filter);
    const countPipeline: AggregationPipeline = [
      {
        $match: {
          isDeleted: {
            $ne: true,
          },
        },
      },
      {
        $count: 'totalCount',
      },
    ];
    const skip = filter?.skip ?? filter?.offset;
    if (skip) {
      pipeline.push({
        $skip: skip,
      });
      countPipeline.push({
        $skip: skip,
      });
    }
    if (filter?.limit) {
      pipeline.push({
        $limit: filter?.limit,
      });
      countPipeline.push({
        $limit: filter?.limit,
      });
    }
    if (titleQuery) {
      pipeline.unshift(...titleQuery);
      countPipeline.unshift(...titleQuery);
    }
    const bookCollection =
      this.bookRepository.dataSource?.connector?.collection(
        this.bookRepository?.modelClass?.name,
      );
    const [results, countResponse] = (await Promise.all([
      bookCollection.aggregate(pipeline).get(),
      bookCollection.aggregate(countPipeline).get(),
    ])) as [Book[], [AggregationCount]];

    return {results, totalCount: countResponse[0]?.totalCount};
  }

  async deleteById(id: string): Promise<void> {
    await this.bookRepository.deleteById(id);
  }

  //*INFO: May use later
  // async getDetails(buildiumUnitId: number): Promise<UnitWithRelations> {
  //   const pipeline: AggregationPipeline = getRoomDetailPipeline(buildiumUnitId);
  //   const unitCollection =
  //     this.bookRepository.dataSource?.connector?.collection(
  //       this.bookRepository?.modelClass?.name,
  //     );
  //   const [result] = (await unitCollection.aggregate(pipeline).get()) as [
  //     UnitWithRelations,
  //   ];
  //   return result;
  // }
}
