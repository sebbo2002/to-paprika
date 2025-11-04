#!/usr/bin/env node
'use strict';

import express, { type Express } from 'express';
import { Server } from 'http';

import { Config } from '../lib/config.js';
import { Converter } from '../lib/convert.js';

class AppServer {
    private app: Express;
    private server: Server;

    constructor() {
        this.app = express();
        this.app.use(
            express.raw({
                limit: '50mb',
                type: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
            }),
        );

        this.setupRoutes();
        this.server = this.app.listen(process.env.PORT || 8080);

        process.on('SIGINT', () => this.stop());
        process.on('SIGTERM', () => this.stop());
    }

    static run() {
        new AppServer();
    }

    setupRoutes() {
        this.app.get('/ping', (req, res) => {
            res.send('pong');
        });

        let authToken: null | string = null;
        Config.use().then((config) => {
            authToken = config.server.authToken || null;
        });

        this.app.post('/convert', (req, res) => {
            const authTokenHeader = req.headers['authorization'] || '';
            if (authToken && authTokenHeader !== `Bearer ${authToken}`) {
                res.sendStatus(401);
                return;
            }

            const contentType = req.headers['content-type'] || '';
            Converter.convert(Buffer.from(req.body), contentType)
                .then((response: Buffer) => {
                    res.setHeader('Content-Type', 'application/octet-stream');
                    res.setHeader('Content-Length', response.byteLength);
                    res.setHeader(
                        'Content-Disposition',
                        'attachment; filename="recipes.paprikarecipes"',
                    );
                    res.send(response);
                })
                .catch((error) => {
                    console.error(error);
                    res.sendStatus(500);
                });
        });

        // add additional routes
    }

    async stop() {
        await new Promise((cb) => this.server.close(cb));

        // await db.close() if we have a db connection in this app
        // await other things we should cleanup nicely

        process.exit();
    }
}

AppServer.run();
