import assert from "assert";
import test, { describe } from "node:test";
import { DiscordStringLimits } from "../../@enum";
import { SString } from "../../prototypes/string";

new SString();

const STRING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque in mollis dolor, quis egestas lectus. Pellentesque libero erat, faucibus ut scelerisque efficitur, pellentesque sit amet massa. Donec egestas ullamcorper mi eu ullamcorper. Maecenas pulvinar enim ultrices vehicula maximus. In varius justo vel tellus feugiat tincidunt. Etiam pulvinar sollicitudin odio vel porttitor. Nulla vehicula quis magna sed maximus. Curabitur rutrum, magna ut semper semper, lorem risus accumsan ex, nec iaculis nulla tellus a augue." as const;

describe("testind the String#limit", () => {
  // @ts-expect-error ts(2769)
  const keys = Object.keys(DiscordStringLimits).filter(isNaN) as (keyof typeof DiscordStringLimits)[];

  for (const key of keys) {
    test(`${key} (${DiscordStringLimits[key]})`, () => {
      assert.equal(STRING.limit(key).length, Math.min(STRING.length, DiscordStringLimits[key]));
    });
  }
});
