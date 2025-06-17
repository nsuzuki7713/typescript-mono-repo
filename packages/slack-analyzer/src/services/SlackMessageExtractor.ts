import { WebClient, ErrorCode } from '@slack/web-api';
import { SlackMessage, SlackUser, ExtractorConfig, FormattedMessage, ExtractorStats } from '../types';

export class SlackMessageExtractor {
  private client: WebClient;
  private config: ExtractorConfig;
  private users: Map<string, SlackUser> = new Map();

  constructor(config: ExtractorConfig) {
    this.config = config;
    this.client = new WebClient(config.token);
  }

  async extractMessages(): Promise<{ messages: FormattedMessage[]; stats: ExtractorStats }> {
    const startTime = Date.now();
    console.log('🚀 Starting message extraction...');
    
    const estimatedTime = this.estimateProcessingTime();
    console.log(`⏱️  Estimated processing time: ${estimatedTime} minutes`);
    console.log('📋 Required Slack App permissions: channels:history, groups:history, im:history, mpim:history\n');

    try {
      await this.loadChannelMembers();
      
      const messages = await this.fetchMessages();
      const formattedMessages = await this.formatMessages(messages);
      
      const endTime = Date.now();
      const actualTimeSeconds = Math.round((endTime - startTime) / 1000);
      const actualTimeMinutes = actualTimeSeconds >= 60 ? 
        Math.round(actualTimeSeconds / 60) : 
        Math.max(1, Math.round(actualTimeSeconds / 60));
      
      const stats: ExtractorStats = {
        totalMessages: messages.length,
        totalReplies: this.countReplies(messages),
        estimatedTimeMinutes: estimatedTime,
        actualTimeMinutes
      };

      console.log(`\n✅ Extraction completed!`);
      console.log(`📊 Total messages: ${stats.totalMessages}`);
      console.log(`💬 Total replies: ${stats.totalReplies}`);
      console.log(`⏱️  Actual processing time: ${actualTimeSeconds} seconds (${actualTimeMinutes} minutes)`);

      return { messages: formattedMessages, stats };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private async loadChannelMembers(): Promise<void> {
    console.log('👥 Loading channel members...');
    
    try {
      const result = await this.client.conversations.members({
        channel: this.config.channelId
      });
      
      if (result.members) {
        console.log(`📋 Found ${result.members.length} channel members`);
        
        for (const userId of result.members) {
          await this.loadUserInfoWithRetry(userId);
        }
      }
      
      console.log(`✅ Loaded ${this.users.size} channel members`);
    } catch (error) {
      await this.handleRateLimitError(error);
      console.log('⚠️  Falling back to loading users on-demand');
    }
  }


  private async loadUserInfoWithRetry(userId: string): Promise<void> {
    if (this.users.has(userId)) return;
    
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const result = await this.client.users.info({ user: userId });
        
        if (result.user && result.user.id && result.user.name) {
          this.users.set(result.user.id, {
            id: result.user.id,
            name: result.user.name,
            real_name: result.user.real_name
          });
        }
        break;
      } catch (error: any) {
        if (error.code === ErrorCode.RateLimitedError) {
          await this.handleRateLimitError(error);
        } else {
          console.error(`❌ Failed to load user ${userId}:`, error);
          this.users.set(userId, {
            id: userId,
            name: userId,
            real_name: userId
          });
          break;
        }
      }
    }
  }

  private async fetchMessages(): Promise<SlackMessage[]> {
    const messages: SlackMessage[] = [];
    let cursor: string | undefined;
    let requestCount = 0;
    
    console.log('📥 Fetching messages...');

    do {
      try {
        console.log(`🔄 API Request ${++requestCount}: Fetching up to 50 messages...`);
        
        const result = await this.client.conversations.history({
          channel: this.config.channelId,
          limit: 50,
          cursor,
          oldest: '0'
        });

        if (result.messages) {
          const filteredMessages = result.messages
            .filter(msg => msg.user && !this.config.excludedUserIds.includes(msg.user))
            .map(msg => ({
              text: msg.text || '',
              user: msg.user || '',
              ts: msg.ts || '',
              thread_ts: msg.thread_ts,
              replies: [] as SlackMessage[]
            }));

          messages.push(...filteredMessages);
          console.log(`📨 Retrieved ${filteredMessages.length} messages (Total: ${messages.length})`);

          for (const message of filteredMessages) {
            if (message.thread_ts && message.thread_ts !== message.ts) {
              console.log('🧵 Fetching thread replies...');
              message.replies = await this.fetchThreadRepliesWithRetry(this.config.channelId, message.thread_ts);
            } else if (message.thread_ts) {
              console.log('🧵 Fetching thread replies...');
              message.replies = await this.fetchThreadRepliesWithRetry(this.config.channelId, message.thread_ts);
            }
          }
        }

        cursor = result.response_metadata?.next_cursor;
        
        if (messages.length >= this.config.messageLimit) {
          console.log(`🛑 Reached message limit (${this.config.messageLimit})`);
          break;
        }

      } catch (error: any) {
        if (error.code === ErrorCode.RateLimitedError) {
          await this.handleRateLimitError(error);
        } else {
          throw error;
        }
      }
    } while (cursor && messages.length < this.config.messageLimit);

    return messages.reverse();
  }


