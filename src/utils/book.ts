import {Filter} from '@loopback/repository';
import get from 'lodash/get';
import trim from 'lodash/trim';
import {Book} from '../models';
import {AggregationPipeline} from '../types';
import {convertLoopbackFilterOrderToMongoAggregationSort} from './filter';

export function getDefaultPipeline(filter?: Filter<Book>): AggregationPipeline {
  return [
    {
      $match: {
        isDeleted: {
          $ne: true,
        },
      },
    },
    // {
    //   $lookup: {
    //     from: 'Listing',
    //     localField: 'buildiumUnitId',
    //     foreignField: 'buildiumUnitId',
    //     as: 'listing',
    //   },
    // },
    // {
    //   $unwind: {
    //     path: '$listing',
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    // {
    //   $lookup: {
    //     from: 'Property',
    //     localField: 'buildiumPropertyId',
    //     foreignField: 'buildiumPropertyId',
    //     as: 'property',
    //   },
    // },
    // {
    //   $unwind: {
    //     path: '$property',
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    {
      $project: {
        id: '$_id',
        _id: '$$REMOVE',
        title: '$title',
        author: '$author',
        price: '$price',
        status: '$status',
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
  filter?: Filter<Book>,
): AggregationPipeline | null {
  const titleFilter = String(get(filter, 'where.title', ''));
  if (titleFilter) {
    const titleQuery: AggregationPipeline = [
      {
        $addFields: {
          regexUnitNumber: {
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
            $or: ['$regexUnitNumber'],
          },
        },
      },
      {
        $unset: ['regexUnitNumber'],
      },
    ];
    return titleQuery;
  }
  return null;
}
