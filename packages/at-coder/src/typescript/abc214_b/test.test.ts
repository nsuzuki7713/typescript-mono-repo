import { main } from "./main";

describe("abc214_b", () => {
  let log: any[] = [];
  beforeEach(() => {
    log = [];
    const original_console_log = console.log;
    console.log = function (...message) {
      log[log.length] = message[0];
      original_console_log(...message);
    };
  });

  it("(1, 0)の場合、4", () => {
    main("1 0");
    // console.log(log);
    expect(log[0]).toBe(4);
  });

  it("(2, 5)の場合、10", () => {
    main("2 5");
    expect(log[0]).toBe(10);
  });

  it("(10, 10)の場合、213", () => {
    main("10 10");
    expect(log[0]).toBe(213);
  });

  it("(30, 100)の場合、2471", () => {
    main("30 100");
    expect(log[0]).toBe(2471);
  });
});
