export interface SlackMessage {
  text: string;
  user: string;
  ts: string;
  thread_ts?: string;
  replies?: SlackMessage[];
}

export interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
}

export interface ExtractorConfig {
  token: string;
  channelId: string;
  excludedUserIds: string[];
  messageLimit: number;
  outputFileName: string;
  outputFormat?: 'text' | 'json' | 'markdown';
  startDate?: string;
  endDate?: string;
}

export interface FormattedMessage {
  timestamp: string;
  username: string;
  text: string;
  isReply: boolean;
}

export interface ExtractorStats {
  totalMessages: number;
  totalReplies: number;
  estimatedTimeMinutes: number;
  actualTimeMinutes?: number;
}