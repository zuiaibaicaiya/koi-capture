import { Plugin, ViteDevServer, build } from 'vite';
import { AddressInfo } from 'net';
import electron from 'electron';
import { spawn } from 'child_process';
import { resolve } from 'path';
import bytenode from 'bytenode'
import * as fs from "fs";
import { builtinModules } from 'module';

async function buildElectron(encode = false) {
    await build({
        root: resolve(process.cwd(), 'dist'), // 指向主进程目录
        logLevel: 'error',
        build: {
            outDir: resolve(process.cwd(), 'dist', 'electron'),
            minify: false,
            lib: {
                entry: [
                    resolve(process.cwd(), 'electron', 'main.ts'),
                    resolve(process.cwd(), 'electron', 'preload.ts'),
                ],
                formats: ['cjs'],
                fileName: () => '[name].cjs',
            },
            rollupOptions: {
                external: [
                    // 告诉 Rollup 不要打包内建 API
                    'electron',
                    'bytenode',
                    ...builtinModules
                ],
            },
        },
    });
    if (encode) {
        bytenode.compileFile({
            electron: true,
            filename: resolve(process.cwd(), 'dist', 'electron', 'main.cjs'),
        })
        fs.writeFileSync(resolve(process.cwd(), 'dist', 'electron', 'main.cjs'), "require('bytenode');module.exports = require('./main.jsc')")
    }
}

export default (): Plugin => {
    return {
        name: 'vite-plugin-electron',
        async buildStart() {
            await buildElectron();
        },
        async configureServer(server: ViteDevServer) {
            server.httpServer?.once('listening', () => {
                const addressInfo = server.httpServer?.address() as AddressInfo;
                const address = `http://localhost:${addressInfo.port}`;
                console.log(address, electron.toString());

                const electronProcess = spawn(
                    electron.toString(),
                    ['./dist/electron/main.cjs', address],
                    {
                        cwd: process.cwd(),
                        stdio: 'inherit',
                    },
                );
                electronProcess.on('close', () => {
                    electronProcess.kill();
                    server.close();
                    process.exit();
                });
            });
        },
        async closeBundle() {
            await buildElectron(true);
            spawn('electron-builder', {
                stdio: 'inherit',
                shell: true,
            });
        },
    };
};
