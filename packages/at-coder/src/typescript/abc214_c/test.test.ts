import { main } from "./main";

describe("abc214_c", () => {
  let log: any[] = [];
  const original_console_log = console.log;
  console.log = function (message, ...rest) {
    log[log.length] = message;
    original_console_log(message);
  };
  beforeEach(() => {
    log = [];
  });

  it(`3
      4 1 5
      3 10 100の場合、3,7,8になる`, () => {
    main(`3
    4 1 5
    3 10 100`);
    expect(log[0]).toBe(3);
    expect(log[1]).toBe(7);
    expect(log[2]).toBe(8);
  });

  it(`4
      100 100 100 100
      1 1 1 1の場合、1,1,1,1になる`, () => {
    main(`4
    100 100 100 100
    1 1 1 1`);
    expect(log[0]).toBe(1);
    expect(log[1]).toBe(1);
    expect(log[2]).toBe(1);
    expect(log[3]).toBe(1);
  });

  it(`4
      1 2 3 4
      1 2 4 7の場合、1,2,4,7になる`, () => {
    main(`4
    1 2 3 4
    1 2 4 7`);
    expect(log[0]).toBe(1);
    expect(log[1]).toBe(2);
    expect(log[2]).toBe(4);
    expect(log[3]).toBe(7);
  });

  it(`8
      84 87 78 16 94 36 87 93
      50 22 63 28 91 60 64 27の場合、50,22,63,28,44,60,64,27になる`, () => {
    main(`8
    84 87 78 16 94 36 87 93
    50 22 63 28 91 60 64 27`);
    expect(log[0]).toBe(50);
    expect(log[1]).toBe(22);
    expect(log[2]).toBe(63);
    expect(log[3]).toBe(28);
    expect(log[4]).toBe(44);
    expect(log[5]).toBe(60);
    expect(log[6]).toBe(64);
    expect(log[7]).toBe(27);
  });
});
