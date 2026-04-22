import "server-only"

import type {
  TodoTask as MicrosoftTodoTask,
  TodoTaskList,
} from "@microsoft/microsoft-graph-types"

import { getGraphClient } from "@/lib/services/microsoft-graph"
import type { Task, TaskProvider } from "@/types/integrations"

interface GraphListsResponse {
  value?: TodoTaskList[]
}

interface GraphTasksResponse {
  value?: MicrosoftTodoTask[]
}

export class MicrosoftToDoProvider implements TaskProvider {
  constructor(private readonly accessToken: string) {}

  async getTasks(): Promise<Task[]> {
    const client = getGraphClient(this.accessToken)
    const lists = ((await client.api("/me/todo/lists").get()) as GraphListsResponse)
      .value ?? []

    const tasksByList = await Promise.all(
      lists
        .filter((list) => list.id)
        .map(async (list) => {
          const response = (await client
            .api(`/me/todo/lists/${list.id}/tasks`)
            .filter("status ne 'completed'")
            .select("id,title,dueDateTime,importance,status")
            .top(200)
            .get()) as GraphTasksResponse

          return response.value ?? []
        })
    )

    return tasksByList.flat().map((task) => ({
      id: task.id ?? "",
      externalId: task.id ?? "",
      title: task.title?.trim() || "(Untitled task)",
      dueDate: task.dueDateTime?.dateTime?.split("T")[0] ?? null,
      importance: task.importance ?? "normal",
      status: task.status ?? "notStarted",
    }))
  }

  async updateTaskStatus(
    taskId: string,
    status: "notStarted" | "inProgress" | "completed" | "waitingOnOthers" | "deferred",
  ): Promise<void> {
    const client = getGraphClient(this.accessToken)

    await client.api(`/me/todo/lists/tasks/${taskId}`).patch({
      status,
    })
  }
}
