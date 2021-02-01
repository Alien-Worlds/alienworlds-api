module.exports = {
    apps: [
        {
            name: "alienworlds-filler",
            script: "./dist/filler.js",
            node_args: ["--max-old-space-size=8192"],
            autorestart: true,
            kill_timeout: 3600
        },
        {
            name: "alienworlds-processor",
            script: "./dist/processor.js",
            node_args: ["--max-old-space-size=8192"],
            autorestart: true,
            kill_timeout: 3600
        },
        {
            name: "alienworlds-api",
            script: "./dist/api.js",
            node_args: ["--max-old-space-size=8192"],
            autorestart: true,
            kill_timeout: 3600
        }
    ]
};
