
const Amqp = require('amqplib');

export class Amq {
    logger: any;
    channel: any;
    initialized: Boolean;
    connection_errors: number;
    max_connection_errors: number;
    listeners: any;
    config: any;

    constructor(config){
        this.config = config;
        this.initialized = false;
        this.listeners = [];
        this.connection_errors = 0;
        this.max_connection_errors = 5;

        // this.logger = require('./logger')('eosdac-amq', config.logger);
        this.logger = console;
    }

    async reconnect(){
        if (this.listeners.length && !this.initialized){
            this.logger.info(`Reloading connection with listeners`);

            try {
                await this.init();
            }
            catch (e){
                this.connection_errors++;

                const retry_ms = Math.pow(this.connection_errors, 2) * 1000;
                const log_fn = (this.connection_errors > this.max_connection_errors)?this.logger.error:this.logger.warn;
                log_fn(`${this.connection_errors.toString()} failed connection attempts, retrying in ${Math.floor(retry_ms/1000).toString()}s`, {connection_errors:this.connection_errors});

                setTimeout(() => this.reconnect(), retry_ms);

                return;
            }

            this.logger.info(`Adding listeners`);
            this.listeners.forEach(({queue_name, cb}) => {
                this.listen(queue_name, cb);
            });
        }
    }

    async init(){
        const conn = await Amqp.connect(this.config.connection_string);

        this.logger.info(`Connected to ${this.config.connection_string}`);


        const channel = await conn.createConfirmChannel();


        // channel.assertQueue('block_range', {durable: true});
        // channel.assertQueue('contract_row', {durable: true});
        // channel.assertQueue('permission_link', {durable: true});
        // channel.assertQueue('trace', {durable: true});
        channel.assertQueue('action', {durable: true});
        channel.assertQueue('aw_block_range', {durable: true});
        channel.assertQueue('recalc_asset', {durable: true});

        this.channel = channel;
        this.initialized = true;
        this.connection_errors = 0;

        conn.on('error', (err) => {
            if (err.message !== 'Connection closing') {
                const log_fn = (this.connection_errors > this.max_connection_errors)?this.logger.error:this.logger.warn;

                log_fn('Connection Error', {e:err});
                this.initialized = false;
                this.reconnect();
            }
        });
        conn.on('close', () => {
            this.logger.warn('Connection closed');
            this.initialized = false;
            this.reconnect();
        });
    }

    async send(queue_name, msg) {
        return new Promise((resolve, reject) => {
            if (!Buffer.isBuffer(msg)) {
                msg = Buffer.from(msg)
            }

            const return_fn = (err, ok) => {
                if (err !== null)
                    reject(err);
                else
                    resolve(ok);
            };

            if (!this.initialized){
                this.init().then(i => {
                    this.channel.sendToQueue(queue_name, msg, {}, return_fn);
                });
            }
            else {
                this.channel.sendToQueue(queue_name, msg, {}, return_fn);
            }
        });
    }

    async listen(queue_name, cb) {
        if (!this.initialized){
            await this.init();
        }

        this.channel.prefetch(1);
        // await this.channel.assertQueue(queue_name, {durable: true})
        this.listeners.push({queue_name, cb});

        this.channel.consume(queue_name, cb, {noAck: false})
    }

    async ack(job) {
        if (!this.initialized){
            await this.init();
        }
        try {
            return this.channel.ack(job);
        }
        catch (e){
            this.logger.error(`Failed to ack job`, e);
            // failure to ack isnt a problem, all jobs are idempotent
        }
    }

    async reject(job) {
        if (!this.initialized){
            await this.init();
        }
        try {
            return this.channel.reject(job, true);
        }
        catch (e){
            this.logger.error(`Failed to reject job`);
        }
    }
}

