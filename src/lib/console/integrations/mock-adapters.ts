/**
 * Founder Console — local/mock integration adapters.
 *
 * These satisfy the provider interfaces without touching any vendor. They are
 * the only implementations wired for the MVP. Replacing any one of them with a
 * real adapter is the future integration path.
 */

import { DeterministicEaProvider } from "@/lib/console/ea/deterministic-ea"
import type {
  DeploymentProvider,
  IntegrationRegistry,
  KnowledgeProvider,
  NotificationProvider,
  SourceControlProvider,
  VoiceProvider,
} from "./providers"

class ConsoleLogNotificationProvider implements NotificationProvider {
  readonly name = "console-log"
  async notify(input: {
    title: string
    body: string
    priority: "low" | "normal" | "high"
  }): Promise<void> {
    // MVP: notifications are a no-op beyond a server log line.
    console.info(`[notify:${input.priority}] ${input.title} — ${input.body}`)
  }
}

class DisabledVoiceProvider implements VoiceProvider {
  readonly name = "disabled"
  readonly enabled = false
}

class StubSourceControlProvider implements SourceControlProvider {
  readonly name = "stub"
  linkForEvidence(ref: string): string {
    return ref
  }
}

class EmptyKnowledgeProvider implements KnowledgeProvider {
  readonly name = "empty"
  async search(): Promise<Array<{ title: string; href: string }>> {
    // Placeholder for the future Organizational Mind retrieval layer.
    return []
  }
}

class DisabledDeploymentProvider implements DeploymentProvider {
  readonly name = "disabled"
  readonly enabled = false
}

let registry: IntegrationRegistry | null = null

/** The active integration registry (mock adapters for the MVP). */
export function getIntegrations(): IntegrationRegistry {
  if (!registry) {
    registry = {
      conversation: new DeterministicEaProvider(),
      agent: null, // No real agent backend in the MVP.
      notification: new ConsoleLogNotificationProvider(),
      voice: new DisabledVoiceProvider(),
      sourceControl: new StubSourceControlProvider(),
      knowledge: new EmptyKnowledgeProvider(),
      deployment: new DisabledDeploymentProvider(),
    }
  }
  return registry
}
