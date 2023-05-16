import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";
import { truncateSkipping } from "../converter_truncate.ts";

Deno.test("truncateSkipping", () => {
  assertEquals(truncateSkipping("foo bar", 0, "..", 0), "");
  assertEquals(truncateSkipping("foo bar", 0, "..", 5), "");
  assertEquals(truncateSkipping("foo bar", 3, "..", 3), "..bar");
  assertEquals(truncateSkipping("foo bar", 6, "..", 3), "f..bar");
  assertEquals(truncateSkipping("fooあい", 5, "..", 3), "f..い");
  assertEquals(truncateSkipping("あいうえ", 6, "..", 2), "あ..え");
});
