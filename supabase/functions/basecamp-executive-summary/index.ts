// Basecamp Executive Summary Edge Function
// Fetches comprehensive project data including todos, card tables, and statistics

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCorsPreFlight, createJsonResponse, createErrorResponse } from '../_shared/cors.ts';

const BASECAMP_API_BASE = 'https://3.basecampapi.com';
const USER_AGENT = 'ImagineHelpDesk (support@imagineapps.co)';

interface FetchOptions {
  accountId: string;
  accessToken: string;
}

async function basecampFetch(url: string, options: FetchOptions) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${options.accessToken}`,
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Basecamp API error: ${response.status}`);
  }

  return response.json();
}

async function getBasecampCredentials(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase
    .from('basecamp_tokens')
    .select('account_id, access_token')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('Basecamp credentials not found. Please connect your Basecamp account.');
  }

  return data;
}

async function getProject(projectId: string, options: FetchOptions) {
  const url = `${BASECAMP_API_BASE}/${options.accountId}/projects/${projectId}.json`;
  return basecampFetch(url, options);
}

async function getTodoSet(projectId: string, options: FetchOptions) {
  // First get project to find todo set
  const project = await getProject(projectId, options);
  if (!project) return null;

  const todoSetDock = project.dock?.find((d: { name: string }) => d.name === 'todoset');
  if (!todoSetDock) return null;

  return basecampFetch(todoSetDock.url, options);
}

async function getTodoLists(todoSetId: number, options: FetchOptions) {
  const url = `${BASECAMP_API_BASE}/${options.accountId}/buckets/${options.accountId}/todosets/${todoSetId}/todolists.json`;
  // Use the todoset's todolists_url if available
  return basecampFetch(url, options);
}

async function getTodosForList(projectId: string, listId: number, options: FetchOptions) {
  const url = `${BASECAMP_API_BASE}/${options.accountId}/buckets/${projectId}/todolists/${listId}/todos.json`;
  return basecampFetch(url, options);
}

async function getCardTable(projectId: string, options: FetchOptions) {
  const project = await getProject(projectId, options);
  if (!project) return null;

  const cardTableDock = project.dock?.find((d: { name: string }) => d.name === 'kanban_board');
  if (!cardTableDock) return null;

  const cardTable = await basecampFetch(cardTableDock.url, options);
  if (!cardTable) return null;

  // Fetch columns and cards
  const columnsUrl = `${BASECAMP_API_BASE}/${options.accountId}/buckets/${projectId}/card_tables/${cardTable.id}/columns.json`;
  const columns = await basecampFetch(columnsUrl, options) || [];

  // Fetch cards for each column
  const columnsWithCards = await Promise.all(
    columns.map(async (column: { id: number; title: string; cards_count: number; cards_url: string }) => {
      const cards = await basecampFetch(column.cards_url || `${BASECAMP_API_BASE}/${options.accountId}/buckets/${projectId}/card_tables/columns/${column.id}/cards.json`, options) || [];
      return {
        id: column.id,
        title: column.title,
        cards_count: column.cards_count || cards.length,
        cards: cards.map((card: { id: number; title: string; completed: boolean; assignees: { name: string }[]; due_on: string | null }) => ({
          id: card.id,
          title: card.title,
          completed: card.completed || false,
          assignees: card.assignees?.map((a: { name: string }) => a.name) || [],
          due_on: card.due_on,
        })),
      };
    })
  );

  return {
    id: cardTable.id,
    title: cardTable.title,
    columns: columnsWithCards,
  };
}

async function getAllTodos(projectId: string, options: FetchOptions) {
  const project = await getProject(projectId, options);
  if (!project) return { todos: [], statistics: getEmptyStatistics() };

  const todoSetDock = project.dock?.find((d: { name: string }) => d.name === 'todoset');
  if (!todoSetDock) return { todos: [], statistics: getEmptyStatistics() };

  const todoSet = await basecampFetch(todoSetDock.url, options);
  if (!todoSet) return { todos: [], statistics: getEmptyStatistics() };

  // Fetch all todo lists
  const todoListsUrl = todoSet.todolists_url || `${BASECAMP_API_BASE}/${options.accountId}/buckets/${projectId}/todosets/${todoSet.id}/todolists.json`;
  const todoLists = await basecampFetch(todoListsUrl, options) || [];

  let totalTodos = 0;
  let completedTodos = 0;

  // Fetch todos for each list
  const todosGrouped = await Promise.all(
    todoLists.map(async (list: { id: number; name: string; todos_url: string }) => {
      const todosUrl = list.todos_url || `${BASECAMP_API_BASE}/${options.accountId}/buckets/${projectId}/todolists/${list.id}/todos.json`;
      const todos = await basecampFetch(todosUrl, options) || [];

      const mappedTodos = todos.map((todo: { id: number; content: string; completed: boolean; assignees: { name: string }[]; due_on: string | null }) => {
        totalTodos++;
        if (todo.completed) completedTodos++;

        return {
          id: todo.id,
          title: todo.content,
          completed: todo.completed,
          assignees: todo.assignees?.map((a: { name: string }) => a.name) || [],
          due_on: todo.due_on,
        };
      });

      return {
        list_id: list.id,
        list_name: list.name,
        todos: mappedTodos,
      };
    })
  );

  const statistics = {
    total_todos: totalTodos,
    completed_todos: completedTodos,
    pending_todos: totalTodos - completedTodos,
    total_todolists: todoLists.length,
    progress_percentage: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
  };

  return { todos: todosGrouped, statistics };
}

function getEmptyStatistics() {
  return {
    total_todos: 0,
    completed_todos: 0,
    pending_todos: 0,
    total_todolists: 0,
    progress_percentage: 0,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight();
  }

  try {
    // Get project ID from URL
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');

    if (!projectId) {
      return createErrorResponse('Missing projectId parameter', 400);
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse('Missing authorization header', 401);
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get Basecamp credentials
    const credentials = await getBasecampCredentials(supabase, user.id);
    const fetchOptions: FetchOptions = {
      accountId: credentials.account_id,
      accessToken: credentials.access_token,
    };

    // Fetch all data in parallel
    const [project, cardTable, { todos, statistics }] = await Promise.all([
      getProject(projectId, fetchOptions),
      getCardTable(projectId, fetchOptions),
      getAllTodos(projectId, fetchOptions),
    ]);

    if (!project) {
      return createErrorResponse('Project not found', 404);
    }

    const executiveSummary = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
        url: project.app_url || project.url,
      },
      statistics,
      cardTable,
      todos,
    };

    return createJsonResponse(executiveSummary);
  } catch (error) {
    console.error('Error fetching executive summary:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
});
