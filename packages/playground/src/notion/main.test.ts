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

  it('プルリク作成テーブルにデータを追加', async () => {
    const databaseId = process.env.NOTION_DATABASEID ?? '';
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        プルリク名: {
          title: [
            {
              text: {
                content: 'プルリク名',
              },
            },
          ],
        },
        作成者: {
          type: 'select',
          select: {
            name: '作成者',
          },
        },
        削除行数: {
          type: 'number',
          number: 0,
        },
        作成日: {
          type: 'date',
          date: {
            start: '2021-04-25 12:00',
            time_zone: 'Asia/Tokyo',
          },
        },
        修正ファイル: {
          type: 'number',
          number: 0,
        },
        approve時間: {
          type: 'date',
          date: {
            start: '2021-04-25 12:00',
            time_zone: 'Asia/Tokyo',
          },
        },
        追加行数: {
          type: 'number',
          number: 0,
        },
        マージ時間: {
          type: 'date',
          date: {
            start: '2021-04-25 12:00',
            time_zone: 'Asia/Tokyo',
          },
        },
        URL: {
          type: 'url',
          url: 'https://www.yahoo.co.jp/',
        },
      },
    });

    console.log(response);
  });

  it.only('サブアイテムを作成', async () => {
    const databaseId = process.env.NOTION_DATABASEID ?? '';
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        レビュー者: {
          type: 'select',
          select: {
            name: '作成者',
          },
        },
        親アイテム: {
          type: 'relation',
          relation: [
            {
              id: '59d8f386-5a5d-407a-93fe-e3a2632dcfdb',
            },
          ],
        },
      },
    });
  });

  it('ページにテキストを追加する', async () => {
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
