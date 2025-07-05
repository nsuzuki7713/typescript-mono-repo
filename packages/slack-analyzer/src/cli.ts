#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { SlackMessageExtractor } from './services/SlackMessageExtractor';
import { FileExporter } from './services/FileExporter';
import { ExtractorConfig } from './types';

dotenv.config();

const program = new Command();

program
  .name('slack-analyzer')
  .description('Extract messages from Slack channels with API rate limiting support')
  .version('1.0.0');

program
  .command('extract')
  .description('Extract messages from a Slack channel')
  .requiredOption('-c, --channel <channelId>', 'Slack channel ID (e.g., C1234567890)')
  .option('-t, --token <token>', 'Slack bot token (or use SLACK_BOT_TOKEN env var)')
  .option('-o, --output <fileName>', 'Output file name', 'slack-messages.txt')
  .option('-f, --format <format>', 'Output format (text|json|markdown)', 'text')
  .option('-l, --limit <number>', 'Maximum number of messages to extract', '100')
  .option('-e, --exclude <userIds>', 'Comma-separated list of user IDs to exclude', '')
  .option('--start-date <date>', 'Start date (YYYY-MM-DD format, e.g., 2025-06-01)')
  .option('--end-date <date>', 'End date (YYYY-MM-DD format, e.g., 2025-06-17)')
  .action(async (options: any) => {
    try {
      const envExcludedUserIds = process.env.EXCLUDED_USER_IDS 
        ? process.env.EXCLUDED_USER_IDS.split(',').map((id: string) => id.trim())
        : [];
      
      const cliExcludedUserIds = options.exclude 
        ? options.exclude.split(',').map((id: string) => id.trim())
        : [];
      
      const excludedUserIds = [...envExcludedUserIds, ...cliExcludedUserIds];

      const config: ExtractorConfig = {
        token: options.token || process.env.SLACK_BOT_TOKEN || '',
        channelId: options.channel,
        excludedUserIds,
        messageLimit: parseInt(options.limit, 10),
        outputFileName: options.output,
        outputFormat: options.format || 'text',
        startDate: options.startDate,
        endDate: options.endDate
      };

      if (!config.token) {
        console.error('❌ Error: Slack bot token is required. Set SLACK_BOT_TOKEN environment variable or use --token option.');
        process.exit(1);
      }

      if (!config.channelId) {
        console.error('❌ Error: Channel ID is required. Use --channel option.');
        process.exit(1);
      }

      console.log('🔧 Configuration:');
      console.log(`   Channel ID: ${config.channelId}`);
      console.log(`   Message limit: ${config.messageLimit}`);
      console.log(`   Output file: ${config.outputFileName}`);
      console.log(`   Date range: ${config.startDate || 'All time'} to ${config.endDate || 'Now'}`);
      console.log(`   Excluded users from ENV: ${envExcludedUserIds.length > 0 ? envExcludedUserIds.join(', ') : 'None'}`);
      console.log(`   Excluded users from CLI: ${cliExcludedUserIds.length > 0 ? cliExcludedUserIds.join(', ') : 'None'}`);
      console.log(`   Total excluded users: ${config.excludedUserIds.length > 0 ? config.excludedUserIds.join(', ') : 'None'}`);
      console.log('');

      const extractor = new SlackMessageExtractor(config);
      const { messages, stats } = await extractor.extractMessages();
      
      await FileExporter.exportToFile(messages, config.outputFileName, stats, config.outputFormat || 'text');
      
      console.log('\n🎉 Extraction completed successfully!');
      
    } catch (error) {
      console.error('❌ Fatal error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current configuration and help')
  .action(() => {
    console.log('🔧 Slack Analyzer Configuration Help');
    console.log('');
    console.log('Environment Variables:');
    console.log('  SLACK_BOT_TOKEN    - Your Slack bot token (required)');
    console.log('  DEFAULT_CHANNEL_ID - Default channel ID to use');
    console.log('  EXCLUDED_USER_IDS  - Comma-separated user IDs to exclude');
    console.log('');
    console.log('Required Slack App Permissions:');
    console.log('  - channels:history  - Read messages in public channels');
    console.log('  - groups:history    - Read messages in private channels');
    console.log('  - im:history        - Read direct messages');
    console.log('  - mpim:history      - Read group direct messages');
    console.log('');
    console.log('API Rate Limits (for non-approved apps):');
    console.log('  - conversations.history: 1 request/minute, max 15 messages per request');
    console.log('  - conversations.replies: 1 request/minute, max 15 messages per request');
    console.log('  - This tool automatically handles rate limiting with 60-second waits');
    console.log('');
    console.log('Example Usage:');
    console.log('  slack-analyzer extract --channel C1234567890 --limit 50 --output messages.txt');
    console.log('  slack-analyzer extract -c C1234567890 -l 100 -e U1111111111,U2222222222');
    console.log('');
    console.log('Current Environment:');
    console.log(`  SLACK_BOT_TOKEN: ${process.env.SLACK_BOT_TOKEN ? '✅ Set' : '❌ Not set'}`);
    console.log(`  DEFAULT_CHANNEL_ID: ${process.env.DEFAULT_CHANNEL_ID || '❌ Not set'}`);
    console.log(`  EXCLUDED_USER_IDS: ${process.env.EXCLUDED_USER_IDS || '❌ Not set'}`);
  });

if (process.argv.length === 2) {
  program.help();
}

program.parse();