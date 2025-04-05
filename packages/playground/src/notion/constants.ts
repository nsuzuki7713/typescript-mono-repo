/**
 * Notion API関連の定数
 */
export const NOTION_CONSTANTS = {
  TIME_ZONE: 'Asia/Tokyo',
};

/**
 * 日付関連の定数
 */
export const DATE_CONSTANTS = {
  FORMAT: 'YYYY-MM-DD HH:mm',
  JST_OFFSET: 9, // 日本標準時のオフセット（時間）
};

/**
 * GitHub API関連の定数
 */
export const GITHUB_CONSTANTS = {
  PER_PAGE: 100,
  MERGED_SINCE: '2023-10-18', // マージされたPRの取得開始日
};

/**
 * 環境変数のキー
 */
export const ENV_KEYS = {
  GITHUB_ACCESS_TOKEN: 'GITHUB_ACCESS_TOKEN',
  GITHUB_OWNER: 'GITHUB_OWNER',
  GITHUB_REPO: 'GITHUB_REPO',
  NOTION_API_INTEGRATION_KEY: 'NOTION_API_INTEGRATIO_KEY', // 元のスペルミスを維持
  NOTION_DATABASE_ID: 'NOTION_DATABASEID2',
};
