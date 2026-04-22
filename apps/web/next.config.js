/** @type {import('next').NextConfig} */
// Static export: matches tech-spec §3.1 — pre-rendered HTML per route,
// served from TPA's static CDN. No SSR, no API routes at runtime.
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Transpile the shared types package — it ships TS source under monorepo.
  transpilePackages: ['@tor/types'],
  // Allow `.js` import specifiers in TS source (NodeNext style) to resolve
  // to `.ts`/`.tsx` files. @tor/types uses `.js` extensions on its relative
  // imports so Node's ESM resolver works for the tracker; webpack needs
  // this hint to find the TS source when pre-bundling for the browser.
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
  // `next lint` can walk the workspace — scope it to this app.
  eslint: {
    dirs: ['pages', 'components', 'src'],
  },
};

module.exports = nextConfig;
