"use strict";

const { transform } = require("@babel/core");
const { assert } = require("chai");

const pluginPath = require.resolve("../index");

function normalize(code) {
  // Remove all blank lines, leading indentation and leading/trailing spaces.
  return code.replace(/\n\n/gm, "\n").replace(/\n\s*/gm, "\n").trim();
}

function process(code) {
  const { code: output } = transform(code, {
    plugins: [pluginPath],
  });
  return normalize(output);
}

describe("plugin", () => {
  it(`adds \`$inject\` property to functions annotated with @inject`, () => {
    const input = `
    // @inject
    function foo(paramA, paramB) {}
    `;
    const expected = normalize(`
    // @inject
    function foo(paramA, paramB) {}
    foo.$inject = ["paramA", "paramB"];
    `);
    assert.equal(process(input), expected);
  });

  it("does not add `$inject` property to un-annotated functions", () => {
    const input = "function foo(paramA, paramB) {}";
    assert.equal(process(input), normalize(input));
  });

  it(`adds \`$inject\` property to classes annotated with @inject`, () => {
    const input = `
      // @inject
      class Foo {
        constructor(paramA, paramB) {}
      }
    `;
    const expected = normalize(`
      // @inject
      class Foo {
        constructor(paramA, paramB) {}
      }
      Foo.$inject = ["paramA", "paramB"];
    `);
    assert.equal(process(input), expected);
  });

  it("does not add `$inject` property to un-annotated classes", () => {
    const input = `
      class Foo {
        constructor(paramA, paramB) {}
      }
    `;
    assert.equal(process(input), normalize(input));
  });

  ["export", "export default"].forEach((exportExpr) => {
    it(`adds \`$inject\` property to exported functions (${exportExpr})`, () => {
      const input = `
        // @inject
        ${exportExpr} function foo(paramA, paramB) {}
      `;

      const expected = normalize(`
       // @inject
       ${exportExpr} function foo(paramA, paramB) {}
       foo.$inject = ["paramA", "paramB"];
      `);

      assert.equal(process(input), expected);
    });
  });

  ["export", "export default"].forEach((exportExpr) => {
    it(`adds \`$inject\` property to exported classes (${exportExpr})`, () => {
      const input = `
        // @inject
        ${exportExpr} class Foo {
          constructor(paramA, paramB) {}
        }
      `;

      const expected = normalize(`
       // @inject
       ${exportExpr} class Foo {
        constructor(paramA, paramB) {}
       }
       Foo.$inject = ["paramA", "paramB"];
      `);

      assert.equal(process(input), expected);
    });
  });
});
