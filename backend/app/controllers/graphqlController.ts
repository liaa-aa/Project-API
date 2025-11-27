import type { HttpContext } from '@adonisjs/core/http'
import { graphql } from 'graphql'
import { schema } from '../graphql/schema.js'
import { root } from '../graphql/resolver.js'

export default class GraphqlController {
  public async handle({ request, response }: HttpContext) {
    const { query, variables, operationName } = request.only([
      'query',
      'variables',
      'operationName',
    ])

    const user = (request as any).user

    const result = await graphql({
      schema,
      source: query,
      variableValues: variables,
      operationName,
      rootValue: root,
      contextValue: { user },
    })

    return response.send(result)
  }
  public async index({ response }: HttpContext) {
    return response.send('GraphQL Endpoint is working')
  }
}
