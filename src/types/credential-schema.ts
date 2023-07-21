import { SchemaObject } from '@loopback/rest'

export const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string',
      minLength: 6
    }
  }
}

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': { schema: CredentialsSchema }
  }
}

export const EmailCredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string',
      minLength: 6
    }
  }
}

export const EmailCredentialsRequestBody = {
  description: 'The input of login with email function',
  required: true,
  content: {
    'application/json': { schema: EmailCredentialsSchema }
  }
}

export const PhoneNumberCredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['phoneNumber'],
  properties: {
    phoneNumber: {
      type: 'string'
    }
  }
}

export const PhoneNumberCredentialsRequestBody = {
  description: 'The input of login with phoneNumber function',
  required: true,
  content: {
    'application/json': { schema: PhoneNumberCredentialsSchema }
  }
}
