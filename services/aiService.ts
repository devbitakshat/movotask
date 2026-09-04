import { AIAction, AIMotivation, AIResponse, CreateTaskActionPayload } from '@/types/ai';
import { Priority, Task } from '@/types/task';
import { getTodayDateString, getTomorrowDateString } from '@/lib/utils';
import { MOTIVATIONAL_MESSAGES } from '@/lib/constants';

/**
 * Call the Gemini AI assistant via the server-side API route.
 * The API key is kept secret on the server — never exposed to the browser.
 *
 * @param message  - The user's natural language message
 * @param tasks    - Current task list for context
 * @returns Parsed AIResponse from Gemini
 */
export async function callGemini(
  message: string,
  tasks: Task[] = [],
  isDemo = false
): Promise<AIResponse> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      tasks,
      todayDate: getTodayDateString(),
      isDemo,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `AI request failed with status ${response.status}`);
  }

  return response.json();
}

export const aiService = {
  /**
   * Parse natural language input and extract structured task attributes.
   * This handles quick client-side NLP patterns (e.g. "finish report tomorrow at 5pm priority high")
   * and prepares function calling schema for OpenAI API integration.
   */
  parseNaturalLanguageTask(input: string): CreateTaskActionPayload {
    const text = input.trim();
    let title = text;
    let dueDate: string | undefined = undefined;
    let dueTime: string | undefined = undefined;
    let priority: Priority | undefined = 'medium';

    // 1. Detect Priority keyword
    if (/\b(urgent|critical|high priority|p1|!high)\b/i.test(text)) {
      priority = 'high';
      title = title.replace(/\b(urgent|critical|high priority|p1|!high)\b/gi, '').trim();
    } else if (/\b(low priority|p3|!low)\b/i.test(text)) {
      priority = 'low';
      title = title.replace(/\b(low priority|p3|!low)\b/gi, '').trim();
    } else if (/\b(medium priority|p2|!med|!medium)\b/i.test(text)) {
      priority = 'medium';
      title = title.replace(/\b(medium priority|p2|!med|!medium)\b/gi, '').trim();
    }

    // 2. Detect Due Date keyword
    if (/\b(today)\b/i.test(text)) {
      dueDate = getTodayDateString();
      title = title.replace(/\b(today)\b/gi, '').trim();
    } else if (/\b(tomorrow)\b/i.test(text)) {
      dueDate = getTomorrowDateString();
      title = title.replace(/\b(tomorrow)\b/gi, '').trim();
    } else if (/\bnext week\b/i.test(text)) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      dueDate = nextWeek.toISOString().split('T')[0];
      title = title.replace(/\bnext week\b/gi, '').trim();
    }

    // 3. Detect Due Time keyword (e.g., at 6pm, at 14:00, at 9:30am)
    const timeMatch = text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) {
        hours += 12;
      } else if (meridiem === 'am' && hours === 12) {
        hours = 0;
      }

      dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      title = title.replace(timeMatch[0], '').trim();
    }

    // Clean up residual words like "remind me to", "due", "by"
    title = title
      .replace(/^remind me to\s+/i, '')
      .replace(/^remember to\s+/i, '')
      .replace(/^need to\s+/i, '')
      .replace(/\s+by\s*$/i, '')
      .trim();

    return {
      title: title || input,
      dueDate: dueDate || getTodayDateString(),
      dueTime,
      priority,
    };
  },

  /**
   * Generates intelligent breakdown suggestions for large or vague tasks
   */
  suggestSubtasks(taskTitle: string): string[] {
    const titleLower = taskTitle.toLowerCase();

    if (titleLower.includes('portfolio') || titleLower.includes('website')) {
      return [
        'Draft layout & typography system',
        'Create featured project case studies',
        'Build responsive header & navigation',
        'Optimize assets & deploy to Vercel',
      ];
    }

    if (titleLower.includes('presentation') || titleLower.includes('deck') || titleLower.includes('slide')) {
      return [
        'Outline key message and 3 takeaway points',
        'Create slide draft with visual charts',
        'Rehearse timing and speaker notes',
      ];
    }

    if (titleLower.includes('clean') || titleLower.includes('organize')) {
      return [
        'Sort items into Keep, Donate, Trash',
        'Clear surface areas and wipe down desks',
        'File paperwork and digital folders',
      ];
    }

    return [
      `Phase 1: Research and initial draft for ${taskTitle}`,
      `Phase 2: Execution and implementation`,
      `Phase 3: Final review and polish`,
    ];
  },

  /**
   * Get contextual motivational feedback based on user tasks
   */
  getMotivation(unfinishedCount: number, overdueCount: number): AIMotivation {
    if (overdueCount > 0) {
      const overdueQuotes = MOTIVATIONAL_MESSAGES.filter((m) => m.context === 'overdue');
      return overdueQuotes[Math.floor(Math.random() * overdueQuotes.length)];
    }

    if (unfinishedCount === 0) {
      return {
        quote: 'You crushed all your tasks for today! Take a moment to recharge.',
        author: 'MovoTask AI',
        context: 'productive',
      };
    }

    const generalQuotes = MOTIVATIONAL_MESSAGES.filter((m) => m.context !== 'overdue');
    return generalQuotes[Math.floor(Math.random() * generalQuotes.length)];
  },

  /**
   * Dispatches structured AI action to services (prepared for OpenAI tool calling)
   */
  async executeAIAction(action: AIAction): Promise<AIResponse> {
    switch (action.type) {
      case 'CREATE_TASK': {
        return {
          message: `Created task "${action.payload.title}" with ${action.payload.priority || 'medium'} priority.`,
          action,
        };
      }
      case 'BREAKDOWN_TASK': {
        return {
          message: `Generated ${action.payload.subtasks.length} subtasks.`,
          action,
        };
      }
      default:
        return {
          message: 'Action processed successfully.',
        };
    }
  },
};
