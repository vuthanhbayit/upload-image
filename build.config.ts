import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    { format: 'cjs', input: 'src/' },
  ],
  outDir: 'lib',
  externals: ['vue'],
})
