import { Entity, model, property } from '@loopback/repository'
import { EEmailConfigurationId } from '../enums/email-configuration'

@model()
export class EmailConfiguration extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
    jsonSchema: {
      enum: Object.values(EEmailConfigurationId)
    }
  })
  id: EEmailConfigurationId

  @property({
    type: 'string',
    required: true
  })
  templateId: string

  @property({
    type: 'string',
    required: true
  })
  senderEmail: string

  @property({
    type: 'string',
    required: true
  })
  subject: string

  constructor(data?: Partial<EmailConfiguration>) {
    super(data)
  }
}

export interface EmailConfigurationRelations {
  // describe navigational properties here
}

export type EmailConfigurationWithRelations = EmailConfiguration & EmailConfigurationRelations
