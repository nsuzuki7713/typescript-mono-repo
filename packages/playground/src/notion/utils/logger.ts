/**
 * ログレベル定義
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 現在のログレベル
 * 環境変数で制御可能
 */
const currentLogLevel = (() => {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  switch (envLevel) {
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARN':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    default:
      return LogLevel.INFO; // デフォルトはINFO
  }
})();

/**
 * ログ出力の時間フォーマット
 *
 * @returns 現在時刻の文字列表現
 */
function getFormattedTime(): string {
  return new Date().toISOString();
}

/**
 * ログレベルに応じた色コード
 */
const LogLevelColors = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m', // Green
  [LogLevel.WARN]: '\x1b[33m', // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
};

/**
 * ログレベルの文字列表現
 */
const LogLevelLabels = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO ',
  [LogLevel.WARN]: 'WARN ',
  [LogLevel.ERROR]: 'ERROR',
};

/**
 * カラーリセット
 */
const RESET = '\x1b[0m';

/**
 * 指定したログレベルでログを出力する
 *
 * @param level ログレベル
 * @param message メッセージ
 * @param args 追加パラメータ
 */
function log(level: LogLevel, message: string, ...args: unknown[]): void {
  // 設定されたログレベルより低いレベルは出力しない
  if (level < currentLogLevel) {
    return;
  }

  const time = getFormattedTime();
  const color = LogLevelColors[level];
  const label = LogLevelLabels[level];

  // エラーオブジェクトを適切に表示するための処理
  const formattedArgs = args.map((arg) => {
    if (arg instanceof Error) {
      return arg.stack || arg.message;
    }
    return arg;
  });

  // ログレベルに応じた出力先の選択
  const logFn = level >= LogLevel.ERROR ? console.error : console.log;

  if (formattedArgs.length > 0) {
    logFn(`${color}[${time}] [${label}]${RESET} ${message}`, ...formattedArgs);
  } else {
    logFn(`${color}[${time}] [${label}]${RESET} ${message}`);
  }
}

/**
 * ロガークラス
 */
export class Logger {
  /**
   * デバッグレベルのログを出力
   *
   * @param message ログメッセージ
   * @param args 追加パラメータ
   */
  static debug(message: string, ...args: unknown[]): void {
    log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * 情報レベルのログを出力
   *
   * @param message ログメッセージ
   * @param args 追加パラメータ
   */
  static info(message: string, ...args: unknown[]): void {
    log(LogLevel.INFO, message, ...args);
  }

  /**
   * 警告レベルのログを出力
   *
   * @param message ログメッセージ
   * @param args 追加パラメータ
   */
  static warn(message: string, ...args: unknown[]): void {
    log(LogLevel.WARN, message, ...args);
  }

  /**
   * エラーレベルのログを出力
   *
   * @param message ログメッセージ
   * @param args 追加パラメータ
   */
  static error(message: string, ...args: unknown[]): void {
    log(LogLevel.ERROR, message, ...args);
  }
}
