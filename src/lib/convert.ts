import type { Writable } from 'node:stream';

import convert from 'heic-convert';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { pdfToPng } from 'pdf-to-png-converter';

import { Config } from './config.js';
import { Recipe, type RecipeType, toRecipes } from './recipe.js';

export interface ConverterOptions {
    stdout?: Writable;
}

export const mimeTypes = new Map([
    ['.heic', 'image/heic'],
    ['.jpeg', 'image/jpeg'],
    ['.jpg', 'image/jpeg'],
    ['.pdf', 'application/pdf'],
    ['.png', 'image/png'],
    ['.webp', 'image/webp'],
]);

export class Converter {
    protected client: OpenAI;
    protected config: Config;
    protected options: ConverterOptions;

    protected constructor(config: Config, options: ConverterOptions = {}) {
        this.config = config;
        this.options = options;
        this.client = new OpenAI({
            apiKey: config.llm.apiKey,
            baseURL: config.llm.baseUrl,
        });
    }

    static async convert(
        data: Buffer,
        mimeType: string,
        options?: ConverterOptions,
    ): Promise<Buffer>;
    static async convert(
        file: string,
        options?: ConverterOptions,
    ): Promise<Buffer>;
    static async convert(
        files: string[],
        options?: ConverterOptions,
    ): Promise<Buffer>;
    static async convert(
        arg1: Buffer | string | string[],
        arg2?: ConverterOptions | string,
        arg3?: ConverterOptions,
    ): Promise<Buffer> {
        const config = await Config.use();

        let recipes: RecipeType[] = [];
        if (
            typeof arg1 === 'string' &&
            (typeof arg2 === 'object' || arg2 === undefined)
        ) {
            recipes = await new Converter(config, arg2).convertFiles([arg1]);
        } else if (
            Array.isArray(arg1) &&
            (typeof arg2 === 'object' || arg2 === undefined)
        ) {
            recipes = await new Converter(config, arg2).convertFiles(arg1);
        } else if (arg1 instanceof Buffer && typeof arg2 === 'string') {
            recipes = await new Converter(config, arg3).convertBuffer(
                `Buffer (${arg1.byteLength} bytes)`,
                arg1,
                arg2,
            );
        } else {
            throw new Error('Invalid arguments for convert function.');
        }

        return await toRecipes(recipes);
    }

    static async generateOutputFilePath(inputFiles: string[]): Promise<string> {
        let fileName = `${Date.now().toString()}`;
        if (inputFiles.length === 1) {
            fileName = basename(inputFiles[0]).replace(/\.[a-z]{3,4}$/g, '');
        }

        const config = await Config.use();
        let path = join(config.output, fileName + '.paprikarecipes');
        if (existsSync(path)) {
            let counter = 1;
            do {
                path = join(
                    config.output,
                    `${fileName}-${counter}.paprikarecipes`,
                );
                counter++;
            } while (existsSync(path));
        }

        return path;
    }

    protected async convertBuffer(
        title: string,
        data: Buffer,
        mimeType: string,
    ): Promise<RecipeType[]> {
        // heic handling
        if (mimeType === 'image/heic') {
            this.log(title, '🔀');
            const jpeg = Buffer.from(
                await convert({
                    buffer: data,
                    format: 'JPEG',
                    quality: 1,
                }),
            );
            return this.convertBuffer(title, jpeg, 'image/jpeg');
        }

        // pdf handling
        if (mimeType === 'application/pdf') {
            this.log(title, '🔀');
            const pages = await pdfToPng(data);
            this.log(title, true);

            const result: RecipeType[] = [];
            for (const page of pages) {
                result.push(
                    ...(await this.convertBuffer(
                        `${title} (p. ${page.pageNumber})`,
                        page.content,
                        'image/png',
                    )),
                );
            }

            return result;
        }

        this.log(title, '🪄');
        const response = await this.client.chat.completions.create({
            messages: [
                {
                    content: [
                        {
                            text: this.config.llm.prompt,
                            type: 'text',
                        },
                    ],
                    role: 'developer',
                },
                {
                    content: [
                        {
                            image_url: {
                                url: `data:${mimeType};base64,${data.toString('base64')}`,
                            },
                            type: 'image_url',
                        },
                    ],
                    role: 'user',
                },
            ],
            model: this.config.llm.model,
            response_format: zodResponseFormat(Recipe, 'recipe'),
        });

        const choice = response.choices[0];
        if (!choice.message || !choice.message.content) {
            throw new Error(
                `Invalid response from LLM for file: ${title} (mime = ${mimeType}, length = ${data.length})`,
            );
        }

        let json;
        try {
            json = JSON.parse(choice.message.content);
        } catch (error) {
            throw new Error(
                `Failed to parse LLM response for file: ${title} (mime = ${mimeType}, length = ${data.length}): ${(error as Error).message}`,
            );
        }

        const recipe = Recipe.parse(json);
        this.log(title, true);
        return [recipe];
    }

    protected async convertFile(file: string): Promise<RecipeType[]> {
        const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
        const mimeType = mimeTypes.get(ext);
        if (mimeType) {
            return this.convertBuffer(file, await readFile(file), mimeType);
        }

        throw new Error(`Unsupported file format for file: ${file}`);
    }

    protected async convertFiles(files: string[] = []) {
        if (!files.length) {
            throw new Error('No input files specified for conversion.');
        }

        // Check all files exist
        for (const file of files) {
            if (!existsSync(file)) {
                throw new Error(`Unable to find file: ${file}`);
            }
        }

        // Convert files one by one
        const recipes: RecipeType[] = [];
        for (const file of files) {
            recipes.push(...(await this.convertFile(file)));
        }

        return recipes;
    }

    protected log(file: string, emojiOrDone: string | true) {
        const emoji = emojiOrDone === true ? '✅' : emojiOrDone;
        this.options.stdout?.write(
            `\r${emoji} ${file}${emojiOrDone === true ? '\n' : ''}`,
        );
    }
}
