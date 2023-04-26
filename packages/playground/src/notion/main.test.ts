import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

describe('notion api', () => {
  // Initializing a client
  const notion = new Client({
    auth: process.env.NOTION_API_INTEGRATIO_KEY,
  });

  it('ユーザーの一覧を取得する', async () => {
    const listUsersResponse = await notion.users.list({});

    console.log(listUsersResponse);
  });

  it('データベースの情報を取得する', async () => {
    const databaseId = process.env.NOTION_DATABASEID ?? '';
    const response = await notion.databases.retrieve({ database_id: databaseId });

    console.log(response);
  });

  it('データベースのページを作成する', async () => {
    const databaseId = process.env.NOTION_DATABASEID ?? '';
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: 'テスト2',
              },
            },
          ],
        },
      },
    });

    console.log(response);
  });

  it.only('ページにテキストを追加する', async () => {
    const pageId = process.env.NOTION_PAGEID ?? '';
    const response = await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                text: {
                  content: 'テスト',
                },
              },
            ],
          },
        },
      ],
    });

    console.log(response);
  });
});
