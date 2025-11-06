import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Test files are located in __tests__ directories or end with .test.ts/.spec.ts
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "node_modules",
      "dist",
      ".idea",
      ".git",
      ".cache",
      "tests/e2e/playwright-e2e.spec.ts"
    ],

    // Environment settings
    environment: "node",

    // Set up environment variables for tests
    env: {
      CV_UPLOAD_DIR: "./uploads/cvs",
      MAX_CV_FILE_SIZE: "10485760",
      ALLOWED_CV_EXTENSIONS: "doc,docx,pdf",
      ALLOWED_CV_MIME_TYPES:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf",
    },

    // Global test settings
    globals: false,

    // Test execution settings
    testTimeout: 10000,
    hookTimeout: 10000,

    // Coverage configuration (when using --coverage)
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "coverage/**",
        "dist/**",
        "packages/*/test{,s}/**",
        "**/*.d.ts",
        "cypress/**",
        "test{,s}/**",
        "test{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}",
        "**/__tests__/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
        "**/.{eslint,mocha,prettier}rc.{js,cjs,yml}",
      ],
    },
  },
});
