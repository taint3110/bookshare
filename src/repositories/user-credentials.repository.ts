import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, BelongsToAccessor } from '@loopback/repository'
import { MongodbDataSource } from '../datasources'
import { UserCredentials, UserCredentialsRelations, User } from '../models'
import { UserRepository } from './user.repository'

export class UserCredentialsRepository extends DefaultCrudRepository<
  UserCredentials,
  typeof UserCredentials.prototype.id,
  UserCredentialsRelations
> {
  public readonly user: BelongsToAccessor<User, typeof UserCredentials.prototype.id>

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>
  ) {
    super(UserCredentials, dataSource)
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter)
    this.registerInclusionResolver('user', this.user.inclusionResolver)
  }
}
