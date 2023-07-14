import { inject } from '@loopback/core'
import { DefaultCrudRepository } from '@loopback/repository'
import { MongodbDataSource } from '../datasources'
import { UserIdentity } from '../models'

export class UserIdentityRepository extends DefaultCrudRepository<
  UserIdentity,
  typeof UserIdentity.prototype.id,
  UserIdentity
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(UserIdentity, dataSource)
  }
}
