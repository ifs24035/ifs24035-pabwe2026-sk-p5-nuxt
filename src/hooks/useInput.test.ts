import { describe, it, expect } from "vitest";
import useInput from "./useInput";

describe("useInput", () => {
  it("memakai nilai awal dan default kosong", () => {
    const [value] = useInput("halo");
    const [empty] = useInput();
    expect(value.value).toBe("halo");
    expect(empty.value).toBe("");
  });

  it("memperbarui nilai dari event input", () => {
    const [value, onChange] = useInput();
    onChange({ target: { value: "baru" } });
    expect(value.value).toBe("baru");
  });

  it("menerima nilai langsung selain event", () => {
    const [value, onChange, setValue] = useInput();
    onChange("langsung");
    expect(value.value).toBe("langsung");
    onChange(undefined as any);
    expect(value.value).toBeUndefined();
    setValue("setter");
    expect(value.value).toBe("setter");
  });
});
