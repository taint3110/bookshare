import {BindingScope, injectable} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {Book, BookWithRelations} from '../models';
import {BookRepository} from '../repositories';
import {AggregationCount, AggregationPipeline, PaginationList} from '../types';
import {
  getBookDetailPipeline,
  getDefaultPipeline,
  getTitleFilterPipeline,
} from '../utils/book';

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

  async getDetails(bookId: string): Promise<BookWithRelations> {
    const pipeline: AggregationPipeline = getBookDetailPipeline(bookId);
    const bookCollection =
      this.bookRepository.dataSource?.connector?.collection(
        this.bookRepository?.modelClass?.name,
      );
    const [result] = (await bookCollection.aggregate(pipeline).get()) as [
      BookWithRelations,
    ];
    return result;
  }
}
