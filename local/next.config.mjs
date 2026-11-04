import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
  transpilePackages: ["@subboost/core", "@subboost/server-core", "@subboost/ui", "@subboost/config"],
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(process.cwd(), "src");
    config.resolve.alias["@local"] = path.resolve(process.cwd(), "src");
    config.resolve.modules = [
      path.resolve(process.cwd(), "node_modules"),
      ...(config.resolve.modules || []),
    ];
    return config;
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    const noStore = { key: "Cache-Control", value: "no-store, no-cache, max-age=0, must-revalidate" };
    return [
      {
        source: "/_next/static/:path*",
        headers: [...security, { key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      { source: "/:path*", headers: [...security, noStore] },
      {
        // 登录页 SSR 输出与访问者身份无关（鉴权由客户端 /api/auth/me 判定），
        // 允许边缘短缓存：把跨境每次 ~1s 的回源 TTFB 降到边缘 RTT。
        source: "/login",
        headers: [
          ...security,
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
    ];
  },
};

export default nextConfig;
