export function convertLoopbackFilterOrderToMongoAggregationSort(
  order: string[],
): Record<string, number> {
  const sortCriteria: Record<string, number> = {};
  order.forEach(orderCriterion => {
    const extractedData = orderCriterion.split(' ');
    sortCriteria[extractedData[0]] =
      extractedData[1].toUpperCase() === 'ASC' ? 1 : -1;
  });

  return sortCriteria;
}