  private async fetchThreadRepliesWithRetry(channel: string, threadTs: string): Promise<SlackMessage[]> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const result = await this.client.conversations.replies({
          channel,
          ts: threadTs,
          limit: 50
        });

        if (!result.messages) return [];

        const replies = result.messages
          .slice(1)
          .filter(msg => msg.user && !this.config.excludedUserIds.includes(msg.user))
          .map(msg => ({
            text: msg.text || '',
            user: msg.user || '',
            ts: msg.ts || '',
            thread_ts: msg.thread_ts,
            replies: [] as SlackMessage[]
          }));

        return replies;
      } catch (error: any) {
        if (error.code === ErrorCode.RateLimitedError) {
          await this.handleRateLimitError(error);
        } else {
          console.error('❌ Failed to fetch thread replies:', error);
          return [];
        }
      }
    }
  }

  private async formatMessages(messages: SlackMessage[]): Promise<FormattedMessage[]> {
    const formatted: FormattedMessage[] = [];

    for (const message of messages) {
      await this.loadUserInfoWithRetry(message.user);
      const user = this.users.get(message.user);
      const username = user?.real_name || user?.name || message.user;
      const formattedText = await this.formatMentions(message.text);
      
      formatted.push({
        timestamp: this.formatTimestamp(message.ts),
        username,
        text: formattedText,
        isReply: false
      });

      if (message.replies) {
        for (const reply of message.replies) {
          await this.loadUserInfoWithRetry(reply.user);
          const replyUser = this.users.get(reply.user);
          const replyUsername = replyUser?.real_name || replyUser?.name || reply.user;
          const replyFormattedText = await this.formatMentions(reply.text);
          
          formatted.push({
            timestamp: this.formatTimestamp(reply.ts),
            username: replyUsername,
            text: replyFormattedText,
            isReply: true
          });
        }
      }
    }

    return formatted;
  }

  private async formatMentions(text: string): Promise<string> {
    // <@U1234567890> 形式のメンションを探す
    const mentionPattern = /<@([A-Z0-9]+)>/g;
    let formattedText = text;
    const matches = text.matchAll(mentionPattern);

    for (const match of matches) {
      const userId = match[1];
      const fullMention = match[0];
      
      // ユーザー情報を取得
      await this.loadUserInfoWithRetry(userId);
      const user = this.users.get(userId);
      const displayName = user?.real_name || user?.name || userId;
      
      // <@U1234567890> → @山田太郎 に変換
      formattedText = formattedText.replace(fullMention, `@${displayName}`);
    }

    return formattedText;
  }

  private formatTimestamp(ts: string): string {
    const date = new Date(parseFloat(ts) * 1000);
    return date.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private countReplies(messages: SlackMessage[]): number {
    return messages.reduce((count, msg) => count + (msg.replies?.length || 0), 0);
  }

  private estimateProcessingTime(): number {
    const requestsNeeded = Math.ceil(this.config.messageLimit / 50);
    const estimatedMinutes = Math.max(1, Math.ceil(requestsNeeded * 0.1));
    return estimatedMinutes;
  }

  private async wait(ms: number): Promise<void> {
    const seconds = Math.ceil(ms / 1000);
    console.log(`⏳ Waiting ${seconds} seconds for API rate limit...`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleRateLimitError(error: any): Promise<void> {
    if (error.code === ErrorCode.RateLimitedError) {
      const retryAfter = error.retryAfter ? error.retryAfter * 1000 : 60000;
      console.log(`⚠️  Rate limited. Retrying after ${Math.ceil(retryAfter / 1000)} seconds...`);
      await this.wait(retryAfter);
    } else {
      throw error;
    }
  }

  private handleError(error: any): void {
    console.error('❌ Error occurred during extraction:');
    
    if (error.code === ErrorCode.PlatformError) {
      console.error('🔑 Authentication error. Please check your SLACK_BOT_TOKEN.');
    } else if (error.code === ErrorCode.RequestError) {
      console.error('🌐 Network error. Please check your internet connection.');
    } else if (error.code === ErrorCode.RateLimitedError) {
      console.error('⏱️  Rate limit exceeded. The tool handles this automatically, but the error persisted.');
    } else if (error.data?.error === 'channel_not_found') {
      console.error('📡 Channel not found. Please check the channel ID.');
    } else if (error.data?.error === 'not_in_channel') {
      console.error('🚫 Bot is not in the channel. Please add the bot to the channel.');
    } else {
      console.error('❓ Unknown error:', error.message || error);
    }
  }
}