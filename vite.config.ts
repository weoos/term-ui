/*
 * @Author: theajack
 * @Date: 2023-04-04 23:20:27
 * @Description: Coding something
 */
import type {UserConfig} from 'vite';
import {defineConfig} from 'vite';
import {babel} from '@rollup/plugin-babel';
import {resolve} from 'path';
import pkg from './package.json';
import {execSync} from 'child_process';
import {writeFileSync, copyFileSync, rmdirSync} from 'fs';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const Inline = false;

const {version, ebuild, dependencies = {}, name} = pkg;

const fileName = ebuild.fileName || ebuild.publish.name;
const pubVersion = ebuild.publish.version || version;

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    const isDev = mode === 'development';
    console.log('defineConfig', mode, isDev);

    const config = ({
        'development': geneDevConfig,
        'sdk': () => geneBuildConfig(),
        'sdk_iife': () => geneBuildConfig(true),
        'app': geneBuildAppConfig
    })[mode]();

    return {
        define: {
            __DEV__: isDev,
            __VERSION__: `"${pubVersion}"`,
            __WIN__: 'globalThis',
        },
        ...config,
    };
});
// ! Dev VApp 时的配置
function geneDevConfig (): UserConfig {
    return {
        plugins: [],
        server: {
            host: '0.0.0.0',
            port: 5173,
        },
    };
}

function geneBuildAppConfig (): UserConfig {
    return {
        base: `/term-ui`,
        build: {
            outDir: './docs'
        }
    };
}

function geneBuildConfig (isIIFE = false): UserConfig {
    return {
        plugins: [
            cssInjectedByJsPlugin(), {
                name: 'generate-npm-stuff',
                writeBundle () {
                    if (isIIFE) {
                        const fullName = `${fileName}.iife.min.js`;
                        copyFileSync(`npm/iife/${fullName}`, `npm/${fullName}`);
                        rmdirSync('npm/iife', {recursive: true});
                    } else {
                        execSync([
                            'npx dts-bundle-generator -o',
                            `npm/${fileName}.es.min.d.ts`,
                            'src/index.ts',
                            '--no-check',
                            '--no-banner',
                            '--external-inlines',
                            Inline ? Object.keys(dependencies).join(' ') : ''
                        ].join(' '));
                        generatePackage();
                        execSync('vite build -m=sdk_iife');
                    }
                }
            }],
        
        build: {
            minify: true,
            lib: {
                entry: resolve(__dirname, 'src/index.ts'), // 打包的入口文件
                name: ebuild.libName, // 包名
                formats: isIIFE ? ['iife'] : ['es'], // 打包模式，默认是es和umd都打
                fileName: (format: string) => `${fileName}.${format}.min.js`,
            },
            rollupOptions: {
                external: (isIIFE || Inline) ? [] : Object.keys(dependencies),
                plugins: [
                    babel({
                        exclude: 'node_modules/**',
                        extensions: ['.js', '.ts', 'tsx'],
                        configFile: resolve(__dirname, './build/babel.config.js'),
                    })
                ]
            },
            outDir: resolve(__dirname, isIIFE ? 'npm/iife' : 'npm'), // 打包后存放的目录文件
        },
    };
}

function generatePackage () {

    copyFileSync('./README.md', './npm/README.md');
    copyFileSync('./LICENSE', './npm/LICENSE');

    writeFileSync('./npm/package.json', JSON.stringify({
        ...ebuild.publish,
        dependencies: Inline ? {} : dependencies,
        'main': `${fileName}.es.min.js`,
        'module': `${fileName}.es.min.js`,
        'unpkg': `${fileName}.iife.min.js`,
        'jsdelivr': `${fileName}.iife.min.js`,
        'typings': `${fileName}.es.min.d.ts`,
    }, null, 2), 'utf8');
}