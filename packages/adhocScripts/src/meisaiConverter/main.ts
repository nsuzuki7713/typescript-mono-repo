import * as fs from 'fs';
import * as iconv from 'iconv-lite';

/**
 * meisai.csv を convertMeisai.csv に変換する
 */
function main() {
  const meisaiText = readMeisaiFile();
  const convertedMeisaiText = convertMeisaiText(meisaiText);
  createFile(convertedMeisaiText);
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
      Number(...items.slice(1, 2)) * -1,
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

main();
