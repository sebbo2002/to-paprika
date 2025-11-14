#!/usr/bin/env node
'use strict';

import { writeFile } from 'node:fs/promises';
import revealFile from 'reveal-file';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Config } from '../lib/config.js';
import { Converter } from '../lib/convert.js';

yargs(hideBin(process.argv))
    .usage('$0 <cmd> [args]')
    .command(
        'setup',
        'Create or update the configuration file',
        () => {},
        () => Config.setup(),
    )
    .command(
        'convert [files..]',
        'Convert supported files to a .paprikarecipes file',
        (yargs) => {
            yargs.positional('files', {
                array: true,
                demandOption: true,
                describe: 'Input files to convert',
                type: 'string',
            });
        },
        async (argv) => {
            const files = argv.files as string[];
            const recipes = await Converter.convert(files, {
                stdout: process.stdout,
            });

            const outputFile = await Converter.generateOutputFilePath(files);
            await writeFile(outputFile, recipes);
            await revealFile(outputFile);
        },
    )
    .command(
        'server',
        'Launch the server',
        () => {},
        () => {
            import('./start.ts').catch((error) => {
                console.error('Failed to start the server:', error);
                process.exit(1);
            });
        },
    )
    .demandCommand(1, 1)
    .strict()
    .help('h')
    .parse();
