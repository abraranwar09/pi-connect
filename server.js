const express = require('express');
const { spawn } = require('child_process');
const pty = require('node-pty');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();



const app = express();
app.use(express.json());
app.use(cors());

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

let pythonSession = null;
let interactiveSession = null;
let sessionOutputBuffer = '';

app.post('/api/run-command', (req, res) => {
    const { command, args } = req.body;

    console.log(command, args);
    

    if (!command) {
        return res.status(400).send('Command is required');
    }

    console.log(`Executing command: ${command}`);
    if (args) {
        console.log(`With arguments: ${args.join(' ')}`);
    }

    // Use 'bash' to execute the command
    const child = spawn('bash', ['-c', `${command} ${args ? args.join(' ') : ''}`]);
    let output = '';

    child.stdout.on('data', (data) => {
        const dataStr = data.toString();
        output += dataStr;
        console.log(`stdout: ${dataStr}`);
    });

    child.stderr.on('data', (data) => {
        const dataStr = data.toString();
        output += dataStr;
        console.log(`stderr: ${dataStr}`);
    });

    child.on('close', (code) => {
        console.log(`Command finished with exit code: ${code}`);
        res.send({ output, code });
    });
});

app.post('/api/start-session', (req, res) => {
    const { command } = req.body;

    if (!command) {
        return res.status(400).send('Command is required');
    }

    // Start a new session using pty
    pythonSession = pty.spawn(command, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    pythonSession.on('data', (data) => {
        console.log(`Session output: ${data}`);
    });

    res.send('Session started');
});

app.post('/api/send-command', (req, res) => {
    const { command } = req.body;

    if (!pythonSession) {
        return res.status(400).send('No active session');
    }

    pythonSession.write(`${command}\n`);
    res.send('Command sent');
});

app.post('/api/start-interactive-session', (req, res) => {
    const { command, args, activateVenv } = req.body;

    if (!command) {
        return res.status(400).send('Command is required');
    }

    let fullCommand = command;
    if (activateVenv) {
        fullCommand = `source ${activateVenv} && ${command}`;
    }

    interactiveSession = pty.spawn('bash', ['-c', `${fullCommand} ${args ? args.join(' ') : ''}`], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    interactiveSession.on('data', (data) => {
        sessionOutputBuffer += data;
        console.log(`Session output: ${data}`);
    });

    res.send('Interactive session started');
});

app.post('/api/send-to-session', (req, res) => {
    const { input } = req.body;

    if (!interactiveSession) {
        return res.status(400).send('No active session');
    }

    sessionOutputBuffer = '';
    interactiveSession.write(`${input}\n`);

    setTimeout(() => {
        res.send({ output: sessionOutputBuffer });
    }, 10000);
});

app.post('/api/stop-session', (req, res) => {
    if (!interactiveSession) {
        return res.status(400).send('No active session');
    }

    interactiveSession.kill();
    interactiveSession = null;
    sessionOutputBuffer = '';
    res.send('Session stopped');
});

app.post('/api/computer-control', async (req, res) => {
    const { command } = req.body;

    if (!command) {
        return res.status(400).send('Command is required');
    }

    try {
        // Validate command through Claude first
        // const validationResult = await validateCommand(command);
        // if (!validationResult.safe) {
        //     throw new Error('Command validation failed: Potentially unsafe operation');
        // }

        // Execute the validated command through Claude's computer use API
        const execution = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1024,
            system: "You are a computer control assistant. Execute commands safely and report results clearly.",
            messages: [{
                role: 'user',
                content: `Execute this command and report the results: ${command}`
            }],
            
        });

        const result = execution.content[0].text;
        res.send({ result });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing the command');
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});