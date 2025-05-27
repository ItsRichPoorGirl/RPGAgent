import type { ElementType } from 'react';
import {
  FileText,
  Terminal,
  ExternalLink,
  FileEdit,
  Search,
  Globe,
  Code,
  MessageSquare,
  Folder,
  FileX,
  CloudUpload,
  Wrench,
  Cog,
  Network,
  FileSearch,
  FilePlus,
  MessageCircleQuestion,
  CheckCircle2,
} from 'lucide-react';

// Flag to control whether tool result messages are rendered
export const SHOULD_RENDER_TOOL_RESULTS = false;

// Helper function to safely parse JSON strings from content/metadata
export function safeJsonParse<T>(
  jsonString: string | undefined | null,
  fallback: T,
): T {
  if (!jsonString) {
    return fallback;
  }
  
  try {
    // First attempt: Parse as normal JSON
    const parsed = JSON.parse(jsonString);
    
    // Check if the result is a string that looks like JSON (double-escaped case)
    if (typeof parsed === 'string' && 
        (parsed.startsWith('{') || parsed.startsWith('['))) {
      try {
        // Second attempt: Parse the string result as JSON (handles double-escaped)
        return JSON.parse(parsed) as T;
      } catch (innerError) {
        // If inner parse fails, return the first parse result
        return parsed as unknown as T;
      }
    }
    
    return parsed as T;
  } catch (outerError) {
    // If the input is already an object/array (shouldn't happen but just in case)
    if (typeof jsonString === 'object') {
      return jsonString as T;
    }
    
    // Try one more time in case it's a plain string that should be returned as-is
    if (typeof jsonString === 'string') {
      // Check if it's a string representation of a simple value
      if (jsonString === 'true') return true as unknown as T;
      if (jsonString === 'false') return false as unknown as T;
      if (jsonString === 'null') return null as unknown as T;
      if (!isNaN(Number(jsonString))) return Number(jsonString) as unknown as T;
      
      // Return as string if it doesn't look like JSON
      if (!jsonString.startsWith('{') && !jsonString.startsWith('[')) {
        return jsonString as unknown as T;
      }
    }
    
    // console.warn('Failed to parse JSON string:', jsonString, outerError); // Optional: log errors
    return fallback;
  }
}

// Helper function to get an icon based on tool name
export const getToolIcon = (toolName: string): ElementType => {
  // Ensure we handle null/undefined toolName gracefully
  if (!toolName) return Cog;

  // Convert to lowercase for case-insensitive matching
  const normalizedName = toolName.toLowerCase();

  // Check for browser-related tools with a prefix check
  if (normalizedName.startsWith('browser-')) {
    return Globe;
  }
  switch (normalizedName) {
    // File operations (both function names and XML tag names)
    case 'create-file':
    case 'create_file':
      return FileEdit;
    case 'str-replace':
    case 'str_replace':
      return FileSearch;
    case 'full-file-rewrite':
    case 'full_file_rewrite':
      return FilePlus;
    case 'read-file':
    case 'read_file':
      return FileText;

    // Shell commands
    case 'execute-command':
    case 'execute_command':
      return Terminal;
    case 'check-command-output':
    case 'check_command_output':
      return Terminal;
    case 'terminate-command':
    case 'terminate_command':
      return Terminal;
    case 'list-commands':
    case 'list_commands':
      return Terminal;

    // Web operations
    case 'web-search':
    case 'web_search':
      return Search;
    case 'crawl-webpage':
    case 'crawl_webpage':
      return Globe;
    case 'scrape-webpage':
    case 'scrape_webpage':
        return Globe;

    // API and data operations
    case 'call-data-provider':
    case 'call_data_provider':
      return ExternalLink;
    case 'get-data-provider-endpoints':
    case 'get_data_provider_endpoints':
      return Network;
    case 'execute-data-provider-call':
    case 'execute_data_provider_call':
      return Network;

    // Code operations
    case 'delete-file':
    case 'delete_file':
      return FileX;

    // Deployment
    case 'deploy-site':
    case 'deploy_site':
      return CloudUpload;
    case 'deploy':
      return CloudUpload;
    case 'expose-port':
    case 'expose_port':
      return Network;

    // Tools and utilities
    case 'execute-code':
    case 'execute_code':
      return Code;

    // Vision and media
    case 'see-image':
    case 'see_image':
      return FileText;

    // User interaction
    case 'ask':
      return MessageCircleQuestion;
    case 'web-browser-takeover':
    case 'web_browser_takeover':
      return Globe;

    // Task completion
    case 'complete':
      return CheckCircle2;

    // Computer use tools
    case 'move_to':
    case 'click':
    case 'scroll':
    case 'typing':
    case 'press':
    case 'wait':
    case 'mouse_down':
    case 'mouse_up':
    case 'drag_to':
    case 'hotkey':
      return Code;

    // Default case
    default:
      // Add logging for debugging unhandled tool types
      console.log(
        `[PAGE] Using default icon for unknown tool type: ${toolName}`,
      );
      return Wrench; // Default icon for tools
  }
};

