import React, { useMemo } from 'react';
import { ToolViewProps } from '../types';
import { GenericToolView } from '../GenericToolView';
import { BrowserToolView } from '../BrowserToolView';
import { CommandToolView } from '../CommandToolView';
import { ExposePortToolView } from '../ExposePortToolView';
import { FileOperationToolView } from '../FileOperationToolView';
import { StrReplaceToolView } from '../StrReplaceToolView';
import { WebCrawlToolView } from '../WebCrawlToolView';
import { WebScrapeToolView } from '../WebScrapeToolView';
import { WebSearchToolView } from '../WebSearchToolView';
import { SeeImageToolView } from '../SeeImageToolView';
import { TerminateCommandToolView } from '../TerminateCommandToolView';
import { AskToolView } from '../AskToolView';
import { CompleteToolView } from '../CompleteToolView';
import { DataProviderEndpointsToolView } from '../DataProviderEndpointToolView';
import { ExecuteDataProviderCallToolView } from '../DataProviderToolView';

export type ToolViewComponent = React.ComponentType<ToolViewProps>;

type ToolViewRegistryType = Record<string, ToolViewComponent>;

const defaultRegistry: ToolViewRegistryType = {
  'browser-navigate-to': BrowserToolView,
  'browser-go-back': BrowserToolView,
  'browser-wait': BrowserToolView,
  'browser-click-element': BrowserToolView,
  'browser-input-text': BrowserToolView,
  'browser-send-keys': BrowserToolView,
  'browser-switch-tab': BrowserToolView,
  'browser-close-tab': BrowserToolView,
  'browser-scroll-down': BrowserToolView,
  'browser-scroll-up': BrowserToolView,
  'browser-scroll-to-text': BrowserToolView,
  'browser-get-dropdown-options': BrowserToolView,
  'browser-select-dropdown-option': BrowserToolView,
  'browser-drag-drop': BrowserToolView,
  'browser-click-coordinates': BrowserToolView,

  'execute-command': CommandToolView,
  'execute_command': CommandToolView,
  'check-command-output': CommandToolView,
  'check_command_output': CommandToolView,
  'terminate-command': TerminateCommandToolView,
  'terminate_command': TerminateCommandToolView,
  'list-commands': CommandToolView,
  'list_commands': CommandToolView,

  'create-file': FileOperationToolView,
  'create_file': FileOperationToolView,
  'delete-file': FileOperationToolView,
  'delete_file': FileOperationToolView,
  'full-file-rewrite': FileOperationToolView,
  'full_file_rewrite': FileOperationToolView,
  'read-file': FileOperationToolView,
  'read_file': FileOperationToolView,

  'str-replace': StrReplaceToolView,
  'str_replace': StrReplaceToolView,

  'web-search': WebSearchToolView,
  'web_search': WebSearchToolView,
  'crawl-webpage': WebCrawlToolView,
  'crawl_webpage': WebCrawlToolView,
  'scrape-webpage': WebScrapeToolView,
  'scrape_webpage': WebScrapeToolView,

  'execute-data-provider-call': ExecuteDataProviderCallToolView,
  'execute_data_provider_call': ExecuteDataProviderCallToolView,
  'get-data-provider-endpoints': DataProviderEndpointsToolView,
  'get_data_provider_endpoints': DataProviderEndpointsToolView,

  'expose-port': ExposePortToolView,
  'expose_port': ExposePortToolView,

  'see-image': SeeImageToolView,
  'see_image': SeeImageToolView,

  'ask': AskToolView,
  'complete': CompleteToolView,

  'default': GenericToolView,
};

class ToolViewRegistry {
  private registry: ToolViewRegistryType;

  constructor(initialRegistry: Partial<ToolViewRegistryType> = {}) {
    this.registry = { ...defaultRegistry, ...initialRegistry };
  }

  register(toolName: string, component: ToolViewComponent): void {
    this.registry[toolName] = component;
  }

  registerMany(components: Partial<ToolViewRegistryType>): void {
    Object.assign(this.registry, components);
  }

  get(toolName: string): ToolViewComponent {
    return this.registry[toolName] || this.registry['default'];
  }

  has(toolName: string): boolean {
    return toolName in this.registry;
  }

  getToolNames(): string[] {
    return Object.keys(this.registry).filter(key => key !== 'default');
  }

  clear(): void {
    this.registry = { default: this.registry['default'] };
  }
}

export const toolViewRegistry = new ToolViewRegistry();

export function useToolView(toolName: string): ToolViewComponent {
  return useMemo(() => toolViewRegistry.get(toolName), [toolName]);
}

export function ToolView({ name = 'default', ...props }: ToolViewProps) {
  const ToolViewComponent = useToolView(name);
  return <ToolViewComponent name={name} {...props} />;
}
