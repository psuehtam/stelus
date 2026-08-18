import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/pages/services.html",
        destination: "/servicos",
        permanent: true,
      },
      {
        source: "/pages/contato.html",
        destination: "/contato",
        permanent: true,
      },
      {
        source: "/pages/sucesso-contato.html",
        destination: "/contato/sucesso",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
