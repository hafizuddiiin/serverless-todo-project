import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS);

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_DYNAMODB_TABLE,
  ) { }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
    })
    .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodo(todoId: string, userId: string): Promise<TodoItem> {
    const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'todoId = :todoId and userId = :userId',
        ExpressionAttributeValues: {
          ':todoId': todoId,
          ':userId': userId,
        },
    })
    .promise()

    const item = result.Items[0]
    return item as TodoItem
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem,
    })
    .promise()

    return todoItem
  }

  async updateTodo(
    todoId: string,
    createdAt: string,
    todoUpdate: TodoUpdate,
  ): Promise<void> {
    this.docClient.update({
        TableName: this.todosTable,
        Key: {
          todoId,
          createdAt,
        },
        UpdateExpression:
          'set #n = :name, done = :done, dueDate = :dueDate',
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':done': todoUpdate.done,
          ':dueDate': todoUpdate.dueDate,
        },
        ExpressionAttributeNames: {
          '#n': 'name', 
        },
        ReturnValues: 'UPDATED_NEW',
    })
    .promise()
  }

  async setAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentUrl: string,
  ): Promise<void> {
    this.docClient.update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId,
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl,
        },
        ReturnValues: 'UPDATED_NEW',
    })
    .promise()
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId,
        },
    })
    .promise()
  }
}


function createDynamoDBClient(): DocumentClient {
    return new XAWS.DynamoDB.DocumentClient()
}