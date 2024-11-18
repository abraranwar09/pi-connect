# Command Execution Server

This project is a Node.js server application that allows for the execution of shell commands and management of interactive sessions via HTTP API endpoints. It uses Express.js for handling HTTP requests, `node-pty` for managing pseudo-terminal sessions, and integrates with Anthropic's API for command validation and execution.

## Features

- **Run Shell Commands**: Execute shell commands directly from an HTTP request.
- **Interactive Sessions**: Start and manage interactive shell sessions.
- **Command Validation**: Validate commands using Anthropic's API to ensure safe execution.
- **CORS Support**: Cross-Origin Resource Sharing is enabled for API access.

## Prerequisites

- Node.js (v14 or later)
- npm (Node Package Manager)
- An API key for Anthropic's SDK

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/command-execution-server.git
   cd command-execution-server
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Anthropic API key:

   ```plaintext
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## Usage

1. Start the server:

   ```bash
   npm start
   ```

2. The server will run on the port specified in your `.env` file or default to `3001`.

3. Use the following API endpoints to interact with the server:

   - **POST** `/api/run-command`: Execute a shell command.
   - **POST** `/api/start-interactive-session`: Start an interactive shell session.
   - **POST** `/api/send-to-session`: Send input to an active interactive session.
   - **POST** `/api/stop-session`: Stop the current interactive session.
   - **POST** `/api/computer-control`: Validate and execute a command using Anthropic's API.

## API Endpoints

### Run Command

- **Endpoint**: `/api/run-command`
- **Method**: POST
- **Body**: `{ "command": "your_command", "args": ["arg1", "arg2"] }`
- **Response**: `{ "output": "command_output", "code": exit_code }`

### Start Interactive Session

- **Endpoint**: `/api/start-interactive-session`
- **Method**: POST
- **Body**: `{ "command": "your_command", "args": ["arg1", "arg2"], "activateVenv": "path_to_venv" }`
- **Response**: `Interactive session started`

### Send to Session

- **Endpoint**: `/api/send-to-session`
- **Method**: POST
- **Body**: `{ "input": "your_input" }`
- **Response**: `{ "output": "session_output" }`

### Stop Session

- **Endpoint**: `/api/stop-session`
- **Method**: POST
- **Response**: `Session stopped`

### Computer Control

- **Endpoint**: `/api/computer-control`
- **Method**: POST
- **Body**: `{ "command": "your_command" }`
- **Response**: `{ "result": "execution_result" }`

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