// Helper function to extract a primary parameter from XML/arguments
export const extractPrimaryParam = (
  toolName: string,
  content: string | undefined,
): string | null => {
  if (!content) return null;

  try {
    // Handle browser tools with a prefix check
    if (toolName?.toLowerCase().startsWith('browser-')) {
      // Try to extract URL for navigation
      const urlMatch = content.match(/url=(?:"|')([^"|']+)(?:"|')/);
      if (urlMatch) return urlMatch[1];

      // For other browser operations, extract the goal or action
      const goalMatch = content.match(/goal=(?:"|')([^"|']+)(?:"|')/);
      if (goalMatch) {
        const goal = goalMatch[1];
        return goal.length > 30 ? goal.substring(0, 27) + '...' : goal;
      }

      return null;
    }

    // Special handling for XML content - extract file_path from the actual attributes
    if (content.startsWith('<') && content.includes('>')) {
      const xmlAttrs = content.match(/<[^>]+\s+([^>]+)>/);
      if (xmlAttrs && xmlAttrs[1]) {
        const attrs = xmlAttrs[1].trim();
        const filePathMatch = attrs.match(/file_path=["']([^"']+)["']/);
        if (filePathMatch) {
          return filePathMatch[1].split('/').pop() || filePathMatch[1];
        }

        // Try to get command for execute-command
        if (toolName?.toLowerCase() === 'execute-command') {
          const commandMatch = attrs.match(/(?:command|cmd)=["']([^"']+)["']/);
          if (commandMatch) {
            const cmd = commandMatch[1];
            return cmd.length > 30 ? cmd.substring(0, 27) + '...' : cmd;
          }
        }
      }
    }

    // Simple regex for common parameters - adjust as needed
    let match: RegExpMatchArray | null = null;

    switch (toolName?.toLowerCase()) {
      // File operations
      case 'create-file':
      case 'full-file-rewrite':
      case 'read-file':
      case 'delete-file':
      case 'str-replace':
        // Try to match file_path attribute
        match = content.match(/file_path=(?:"|')([^"|']+)(?:"|')/);
        // Return just the filename part
        return match ? match[1].split('/').pop() || match[1] : null;

      // Shell commands
      case 'execute-command':
        // Extract command content
        match = content.match(/command=(?:"|')([^"|']+)(?:"|')/);
        if (match) {
          const cmd = match[1];
          return cmd.length > 30 ? cmd.substring(0, 27) + '...' : cmd;
        }
        return null;

      // Web search
      case 'web-search':
        match = content.match(/query=(?:"|')([^"|']+)(?:"|')/);
        return match
          ? match[1].length > 30
            ? match[1].substring(0, 27) + '...'
            : match[1]
          : null;

      // Data provider operations
      case 'call-data-provider':
        match = content.match(/service_name=(?:"|')([^"|']+)(?:"|')/);
        const route = content.match(/route=(?:"|')([^"|']+)(?:"|')/);
        return match && route
          ? `${match[1]}/${route[1]}`
          : match
            ? match[1]
            : null;

      // Deployment
      case 'deploy-site':
        match = content.match(/site_name=(?:"|')([^"|']+)(?:"|')/);
        return match ? match[1] : null;
    }

    return null;
  } catch (e) {
    console.warn('Error parsing tool parameters:', e);
    return null;
  }
};

const TOOL_DISPLAY_NAMES = new Map([
  ['execute-command', 'Executing Command'],
  ['execute_command', 'Executing Command'],
  ['check-command-output', 'Checking Command Output'],
  ['check_command_output', 'Checking Command Output'],
  ['terminate-command', 'Terminating Command'],
  ['terminate_command', 'Terminating Command'],
  ['list-commands', 'Listing Commands'],
  ['list_commands', 'Listing Commands'],
  
  ['create-file', 'Creating File'],
  ['create_file', 'Creating File'],
  ['delete-file', 'Deleting File'],
  ['delete_file', 'Deleting File'],
  ['full-file-rewrite', 'Rewriting File'],
  ['full_file_rewrite', 'Rewriting File'],
  ['str-replace', 'Editing Text'],
  ['str_replace', 'Editing Text'],
  
  ['browser-click-element', 'Clicking Element'],
  ['browser-close-tab', 'Closing Tab'],
  ['browser-drag-drop', 'Dragging Element'],
  ['browser-get-dropdown-options', 'Getting Options'],
  ['browser-go-back', 'Going Back'],
  ['browser-input-text', 'Entering Text'],
  ['browser-navigate-to', 'Navigating to Page'],
  ['browser-scroll-down', 'Scrolling Down'],
  ['browser-scroll-to-text', 'Scrolling to Text'],
  ['browser-scroll-up', 'Scrolling Up'],
  ['browser-select-dropdown-option', 'Selecting Option'],
  ['browser-click-coordinates', 'Clicking Coordinates'],
  ['browser-send-keys', 'Pressing Keys'],
  ['browser-switch-tab', 'Switching Tab'],
  ['browser-wait', 'Waiting'],

  ['execute-data-provider-call', 'Calling data provider'],
  ['execute_data_provider_call', 'Calling data provider'],
  ['get-data-provider-endpoints', 'Getting endpoints'],
  ['get_data_provider_endpoints', 'Getting endpoints'],
  
  ['deploy', 'Deploying'],
  ['ask', 'Ask'],
  ['complete', 'Completing Task'],
  ['crawl-webpage', 'Crawling Website'],
  ['crawl_webpage', 'Crawling Website'],
  ['expose-port', 'Exposing Port'],
  ['expose_port', 'Exposing Port'],
  ['scrape-webpage', 'Scraping Website'],
  ['scrape_webpage', 'Scraping Website'],
  ['web-search', 'Searching Web'],
  ['web_search', 'Searching Web'],
  ['see-image', 'Viewing Image'],
  ['see_image', 'Viewing Image']
]);

export function getUserFriendlyToolName(toolName: string): string {
  return TOOL_DISPLAY_NAMES.get(toolName) || toolName;
}
