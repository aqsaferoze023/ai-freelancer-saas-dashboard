export type AssistantAction = "briefing" | "proposal" | "planner" | "email" | "reminder";

export interface AssistantInput {
  action: AssistantAction;
  prompt: string;
}

// Keep the mock behind a service boundary so an OpenAI-compatible endpoint can replace it later.
export async function generateAssistantResponse({ action, prompt }: AssistantInput): Promise<string> {
  await new Promise((resolve) => window.setTimeout(resolve, 850));

  const responses: Record<AssistantAction, string> = {
    briefing: "Good morning, Alex. You have 3 tasks due today, one overdue invoice worth $2,400, and your NovaBrand Website is approaching its deadline in 10 days. Your highest-impact next step is to send the FitTrack review notes before the afternoon design block.",
    proposal: `# Project proposal\n\n## Overview\nA thoughtful, outcome-focused engagement for ${prompt || "your next client"}. I will pair clear strategy with a polished execution plan tailored to the team's goals.\n\n## Scope & deliverables\n- Discovery workshop and project direction\n- Design exploration with two focused review rounds\n- Final production-ready assets and handoff documentation\n\n## Timeline\nEstimated at 4-6 weeks from kickoff, with weekly async updates and one collaborative review each milestone.\n\n## Investment\nA fixed project fee with milestone-based billing. The final investment can be confirmed once the scope is approved.\n\n## Next step\nReply with any questions and I will reserve a kickoff slot for the week ahead.`,
    planner: "## Suggested project plan\n\n**Week 1 · Discovery**\n- Align on outcomes and project constraints (High)\n- Audit current experience and collect references (Medium)\n\n**Week 2 · Direction**\n- Share a concise creative direction (High)\n- Confirm content and technical requirements (Medium)\n\n**Weeks 3-4 · Design & delivery**\n- Build the core experience and review together (High)\n- Refine details, QA, and prepare a clean handoff (Medium)\n\nPlan for 4 weeks total, with a 15% buffer for feedback and approvals.",
    email: "Hi there,\n\nI hope your week is going well. I wanted to check in on the latest project update and see if you had a chance to review the materials I shared.\n\nWhenever it is convenient, send over any feedback or questions and I can shape the next steps around your priorities.\n\nThanks,\nAlex",
    reminder: "Subject: A quick note about your invoice\n\nHi there,\n\nI hope all is well. This is a friendly reminder that invoice INV-1040 for $2,400 is now past its due date. If payment is already on the way, please feel free to ignore this note.\n\nYou can find the invoice attached. Let me know if you need anything from me.\n\nThanks so much,\nAlex",
  };

  return responses[action];
}