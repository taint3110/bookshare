import { inject } from '@loopback/core'
import { DefaultCrudRepository } from '@loopback/repository'
import { MongodbDataSource } from '../datasources'
import { EmailConfiguration, EmailConfigurationRelations } from '../models'

export class EmailConfigurationRepository extends DefaultCrudRepository<
  EmailConfiguration,
  typeof EmailConfiguration.prototype.id,
  EmailConfigurationRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(EmailConfiguration, dataSource)
  }
}
