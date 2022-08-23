import axios from 'axios';
import { Users } from './users';
import defaultExport, { bar, foo } from './foo-bar-baz';

jest.mock('axios');
// 型をつける
const mockedAxios = axios as jest.Mocked<typeof axios>;

// itの中にいれたら動かなかった
jest.mock('./foo-bar-baz', () => {
  const originalModule = jest.requireActual('./foo-bar-baz');

  //Mock the default export and named export 'foo'
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    ...originalModule,
    default: jest.fn(() => 'mocked baz'),
    foo: 'mocked foo',
  };
});

describe('モック関数', () => {
  it('モック関数を利用する', () => {
    const forEach = (items: number[], callback: (n: number) => number) => {
      for (let index = 0; index < items.length; index++) {
        callback(items[index] ?? 0);
      }
    };
    const mockCallback = jest.fn((x) => 42 + x);

    forEach([0, 1], mockCallback);

    // モック関数が呼ばれかの確認
    expect(mockCallback.mock.calls).toHaveLength(2);
    // 関数を最初に呼び出したときの第一引数
    expect(mockCallback.mock.calls[0]![0]).toBe(0);
    // 関数を2回目に呼び出したときの第一引数
    expect(mockCallback.mock.calls[1]![0]).toBe(1);
    // 最初に関数を呼び出したときの戻り値
    expect(mockCallback.mock.results[0]!.value).toBe(42);
  });

  it('モックの戻り値', () => {
    const myMock = jest.fn();
    expect(myMock()).toBeUndefined();

    myMock.mockReturnValueOnce(10).mockReturnValueOnce('x').mockReturnValue(true);

    expect(myMock()).toBe(10);
    expect(myMock()).toBe('x');
    expect(myMock()).toBe(true);
    expect(myMock()).toBe(true);
  });

  it('モジュールのモック', async () => {
    const users = [{ name: 'Bob' }];
    const resp = { data: users };
    mockedAxios.get.mockResolvedValue(resp);
    // or you could use the following depending on your use case:
    // mockedAxios.get.mockImplementation(() => Promise.resolve(resp));

    await expect(Users.all()).resolves.toEqual(users);
  });

  it('部分的なモック', () => {
    const defaultExportResult = defaultExport();
    expect(defaultExportResult).toBe('mocked baz');
    expect(defaultExport).toHaveBeenCalled();
    expect(foo).toBe('mocked foo');
    expect(bar()).toBe('bar');
  });
});
