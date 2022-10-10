import { main } from "./abc214_a";

describe("abc214_a", () => {
  let log: any[] = [];
  beforeEach(() => {
    log = [];
    const original_console_log = console.log;
    console.log = function (message) {
      log[log.length] = message;
      original_console_log(message);
    };
  });

  it("214の場合、8が表示される", () => {
    main("214");
    expect(log[0]).toBe(8);
  });

  it("1の場合、4が表示される", () => {
    main("1");
    expect(log[0]).toBe(4);
  });

  it("126の場合、6が表示される", () => {
    main("126");
    expect(log[0]).toBe(6);
  });
});
