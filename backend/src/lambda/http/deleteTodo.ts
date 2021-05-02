import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { parseUserId } from "../../auth/utils"
import { deleteTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'

const logger = createLogger('deleteTodo')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('processing delete todo', event)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  const todoId = event.pathParameters.todoId

  await deleteTodo(todoId, userId)
  
  return {
    statusCode: 204,
    body: 'todo deleted successfully',
  }
}).use(cors({ credentials: true }))