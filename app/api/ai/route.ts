import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Ensure this route is always server-side rendered
export const runtime = 'nodejs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are MovoTask AI — a personal productivity assistant.

Your ONLY job is to help the user manage their tasks. You respond with a JSON object (no markdown, just pure JSON).

You can perform these structured actions:
- CREATE_TASK: Create a new task
- UPDATE_TASK: Modify, move, reschedule, or complete an existing task
- DELETE_TASK: Delete/remove a task (requires taskId)
- LIST_TASKS: Summarize or list user's tasks (returns a message, action: null)
- MOTIVATE: Return motivational guidance (returns a message, action: null)

Response format (always return valid JSON):
{
  "message": "Human-readable response explaining what you did",
  "action": {
    "type": "CREATE_TASK" | "UPDATE_TASK" | "DELETE_TASK" | null,
    "payload": {
      "taskId": "string (REQUIRED for UPDATE_TASK and DELETE_TASK; must match the target task ID)",
      "title": "string (optional for update, required for create)",
      "description": "string (optional)",
      "dueDate": "YYYY-MM-DD (optional, format as YYYY-MM-DD)",
      "dueTime": "HH:mm (optional, 24-hour format)",
      "priority": "low" | "medium" | "high",
      "completed": true | false (optional)
    }
  }
}

Rules:
- ONLY respond with a valid JSON object.
- When user asks to MOVE, RESCHEDULE, POSTPONE, or CHANGE DATE/TIME of a task (e.g. "move the report task to tomorrow", "postpone gym to next Monday", "change budget review time to 4pm"):
  1. Find the target task from the user's current tasks list by matching its title or content.
  2. Set action.type = "UPDATE_TASK".
  3. Include payload.taskId with the exact ID from the list.
  4. Include the new payload.dueDate (formatted as YYYY-MM-DD) and/or payload.dueTime (formatted as HH:mm).
- When user asks to MARK DONE / COMPLETE or INCOMPLETE:
  1. Find the target task ID.
  2. Set action.type = "UPDATE_TASK" with payload.taskId and payload.completed = true / false.
- When user asks to DELETE / REMOVE a task:
  1. Find the target task ID.
  2. Set action.type = "DELETE_TASK" with payload.taskId.
- When user asks to CREATE a task:
  1. Set action.type = "CREATE_TASK" with title, dueDate, dueTime, priority.
- If the user asks about a task that does not exist in their current tasks list, set action to null and politely inform the user that you couldn't find it.
- Use today's date context provided to calculate relative dates accurately (tomorrow = today + 1 day, etc.).
- Always be concise, encouraging, and clear.`;

export async function POST(request: Request) {
  // 1. Parse the request body
  const { message, tasks, todayDate, isDemo } = await request.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // 2. Authenticate the request via Supabase session (allow demo mode)
  const supabase = await createServerSupabaseClient();
  if (!isDemo && supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server.' },
      { status: 500 }
    );
  }

  // 3. Build context about existing tasks for Gemini to reason about
  const taskContext = tasks?.length > 0
    ? `\n\nUser's current tasks:\n${tasks
        .slice(0, 30) // Limit to avoid token overuse
        .map((t: { id: string; title: string; priority: string; due_date?: string; due_time?: string; completed: boolean }) =>
          `- [ID: "${t.id}"] [${t.completed ? 'COMPLETED' : 'PENDING'}] Title: "${t.title}" | Priority: ${t.priority} | DueDate: ${t.due_date || 'None'} | DueTime: ${t.due_time || 'None'}`
        )
        .join('\n')}`
    : '\n\nUser has no current tasks.';

  const userMessage = `Today's date: ${todayDate || new Date().toISOString().split('T')[0]}
${taskContext}

User: ${message}`;

  // 4. Call Gemini API
  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(userMessage);
    const responseText = result.response.text();

    // 5. Parse and validate the JSON response from Gemini
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Fallback if Gemini returns non-JSON
      parsed = {
        message: responseText,
        action: null,
      };
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('Gemini API error:', err);
    const errorMessage = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
