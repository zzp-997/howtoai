import path from "node:path";
import { loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import postcssPxToViewport from "postcss-px-to-viewport";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "@vant/auto-import-resolver";
import { TDesignResolver } from "unplugin-vue-components/resolvers";

const CWD = process.cwd();

// https://vite.dev/config/
export default ({ mode }) => {
  const { VITE_BASE_URL, VITE_API_URL, VITE_API_URL_PREFIX } = loadEnv(mode, CWD);
  return {
    base: VITE_BASE_URL,
    build: {
      target: 'es2015',
      outDir: "dist",
      assetsDir: "./",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
        },
        format: {
          ecma: 5
        }
      },
      rollupOptions: {
        output: {
          entryFileNames: "js/[name]-[hash].js",
          chunkFileNames: "js/[name]-[hash].js",
          assetFileNames(chunkInfo) {
            if (chunkInfo.name.endsWith(".css")) {
              return "css/[name]-[hash][extname]";
            }
            const imgExt = [
              ".png",
              ".jpe",
              ".jpeg",
              ".gif",
              ".svg",
              ".webp",
              ".ico",
              ".jpg",
            ];
            if (imgExt.some((ext) => chunkInfo.name.endsWith(ext))) {
              return "images/[name]-[hash][extname]";
            }
            return "assets/[name]-[hash][extname]";
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
          tailwindcss("./tailwind.config.js"),
          autoprefixer(),
          postcssPxToViewport({
            unitToConvert: "px",
            viewportWidth: 750,
            viewportHeight: 1624,
            unitPrecision: 6,
            propList: ["*"],
            viewportUnit: "vw",
            fontViewportUnit: 'vw',
            minPixelValue: 1,
            mediaQuery: true,
            replace: true,
            exclude: /node_modules/,
            landscape: false
          }),
        ],
      },
      preprocessorOptions: {
        less: {
          math: "strict",
          javascriptEnabled: true,
        },
      },
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [
          TDesignResolver({
            library: "mobile-vue",
          }),
          VantResolver()
        ],
        imports: ['vue', 'vue-router', 'pinia'],
        dirs: ['src/utils/common', 'src/stores', 'src/router'],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
        },
      }),
      Components({
        resolvers: [
          TDesignResolver({
            library: "mobile-vue",
          }),
          VantResolver()
        ],
      }),
    ],
    server: {
      port: 3002,
      host: "0.0.0.0",
      proxy: {
        [VITE_API_URL_PREFIX]: {
          target: VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(new RegExp(`^${VITE_API_URL_PREFIX}`), ""),
        },
      },
    },
  };
};
