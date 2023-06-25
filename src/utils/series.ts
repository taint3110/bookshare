import {Filter} from '@loopback/repository';
import get from 'lodash/get';
import trim from 'lodash/trim';
import {Series} from '../models';
import {AggregationPipeline} from '../types';
import {convertLoopbackFilterOrderToMongoAggregationSort} from './filter';

export function getDefaultPipeline(
  filter?: Filter<Series>,
): AggregationPipeline {
  return [
    {
      $match: {
        isDeleted: {
          $ne: true,
        },
      },
    },
    {
      $project: {
        id: '$_id',
        _id: '$$REMOVE',
        title: '$title',
        author: '$author',
        releaseDate: '$releaseDate',
        status: '$status',
        description: '$description',
        isDeleted: '$isDeleted',
      },
    },
    {
      $sort: filter?.order
        ? convertLoopbackFilterOrderToMongoAggregationSort(filter?.order)
        : {
            updatedAt: -1,
          },
    },
  ];
}

export function getTitleFilterPipeline(
  filter?: Filter<Series>,
): AggregationPipeline | null {
  const titleFilter = String(get(filter, 'where.title', ''));
  if (titleFilter) {
    const titleQuery: AggregationPipeline = [
      {
        $addFields: {
          regexTitle: {
            $regexMatch: {
              input: {$toString: '$title'},
              regex: `.*${trim(titleFilter)}.*`,
              options: 'i',
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $or: ['$regexTitle'],
          },
        },
      },
      {
        $unset: ['regexTitle'],
      },
    ];
    return titleQuery;
  }
  return null;
}
