import { isRight, right, map } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';

// 公式ドキュメント: https://github.com/gcanti/io-ts
describe('io-ts', () => {
  it('オブジェクトの構造が正しい場合', () => {
    const book = t.type({
      id: t.number,
      title: t.string,
      author: t.string,
    });
    // バリデータから型定義を作成できる。
    type Book = t.TypeOf<typeof book>;

    const data = {
      id: 1,
      title: 'タイトル',
      author: '著者',
    };

    const validation = book.decode(data);

    expect(isRight(validation)).toBe(true);
  });

  it('stringはnumberではない', () => {
    const x = t.number.decode(JSON.parse(`"a"`));
    expect(isRight(x)).toBeFalsy();
  });

  it('numberはstringではない', () => {
    const x = t.string.decode(JSON.parse(`123`));
    expect(isRight(x)).toBeFalsy();
  });

  it('オブジェクトの検査', () => {
    const X = t.type({ a: t.number });
    const x = X.decode(JSON.parse(`{"a":123}`));
    expect(x).toStrictEqual(right({ a: 123 }));
  });

  it('オブジェクトのプロパティが一致しない', () => {
    const X = t.type({ x: t.number });
    const x = X.decode(JSON.parse(`{"a":123}`));
    expect(isRight(x)).toBeFalsy();
  });

  it('余分なプロパティがあっても良い', () => {
    const X = t.type({ a: t.number });
    const x = X.decode(JSON.parse(`{"a":123,"b":456}`));
    expect(x).toStrictEqual(right({ a: 123, b: 456 }));
  });

  it('exactを使うと余分なプロパティは消える', () => {
    const X = t.exact(t.type({ a: t.number }));
    const x = X.decode(JSON.parse(`{"a":123,"b":456}`));
    expect(x).toStrictEqual(right({ a: 123 }));
  });

  it('unionの例', () => {
    const X = t.union([
      t.type({ x: t.literal('number'), a: t.number }),
      t.type({ x: t.literal('string'), a: t.string }),
    ]);
    type Xtype = t.TypeOf<typeof X>; // 型情報が取れる
    const num = X.decode(JSON.parse(`{"x": "number", "a":123}`));
    const str = X.decode(JSON.parse(`{"x": "string", "a":"xyz"}`));

    const f = (a: Xtype) => {
      switch (a.x) {
        case 'number':
          return a.a * 2;
        case 'string':
          return a.a.length;
      }
    };
    expect(pipe(num, map(f))).toStrictEqual(right(246));
    expect(pipe(str, map(f))).toStrictEqual(right(3));
  });

  it('複雑なタイプの場合', () => {
    const encryptedText = t.type({
      value: t.string,
      iv: t.string,
    });
    const testA = t.type({
      enabled: t.boolean,
      destinationGroupId: t.union([t.string, t.undefined]),
      cusId: t.union([encryptedText, t.undefined]),
      secretKey: t.union([encryptedText, t.undefined]),
      token: t.union([
        t.type({
          value: encryptedText,
          expiration: t.string,
        }),
        t.undefined,
      ]),
    });
    const testB = t.type({
      enabled: t.boolean,
      destinationGroupId: t.union([t.string, t.undefined]),
      clientId: t.union([encryptedText, t.undefined]),
      token: t.union([
        t.type({
          value: encryptedText,
          expiration: t.string,
        }),
        t.undefined,
      ]),
    });
    const integrationCredentials = t.type({
      customerId: t.string,
      integrationService: t.keyof({ testB: null, testA: null }),
      credential: t.union([testA, testB]),
      isEnabled: t.boolean,
      createUid: t.string,
      createdAt: t.string,
      updateUid: t.string,
      updatedAt: t.string,
    });
    const integrationCredentialsFortestB = t.type({
      customerId: t.string,
      integrationService: t.literal('A'),
      credential: testB,
      isEnabled: t.boolean,
      createUid: t.string,
      createdAt: t.string,
      updateUid: t.string,
      updatedAt: t.string,
    });
    const integrationCredentialsFortestA = t.type({
      customerId: t.string,
      integrationService: t.literal('testA'),
      credential: testA,
      isEnabled: t.boolean,
      createUid: t.string,
      createdAt: t.string,
      updateUid: t.string,
      updatedAt: t.string,
    });

    const C = t.union([integrationCredentialsFortestB, integrationCredentialsFortestA]);
    type X = t.TypeOf<typeof C>;

    type A = t.TypeOf<typeof integrationCredentials>;
    expect(1).toBe(1);
  });
});
