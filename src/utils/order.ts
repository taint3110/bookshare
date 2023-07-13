import {Filter} from '@loopback/repository';
import get from 'lodash/get';
import trim from 'lodash/trim';
import {Order} from '../models';
import {AggregationPipeline} from '../types';
import {convertLoopbackFilterOrderToMongoAggregationSort} from './filter';

export function getDefaultPipeline(
  filter?: Filter<Order>,
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
      $lookup: {
        from: 'Book',
        let: {
          orderId: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {$ne: ['$isDeleted', true]},
                  {
                    $eq: ['$orderId', '$$orderId'],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'Media',
              localField: '_id',
              foreignField: 'bookId',
              as: 'media',
            },
          },
          {
            $unwind: {
              path: '$media',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'Series',
              localField: 'seriesId',
              foreignField: '_id',
              as: 'series',
            },
          },
          {
            $unwind: {
              path: '$series',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'BookCategory',
              localField: '_id',
              foreignField: 'bookId',
              as: 'bookCategories',
            },
          },
          {
            $unwind: {
              path: '$bookCategories',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'Category',
              localField: 'bookCategories.categoryId',
              foreignField: '_id',
              as: 'bookCategoryList',
            },
          },
          {
            $unwind: {
              path: '$bookCategoryList',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: '$_id',
              bookCategoryList: {
                $push: '$bookCategoryList',
              },
              data: {$first: '$$ROOT'},
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  '$data',
                  {bookCategoryList: '$bookCategoryList'},
                ],
              },
            },
          },
          {
            $project: {
              id: '$_id',
              _id: '$$REMOVE',
              title: '$title',
              author: '$author',
              price: '$price',
              bookStatus: '$bookStatus',
              series: '$series',
              categories: '$bookCategoryList',
              description: '$description',
              bonusPointPrice: '$bonusPointPrice',
              releaseDate: '$releaseDate',
              publisher: '$publisher',
              language: '$language',
              media: '$media',
              bookCover: '$bookCover',
              bookCondition: '$bookCondition',
              isbn: '$isbn',
              discount: '$discount',
              rentCount: '$rentCount',
              availableStartDate: '$availableStartDate',
              availableEndDate: '$availableEndDate',
              isDeleted: '$isDeleted',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
            },
          },
        ],
        as: 'book',
      },
    },
    {
      $lookup: {
        from: 'Series',
        localField: 'seriesId',
        foreignField: '_id',
        as: 'series',
      },
    },
    {
      $unwind: {
        path: '$series',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        id: '$_id',
        _id: '$$REMOVE',
        rentLength: '$rentLength',
        orderStatus: '$orderStatus',
        description: '$description',
        isDeleted: '$isDeleted',
        createdAt: '$createdAt',
        updatedAt: '$updatedAt',
        bookList: '$book',
        totalPrice: '$totalPrice',
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
  filter?: Filter<Order>,
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

export function getBookDetailPipeline(orderId: string): AggregationPipeline {
  return [
    {
      $addFields: {
        idToString: {
          $toString: '$_id',
        },
      },
    },
    {
      $match: {
        isDeleted: {
          $ne: true,
        },
        idToString: {
          $eq: String(orderId),
        },
      },
    },
    {
      $lookup: {
        from: 'Book',
        let: {
          orderId: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {$ne: ['$isDeleted', true]},
                  {
                    $eq: ['$orderId', '$$orderId'],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'Media',
              localField: '_id',
              foreignField: 'bookId',
              as: 'media',
            },
          },
          {
            $unwind: {
              path: '$media',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'Series',
              localField: 'seriesId',
              foreignField: '_id',
              as: 'series',
            },
          },
          {
            $unwind: {
              path: '$series',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'BookCategory',
              localField: '_id',
              foreignField: 'bookId',
              as: 'bookCategories',
            },
          },
          {
            $unwind: {
              path: '$bookCategories',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'Category',
              localField: 'bookCategories.categoryId',
              foreignField: '_id',
              as: 'bookCategoryList',
            },
          },
          {
            $unwind: {
              path: '$bookCategoryList',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: '$_id',
              bookCategoryList: {
                $push: '$bookCategoryList',
              },
              data: {$first: '$$ROOT'},
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  '$data',
                  {bookCategoryList: '$bookCategoryList'},
                ],
              },
            },
          },
          {
            $project: {
              id: '$_id',
              _id: '$$REMOVE',
              title: '$title',
              author: '$author',
              price: '$price',
              bookStatus: '$bookStatus',
              series: '$series',
              categories: '$bookCategoryList',
              description: '$description',
              bonusPointPrice: '$bonusPointPrice',
              releaseDate: '$releaseDate',
              publisher: '$publisher',
              language: '$language',
              media: '$media',
              bookCover: '$bookCover',
              bookCondition: '$bookCondition',
              isbn: '$isbn',
              discount: '$discount',
              rentCount: '$rentCount',
              availableStartDate: '$availableStartDate',
              availableEndDate: '$availableEndDate',
              isDeleted: '$isDeleted',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
            },
          },
        ],
        as: 'book',
      },
    },
    {
      $lookup: {
        from: 'Series',
        localField: 'seriesId',
        foreignField: '_id',
        as: 'series',
      },
    },
    {
      $unwind: {
        path: '$series',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        id: '$_id',
        _id: '$$REMOVE',
        rentLength: '$rentLength',
        orderStatus: '$orderStatus',
        description: '$description',
        isDeleted: '$isDeleted',
        createdAt: '$createdAt',
        updatedAt: '$updatedAt',
        bookList: '$book',
        totalPrice: '$totalPrice',
      },
    },
  ];
}
