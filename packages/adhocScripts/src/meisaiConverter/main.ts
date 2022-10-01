import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * meisai.csv を convertMeisai.csv に変換する
 */
async function main() {
  const meisaiText = readMeisaiFile();
  const convertedMeisaiText = convertMeisaiText(meisaiText);
  createFile(convertedMeisaiText);
  await syncSpreadSheet(convertedMeisaiText);
  console.log(`url: https://docs.google.com/spreadsheets/d/${process.env.SHEET_ID}`);
}

/**
 * meisai.csv を読み込み、その中身の文字列として返す。
 *
 * @returns meisai.csv の中身の文字列
 */
function readMeisaiFile(): string {
  const file = fs.readFileSync(`${__dirname}/meisai.csv`);
  return iconv.decode(Buffer.from(file), 'Shift_JIS');
}

/**
 * meisai.csv の中身の文字列をconvertMeisai.csv用に変換する。
 *
 * @param meisaiText meisai.csv の中身の文字列
 * @returns convertMeisai.csv用の文字列の配列
 */
function convertMeisaiText(meisaiText: string) {
  const details = meisaiText.split('\r\n').slice(1).reverse().slice(1);

  return details.map((detail) => {
    const items = detail.split(',');
    const date = items[0]!.split('.');

    const [year, month, day] = date[0]!.split('/');

    // todo: 文字列ではなくオブジェクトで返したほうがわかりやすい。
    return [
      year,
      month,
      day,
      Number(...items.slice(1, 2)),
      ...items.slice(2, 5),
      convertUse(items[2]!, items[3]!),
    ].join('\t');
  });
}

/**
 * 預金譲渡と取り扱い内容から詳細を返す。
 *
 * @param deposit 預金情報
 * @param content 取り扱い内容
 * @returns 詳細の内容
 */
function convertUse(deposit: string, content: string): string {
  if (deposit) {
    return '入金';
  }

  const funds = [
    '"MHF)ｳｴﾙｽﾅﾋﾞ"',
    '"AP(ﾏﾈﾂｸｽﾂﾐﾀﾃ"',
    '"ｺｸﾐﾝﾈﾝｷﾝｷｷﾝﾚﾝｺﾞｳｶｲ(ｶ"',
    '"ｼﾖｳｷﾎﾞｶｹｷﾝ"',
    '"ﾏﾈﾂｸｽｼﾖｳｹﾝ"',
    '"DF.THEOﾂﾐﾀﾃ"',
  ];
  if (funds.includes(content)) {
    return '資金移動';
  }

  return '支払い';
}

/**
 * convertMeisai.csv を作成する。
 *
 * @param body convertMeisai.csv の中身の文字列の配列
 */
function createFile(body: string[]) {
  fs.unlinkSync(`${__dirname}/convertMeisai.csv`);
  fs.writeFileSync(`${__dirname}/convertMeisai.csv`, `年\t月\t日\tお引出し\tお預入れ\tお取り扱い内容\t残高\t詳細\r\n`);

  body.forEach((detail) => {
    fs.appendFileSync(`${__dirname}/convertMeisai.csv`, `${detail}\r\n`);
  });
}

/**
 * スプレットシートにデータを反映する。
 *
 * @param rows スプレットシートの行に追加する値
 */
async function syncSpreadSheet(rows: string[]) {
  const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

  await doc.useServiceAccountAuth({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private_key: (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle['三井住友'];

  if (!sheet) {
    throw new Error('sheet not found');
  }

  await sheet.addRows(rows.map((row) => row.split('\t').map((v) => v.replaceAll('"', ''))));
}

main().catch((e) => console.error(e));
