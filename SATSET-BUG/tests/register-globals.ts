import { afterEach, beforeEach, describe, it, test } from "node:test";

const globals = globalThis as typeof globalThis & {
  afterEach?: typeof afterEach;
  beforeEach?: typeof beforeEach;
  describe?: typeof describe;
  it?: typeof it;
  test?: typeof test;
};

globals.afterEach ??= afterEach;
globals.beforeEach ??= beforeEach;
globals.describe ??= describe;
globals.it ??= it;
globals.test ??= test;
