import * as fs from 'fs';
import * as path from 'path';
import { FormattedMessage, ExtractorStats } from '../types';

export class FileExporter {
  static async exportToFile(
    messages: FormattedMessage[], 
    fileName: string, 
    stats: ExtractorStats
  ): Promise<void> {
    const outputDir = path.dirname(fileName);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const content = this.formatMessagesForOutput(messages, stats);
    
    try {
      fs.writeFileSync(fileName, content, 'utf8');
      console.log(`💾 Messages exported to: ${fileName}`);
    } catch (error) {
      console.error('❌ Failed to write file:', error);
      throw error;
    }
  }

  private static formatMessagesForOutput(messages: FormattedMessage[], stats: ExtractorStats): string {
    const header = this.generateHeader(stats);
    const formattedMessages = messages.map(msg => this.formatMessage(msg)).join('\n');
    
    return `${header}\n${formattedMessages}\n`;
  }

  private static generateHeader(stats: ExtractorStats): string {
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
# Processing Time: ${stats.actualTimeMinutes || stats.estimatedTimeMinutes} minutes
# ==========================================

`;
  }

  private static formatMessage(message: FormattedMessage): string {
    const prefix = message.isReply ? '  - ' : '- ';
    return `${prefix}[${message.timestamp}] ${message.username}: ${message.text}`;
  }
}