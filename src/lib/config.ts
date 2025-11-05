import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import prompts from 'prompts';

export interface ConfigContent {
    llm: {
        apiKey: string;
        baseUrl: string;
        model: string;
    };
    output: string;
    server: {
        authToken?: string;
    };
}

export class Config {
    static get path() {
        if (process.env.TO_PAPRIKA_CONFIG_PATH) {
            return resolve(process.env.TO_PAPRIKA_CONFIG_PATH);
        }

        return join(this.homePath, '.to-paprika.config.json');
    }
    protected static get homePath() {
        if (process.platform === 'win32' && process.env.USERPROFILE) {
            return process.env.USERPROFILE;
        }
        if (process.platform !== 'win32' && process.env.HOME) {
            return process.env.HOME;
        }

        throw new Error(
            'Cannot determine home directory, please set the TO_PAPRIKA_CONFIG_PATH environment variable.',
        );
    }

    get llm(): ConfigContent['llm'] & { prompt: string } {
        return {
            ...this.config.llm,
            prompt:
                process.env.TO_PAPRIKA_CONFIG_PROMPT ||
                'You digitize recipes. Please recognize the recipe sent in the attachment and respond with a precise and complete JSON. This includes all original information such as the title, ingredients, preparation times, cooking steps, or notes. If the title is in all caps, it will be adjusted for better readability. If the source is available, such as the book title (possibly with page number) or the URL, this will also be included. Ensure that the JSON is properly formatted and valid. If any field is missing in the input, use undefined or an empty array as appropriate.',
        };
    }
    get output() {
        return this.config.output;
    }
    get server(): ConfigContent['server'] {
        return this.config.server;
    }

    constructor(private readonly config: ConfigContent) {}

    static async getJson() {
        if (!existsSync(this.path)) {
            throw new Error(
                `Config file not found at ${this.path}. Run 'to-paprika setup' to create one.`,
            );
        }

        let content: string | undefined;
        try {
            content = await readFile(this.path, 'utf8');
        } catch (err) {
            throw new Error(
                `Failed to read config file at ${this.path}: ${(err as Error).message}`,
            );
        }

        let json: ConfigContent;
        try {
            json = JSON.parse(content) as ConfigContent;
        } catch (err) {
            throw new Error(
                `Failed to parse config file at ${this.path}: ${(err as Error).message}`,
            );
        }

        return json;
    }

    static async setup() {
        console.log('\n👋🏼 Hi there');
        console.log('');

        let json: ConfigContent | undefined = undefined;
        try {
            json = await this.getJson();
        } catch {
            // ignore errors
        }

        console.log(
            '🌥️  to-paprica requires an OpenAI-compatible LLM provider to function.',
        );
        console.log('   Please provide the following provider details:');
        console.log('');

        const llm = await prompts([
            {
                initial: json?.llm.baseUrl,
                message: ' LLM Provider Base URL:',
                name: 'baseUrl',
                type: 'text',
                validate: (value) => {
                    try {
                        new URL(value);
                        return true;
                    } catch {
                        return 'Invalid Base URL';
                    }
                },
            },
            {
                initial: json?.llm.apiKey,
                message: ' LLM Provider API Key:',
                name: 'apiKey',
                type: 'password',
                validate: (value) =>
                    value.length > 0 ? true : 'API Key cannot be empty',
            },
            {
                initial: json?.llm.model,
                message: ' LLM Model to use:',
                name: 'model',
                type: 'text',
                validate: (value) =>
                    value.length > 0 ? true : 'Model cannot be empty',
            },
        ]);

        console.log('');
        console.log(
            '📂 Next, please specify the output directory for your Paprika recipes.',
        );
        console.log('   This is where all converted recipes will be saved.');
        console.log('');

        const output = await prompts({
            initial: json?.output || resolve(process.cwd()),
            message: ' Output Directory:',
            name: 'output',
            type: 'text',
            validate: (value) => existsSync(value),
        });

        const config: ConfigContent = {
            llm,
            output: output.output,
            server: {
                authToken: json?.server?.authToken,
            },
        };
        if (!config.server.authToken) {
            config.server.authToken = randomBytes(32).toString('hex');
        }

        console.log('');
        console.log(
            '🔒 Great. Just in case you would like to use the build-in server,',
        );
        console.log(
            '   please use this API Token to authenticate your requests:\n',
        );
        console.log(`   ${config.server.authToken}`);
        console.log('');

        try {
            await writeFile(this.path, JSON.stringify(config, null, 2));
        } catch (error) {
            console.log('🚨 Failed to save config file');
            console.log('');
            throw new Error(
                `Failed to write config file at ${this.path}: ${(error as Error).message}`,
            );
        }

        console.log('');
        console.log('🎉 Config file saved successfully');
        console.log('');
    }

    static async use() {
        const json = await this.getJson();
        return new Config(json);
    }
}
