'use strict';

const EventEmitter = require('events');
const Toys = require('toys');
const Apostrophe = require('apostrophe');

exports.plugin = {
    name: 'trophy',
    async register(server, { apostrophe }) {

        const ee = new EventEmitter();

        const apos = Apostrophe({
            ...apostrophe,
            modules: {
                ...(apostrophe.modules || {}),
                'pal-trophy': {
                    construct(self, options) {

                        self.afterInit = (cb) => ee.emit('ready') && cb();
                        self.initFailed = (err) => ee.emit('error', err);
                    }
                },
                'apostrophe-express': {
                    construct(self, options) {

                        self.addListenMethod = () => {

                            self.apos.listen = () => null;
                        };
                    }
                }
            }
        });

        await Toys.event(ee, 'ready');

        server.decorate('server', 'apos', apos);
        server.decorate('request', 'apos', apos);
        server.decorate('toolkit', 'apos', apos);
    }
};
