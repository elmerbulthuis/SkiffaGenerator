import { PackageJson } from "type-fest";
import { withDependencies } from "../../utils.js";

export function generatePackageJsonData(name: string, version: string) {
  const content: PackageJson = {
    name: name,
    version: version,
    sideEffects: false,
    type: "module",
    main: "./bundled/main.cjs",
    module: "./bundled/main.js",
    types: "./typed/main.d.ts",
    browser: "./bundled/browser.js",
    exports: {
      ".": {
        // Order matters for vite! So let's make vite happy and set browser first.
        browser: "./bundled/browser.js",
        import: "./bundled/main.js",
        require: "./bundled/main.cjs",
        types: "./typed/main.d.ts",
      },
    },
    files: ["./typed/**", "./bundled/**"],
    scripts: {
      prepack: "node ./scripts/build.js",
      pretest: "node ./scripts/build.js",
      build: "node ./scripts/build.js",
      clean: "node ./scripts/clean.js",
      test: "node --test ./transpiled/examples.test.js ./transpiled/mocks.test.js ./transpiled/client-server.test.js",
    },
    author: "",
    license: "ISC",
    dependencies: withDependencies(["@types/node", "goodrouter", "@skiffa/lib"]),
    devDependencies: withDependencies(["typescript", "rollup", "@tsconfig/node18"]),
    engines: {
      node: ">=18",
    },
  };

  return content;
}
