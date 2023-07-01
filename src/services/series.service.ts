import {BindingScope, injectable} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {Series} from '../models';
import {SeriesRepository} from '../repositories';
import {AggregationCount, AggregationPipeline, PaginationList} from '../types';
import {getDefaultPipeline, getTitleFilterPipeline} from '../utils/series';

@injectable({scope: BindingScope.TRANSIENT})
export class SeriesService {
  constructor(
    @repository(SeriesRepository)
    public seriesRepository: SeriesRepository,
  ) {}

  async paginate(filter?: Filter<Series>): Promise<PaginationList<Series>> {
    const pipeline: AggregationPipeline = getDefaultPipeline(filter);
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
    const titleQuery: AggregationPipeline | null =
      getTitleFilterPipeline(filter);
    if (titleQuery) {
      pipeline.unshift(...titleQuery);
      countPipeline.unshift(...titleQuery);
    }
    const seriesCollection =
      this.seriesRepository.dataSource?.connector?.collection(
        this.seriesRepository?.modelClass?.name,
      );
    const [results, countResponse] = (await Promise.all([
      seriesCollection.aggregate(pipeline).get(),
      seriesCollection.aggregate(countPipeline).get(),
    ])) as [Series[], [AggregationCount]];

    return {results, totalCount: countResponse[0]?.totalCount};
  }

  async deleteById(id: string): Promise<void> {
    await this.seriesRepository.deleteById(id);
  }
}
