module.exports = {
    name: "spendenr-ai-d",
    cwd: ".",
    script: "src/app.js",
    // exec_mode: "cluster",
    // instances: 5,
    repo: "https://github.com/NullDev/Spendenr-AI-d.git",
    ref: "origin/ocr-only",
    interpreter: "bun",
    env: {
        NODE_ENV: "production",
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
    },
};
