import assert from "node:assert/strict"
import { test } from "node:test"

import { composeReply, matchIntent } from "@/lib/console/ea/deterministic-ea"
import { createSeedState } from "@/lib/console/persistence/seed"

const state = createSeedState()

test("recognizes the core command intents", () => {
  assert.equal(matchIntent("Give me an update.", state).intent, "update")
  assert.equal(matchIntent("What needs my attention?", state).intent, "attention")
  assert.equal(matchIntent("Show me blocked work.", state).intent, "blocked")
  assert.equal(matchIntent("Prepare my morning brief.", state).intent, "morning-brief")
  assert.equal(
    matchIntent("Create an assignment for the Knowledge Architect.", state).intent,
    "create-assignment",
  )
})

test("resolves an officer question to the officer-work intent", () => {
  const match = matchIntent("What is the Product Manager working on?", state)
  assert.equal(match.intent, "officer-work")
})

test("update reply reports health and metrics", () => {
  const reply = composeReply("give me an update", state)
  assert.match(reply.text, /officers active/i)
})

test("attention reply lists waiting decisions", () => {
  const reply = composeReply("what needs my attention", state)
  assert.match(reply.text, /decision/i)
})

test("blocked reply names the blocked assignment", () => {
  const reply = composeReply("show me blocked work", state)
  assert.match(reply.text, /Organizational Mind Architecture/i)
})

test("officer-work reply names the officer and their assignment", () => {
  const reply = composeReply("what is the product manager working on", state)
  assert.match(reply.text, /Marcus|Product Manager/)
  assert.match(reply.text, /Outcome Map/i)
})

test("morning brief greets the director", () => {
  const reply = composeReply("prepare my morning brief", state)
  assert.match(reply.text, /morning, Minh/i)
})

test("unknown input falls back to help", () => {
  const reply = composeReply("asdfghjkl", state)
  assert.equal(reply.intent, "unknown")
  assert.match(reply.text, /Executive Assistant/i)
})
