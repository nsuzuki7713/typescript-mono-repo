import axios from 'axios';
import { Users } from './users';

jest.mock('axios');
// 型をつける
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
});
