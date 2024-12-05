import {repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  response,
  api,
} from '@loopback/rest';
import {Person} from '../models';
import {PersonRepository} from '../repositories';

@api({basePath: '/family'})
export class PersonController {
  constructor(
    @repository(PersonRepository)
    public personRepository: PersonRepository,
  ) {}

  @post('/persons')
  @response(200, {
    description: 'Person model instance',
    content: {'application/json': {schema: getModelSchemaRef(Person)}},
  })
  async create(@requestBody() person: Person): Promise<Person> {
    return this.personRepository.create(person);
  }

  @get('/persons')
  @response(200, {
    description: 'Array of Person model instances',
    content: {
      'application/json': {
        schema: {type: 'array', items: getModelSchemaRef(Person)},
      },
    },
  })
  async find(): Promise<Person[]> {
    return this.personRepository.find();
  }

  @get('/persons/{id}')
  @response(200, {
    description: 'Person model instance',
    content: {'application/json': {schema: getModelSchemaRef(Person)}},
  })
  async findById(@param.path.string('id') id: string): Promise<Person> {
    return this.personRepository.findById(id);
  }

  @patch('/persons/{id}')
  @response(204, {
    description: 'Person PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() person: Person,
  ): Promise<void> {
    await this.personRepository.updateById(id, person);
  }

  @del('/persons/{id}')
  @response(204, {
    description: 'Person DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.personRepository.deleteById(id);
  }

  @post('/persons/{parentId}/children')
  @response(200, {
    description: 'Add child to parent',
  })
  async addChild(
    @param.path.string('parentId') parentId: string,
    @requestBody() child: {childId: string},
  ): Promise<void> {
    const parent = await this.personRepository.findById(parentId);
    const childPerson = await this.personRepository.findById(child.childId);

    // Add the childId to the parent's childrenIds field (array)
    parent.childrenIds = [...(parent.childrenIds || []), child.childId];

    // Add the parentId to the child's parentsIds field (array)
    childPerson.parentIds = [...(childPerson.parentIds || []), parentId];

    // Save both the parent and the child
    await this.personRepository.updateById(parentId, parent);
    await this.personRepository.updateById(child.childId, childPerson);
  }

  @post('/persons/{personId}/partner')
  @response(200, {
    description: 'Assign partner to person',
  })
  async assignPartner(
    @param.path.string('personId') personId: string,
    @requestBody() partner: {partnerId: string},
  ): Promise<void> {
    const person = await this.personRepository.findById(personId);
    const partnerPerson = await this.personRepository.findById(
      partner.partnerId,
    );

    // Assign the partner ID to both persons (you may need a field like 'partnerId')
    person.partnerId = partner.partnerId;
    partnerPerson.partnerId = personId;

    // Save both persons
    await this.personRepository.updateById(personId, person);
    await this.personRepository.updateById(partner.partnerId, partnerPerson);
  }

  @get('/persons/{id}/parents')
  @response(200, {
    description: 'Get parents of a person',
    content: {
      'application/json': {
        schema: {type: 'array', items: getModelSchemaRef(Person)},
      },
    },
  })
  async getParents(@param.path.string('id') id: string): Promise<Person[]> {
    const person = await this.personRepository.findById(id);

    // Fetch the parents from the person’s parentsIds
    const parents = await this.personRepository.find({
      where: {
        id: {inq: person.parentIds},
      },
    });

    return parents;
  }

  @get('/persons/{id}/children')
  @response(200, {
    description: 'Get children of a person',
    content: {
      'application/json': {
        schema: {type: 'array', items: getModelSchemaRef(Person)},
      },
    },
  })
  async getChildren(@param.path.string('id') id: string): Promise<Person[]> {
    const person = await this.personRepository.findById(id);

    // Fetch the children from the person’s childrenIds
    const children = await this.personRepository.find({
      where: {
        id: {inq: person.childrenIds},
      },
    });

    return children;
  }
}
