/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações para reduzir timeouts
  experimental: {
    esmExternals: 'loose',
  },
  
  webpack: (config, { isServer, dev }) => {
    // Otimizações para desenvolvimento
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    // Fix para compatibilidade com Firebase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
        path: false,
        os: false,
      }
    }
    
    // Excluir undici completamente do bundle do cliente
    if (!isServer) {
      config.externals = config.externals || []
      config.externals.push('undici')
    }
    
    // Ignorar módulos problemáticos
    config.ignoreWarnings = [
      { module: /node_modules\/undici/ },
      { module: /node_modules\/@firebase/ },
    ]
    
    // Configurar parser para ignorar sintaxe de campos privados
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    
    config.module.rules.push({
      test: /node_modules\/undici/,
      use: 'null-loader'
    })
    
    return config
  },
  
  // Transpile packages problemáticos
  transpilePackages: ['firebase', '@firebase/auth', '@firebase/firestore'],
  
  // Configurações de timeout
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig
