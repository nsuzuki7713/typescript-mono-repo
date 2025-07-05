import * as fs from 'fs';
import * as path from 'path';
import { FormattedMessage, ExtractorStats } from '../types';

export class FileExporter {
  static async exportToFile(
    messages: FormattedMessage[], 
    fileName: string, 
    stats: ExtractorStats,
    format: 'text' | 'json' | 'markdown' = 'text',
    startDate?: string,
    endDate?: string
  ): Promise<void> {
    // 日付を含むファイル名を生成
    const baseFileName = path.basename(fileName, path.extname(fileName));
    const extension = path.extname(fileName) || '.txt';
    
    // 期間が指定されている場合は期間をファイル名に含める
    let dateFileName: string;
    if (startDate && endDate) {
      dateFileName = `${baseFileName}-${startDate}_${endDate}${extension}`;
    } else if (startDate) {
      dateFileName = `${baseFileName}-from_${startDate}${extension}`;
    } else if (endDate) {
      dateFileName = `${baseFileName}-until_${endDate}${extension}`;
    } else {
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
      dateFileName = `${baseFileName}-${dateStr}${extension}`;
    }
    
    // output/ディレクトリに出力
    const outputDir = 'output';
    const fullFilePath = path.join(outputDir, dateFileName);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let content: string;
    let actualFileName = fullFilePath;

    switch (format) {
      case 'json':
        content = this.formatAsJSON(messages, stats);
        actualFileName = fullFilePath.replace(/\.[^.]*$/, '.json');
        break;
      case 'markdown':
        content = this.formatAsMarkdown(messages, stats);
        actualFileName = fullFilePath.replace(/\.[^.]*$/, '.md');
        break;
      default:
        content = this.formatAsText(messages, stats);
        break;
    }
    
    try {
      fs.writeFileSync(actualFileName, content, 'utf8');
      console.log(`💾 Messages exported to: ${actualFileName}`);
    } catch (error) {
      console.error('❌ Failed to write file:', error);
      throw error;
    }
  }

  private static formatAsText(messages: FormattedMessage[], stats: ExtractorStats): string {
    const header = this.generateTextHeader(stats);
    const formattedMessages = messages.map(msg => this.formatTextMessage(msg)).join('\n');
    
    return `${header}\n${formattedMessages}\n`;
  }

  private static formatAsJSON(messages: FormattedMessage[], stats: ExtractorStats): string {
    const output = {
      metadata: {
        generated: new Date().toISOString(),
        totalMessages: stats.totalMessages,
        totalReplies: stats.totalReplies,
        processingTimeMinutes: stats.actualTimeMinutes || stats.estimatedTimeMinutes,
        exportFormat: 'json'
      },
      conversations: this.groupMessagesByThread(messages)
    };
    
    return JSON.stringify(output, null, 2);
  }

  private static formatAsMarkdown(messages: FormattedMessage[], stats: ExtractorStats): string {
    const header = this.generateMarkdownHeader(stats);
    const conversations = this.groupMessagesByThread(messages);
    
    let content = header + '\n\n';
    
    conversations.forEach((conversation, index) => {
      content += `## Message ${index + 1}\n\n`;
      content += `**${conversation.mainMessage.username}** - ${conversation.mainMessage.timestamp}\n\n`;
      content += `${conversation.mainMessage.text}\n\n`;
      
      if (conversation.replies.length > 0) {
        content += '### Replies\n\n';
        conversation.replies.forEach(reply => {
          content += `- **${reply.username}** (${reply.timestamp}): ${reply.text}\n`;
        });
        content += '\n';
      }
    });
    
    return content;
  }

  private static generateTextHeader(stats: ExtractorStats): string {
    const now = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return `# Slack Messages Export
# Generated: ${now}
# Total Messages: ${stats.totalMessages}
# Total Replies: ${stats.totalReplies}
# Processing Time: ${this.formatProcessingTime(stats)}
# ==========================================

`;
  }

  private static generateMarkdownHeader(stats: ExtractorStats): string {
    const now = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return `# Slack Messages Export

**Generated:** ${now}  
**Total Messages:** ${stats.totalMessages}  
**Total Replies:** ${stats.totalReplies}  
**Processing Time:** ${this.formatProcessingTime(stats)}`;
  }

  private static groupMessagesByThread(messages: FormattedMessage[]) {
    const conversations: Array<{
      mainMessage: FormattedMessage;
      replies: FormattedMessage[];
    }> = [];

    let currentConversation: { mainMessage: FormattedMessage; replies: FormattedMessage[] } | null = null;

    for (const message of messages) {
      if (!message.isReply) {
        // 新しいメインメッセージ
        if (currentConversation) {
          conversations.push(currentConversation);
        }
        currentConversation = {
          mainMessage: message,
          replies: []
        };
      } else if (currentConversation) {
        // スレッドの返信
        currentConversation.replies.push(message);
      }
    }

    if (currentConversation) {
      conversations.push(currentConversation);
    }

    return conversations;
  }

  private static formatProcessingTime(stats: ExtractorStats): string {
    const actualMinutes = stats.actualTimeMinutes || stats.estimatedTimeMinutes;
    if (actualMinutes < 1) {
      return "< 1 minute";
    } else if (actualMinutes === 1) {
      return "1 minute";
    } else {
      return `${actualMinutes} minutes`;
    }
  }

  private static formatTextMessage(message: FormattedMessage): string {
    const prefix = message.isReply ? '  - ' : '- ';
    return `${prefix}[${message.timestamp}] ${message.username}: ${message.text}`;
  }
}