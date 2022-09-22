const presets = [
  [
    '@babel/env',
    { useBuiltIns: 'entry', corejs: 3 },
  ],
  [
    '@babel/preset-react',
    {
      // This is required to enable the React Developer Tools extension.
      // Disabling this since it stops the build from working.
      // development: process.env.NODE_ENV !== 'production',
      runtime: 'automatic',
    },
  ],
  '@babel/preset-typescript',
];

const plugins = [
  'react-hot-loader/babel',
  'transform-class-properties',
];

if (process.env.NODE_ENV !== 'production') {
  plugins.push('istanbul');
}

module.exports = { presets, plugins };
