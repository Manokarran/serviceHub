import { planAiBuilderCommandAction } from '@/app/actions/ai-builder.actions'
import { createLocalAiBuilderPlan } from '@/lib/ai-builder/planner'
import type { AiBuilderContext, AiBuilderInsertAt, AiBuilderPlan } from '@/lib/ai-builder/types'

export function constrainPlanToInsertAt(plan: AiBuilderPlan, at: AiBuilderInsertAt): AiBuilderPlan {
  const addOp = plan.operations.find(operation => operation.kind === 'add_block')

  if (!addOp || addOp.kind !== 'add_block') {
    return { reply: plan.reply, operations: [] }
  }

  return {
    reply: plan.reply,
    operations: [{ ...addOp, at }]
  }
}

function localAddProbePrompt(userPrompt: string) {
  const trimmed = userPrompt.trim()

  if (/^\s*(add|insert|include|put|place)\b/i.test(trimmed)) {
    return trimmed
  }

  return `add ${trimmed}`
}

function themedServerPrompt(userPrompt: string, insertLabel: string) {
  return [
    `Add exactly one control for this request.`,
    `Match the page theme and colors so it looks native on this page.`,
    `Placement is already chosen (${insertLabel}) — do not change where it goes.`,
    `Request: ${userPrompt.trim()}`
  ].join(' ')
}

export type PlanAiInsertResult =
  | { success: true; plan: AiBuilderPlan }
  | { success: false; error: string }

/** Plan a single themed add_block and force its placement to `at`. */
export async function planAiInsertAtTarget(input: {
  userPrompt: string
  context: AiBuilderContext
  at: AiBuilderInsertAt
  insertLabel: string
}): Promise<PlanAiInsertResult> {
  const prompt = input.userPrompt.trim()

  if (!prompt) {
    return { success: false, error: 'Describe what to add, or name a control like “pricing” or “contact form”.' }
  }

  const local = createLocalAiBuilderPlan(localAddProbePrompt(prompt), input.context)
  const localAdd = local.plan.operations.find(operation => operation.kind === 'add_block')

  let plan: AiBuilderPlan

  if (local.confidence === 'high' && localAdd) {
    plan = local.plan
  } else {
    const planned = await planAiBuilderCommandAction({
      prompt: themedServerPrompt(prompt, input.insertLabel),
      context: input.context
    })

    if (!planned.success) {
      return { success: false, error: planned.error }
    }

    plan = planned.plan
  }

  const constrained = constrainPlanToInsertAt(plan, input.at)

  if (constrained.operations.length === 0) {
    return {
      success: false,
      error: 'I could not pick a control to add. Try naming a block like “pricing” or “contact form”.'
    }
  }

  return { success: true, plan: constrained }
}
