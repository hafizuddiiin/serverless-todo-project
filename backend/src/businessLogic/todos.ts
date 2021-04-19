import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodos(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string,
): Promise<TodoItem> {
    const itemId = uuid.v4()

    return await todoAccess.createTodo({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
    })
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    userId: string,
): Promise<void> {
    const todo = await todoAccess.getTodo(todoId, userId)

    todoAccess.updateTodo(todo.todoId, todo.createdAt, updateTodoRequest)
}

export async function deleteTodo(
    todoId: string,
    userId: string,
): Promise<void> {
    const todo = await todoAccess.getTodo(todoId, userId)

    await todoAccess.deleteTodo(todo.todoId, todo.userId)
}

export async function attachImage(
    todoId: string,
    userId: string,
    attachmentUrl: string,
): Promise<void> {
    const todo = await todoAccess.getTodo(todoId, userId)

    todoAccess.setAttachmentUrl(todo.todoId, todo.userId, attachmentUrl)
}