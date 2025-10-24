#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Helper function to print colored text
function colorLog(text, color = 'white') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

// Helper function to read environment variables
function getEnvValue(key, filePath = '.env') {
  try {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return match ? match[1].trim() : null;
  } catch (error) {
    return null;
  }
}

// Get project name from docker-compose or default
function getProjectName() {
  return 'fastapi-reactjs-crud';
}

// Helper function to run commands
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: process.cwd(),
      ...options
    });
    return result ? result.toString() : '';
  } catch (error) {
    if (!options.silent) {
      colorLog(`Error executing command: ${command}`, 'red');
      colorLog(error.message, 'red');
    }
    throw error;
  }
}

// Helper function to run commands with live output
function runCommandLive(command, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: 'inherit',
      cwd: options.cwd || process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

// Check if Docker is available
function checkDocker() {
  try {
    runCommand('docker --version', { silent: true });
    runCommand('docker compose version', { silent: true });
    return true;
  } catch (error) {
    colorLog('❌ Docker or Docker Compose is not installed or not running.', 'red');
    colorLog('Please install Docker Desktop and make sure it\'s running.', 'yellow');
    colorLog('💡 Download from: https://www.docker.com/products/docker-desktop', 'cyan');
    return false;
  }
}

// Check if Python is available
function checkPython() {
  try {
    const version = runCommand('python3 --version', { silent: true }).trim();
    return version;
  } catch (error) {
    try {
      const version = runCommand('python --version', { silent: true }).trim();
      return version;
    } catch (error2) {
      return null;
    }
  }
}

// Get Python command (python3 or python)
function getPythonCommand() {
  try {
    runCommand('python3 --version', { silent: true });
    return 'python3';
  } catch (error) {
    return 'python';
  }
}

// Check if Node.js is available
function checkNode() {
  try {
    const version = runCommand('node --version', { silent: true }).trim();
    return version;
  } catch (error) {
    return null;
  }
}

// Check if backend virtual environment exists
function checkBackendVenv() {
  return fs.existsSync(path.join(process.cwd(), 'backend', 'venv'));
}

// Docker command
function getDockerCommand() {
  return 'docker compose';
}

// Check if services are healthy
function checkServicesHealth() {
  try {
    const result = runCommand(`${getDockerCommand()} ps --format "{{.Names}}\t{{.Status}}"`, { silent: true });
    const lines = result.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      colorLog('\n📊 No services running', 'yellow');
      return;
    }
    
    colorLog('\n📊 Service Status:', 'cyan');
    lines.forEach(line => {
      const [name, status] = line.split('\t');
      if (status && status.includes('Up')) {
        colorLog(`  ✅ ${name}: ${status}`, 'green');
      } else if (status) {
        colorLog(`  ❌ ${name}: ${status}`, 'red');
      }
    });
  } catch (error) {
    colorLog('Could not check service status', 'yellow');
  }
}

// Application commands
const appCommands = {
  'setup': {
    description: 'Complete setup (database + backend + frontend)',
    action: async () => {
      colorLog('⚡ Setting up FastAPI + React CRUD Application...', 'magenta');
      colorLog('═'.repeat(60), 'cyan');

      // Check prerequisites
      const pythonVersion = checkPython();
      const nodeVersion = checkNode();
      
      if (!pythonVersion) {
        colorLog('\n❌ Python 3.11+ is required but not found', 'red');
        colorLog('💡 Install from: https://www.python.org/downloads/', 'yellow');
        return;
      }
      colorLog(`\n✅ Found ${pythonVersion}`, 'green');

      if (!nodeVersion) {
        colorLog('❌ Node.js 18+ is required but not found', 'red');
        colorLog('💡 Install from: https://nodejs.org/', 'yellow');
        return;
      }
      colorLog(`✅ Found ${nodeVersion}`, 'green');

      colorLog('\n1️⃣ Starting database...', 'cyan');
      runCommand(`${getDockerCommand()} up -d db`);
      colorLog('   ⏳ Waiting for database to be ready...', 'white');
      await new Promise(resolve => setTimeout(resolve, 5000));
      colorLog('   ✅ Database started', 'green');

      colorLog('\n2️⃣ Setting up backend...', 'cyan');
      await appCommands['backend-setup'].action();

      colorLog('\n3️⃣ Installing frontend dependencies...', 'cyan');
      const frontendPath = path.join(process.cwd(), 'frontend');
      if (!fs.existsSync(path.join(frontendPath, 'node_modules'))) {
        runCommand('npm install', { cwd: frontendPath });
        colorLog('   ✅ Frontend dependencies installed', 'green');
      } else {
        colorLog('   ✅ Frontend dependencies already installed', 'green');
      }

      colorLog('\n✅ Setup complete!', 'green');
      colorLog('═'.repeat(60), 'cyan');
      showUrls();
      colorLog('\n📝 Next steps:', 'cyan');
      colorLog('   1. Start backend:  node setup.js backend', 'white');
      colorLog('   2. Start frontend: node setup.js frontend', 'white');
      colorLog('   Or use Docker:     node setup.js docker', 'white');
    }
  },

  'backend-setup': {
    description: 'Setup backend (create venv, install dependencies)',
    action: async () => {
      const backendPath = path.join(process.cwd(), 'backend');
      const venvPath = path.join(backendPath, 'venv');
      const pythonCmd = getPythonCommand();

      colorLog('🔧 Setting up backend...', 'magenta');

      // Check if venv exists
      if (!fs.existsSync(venvPath)) {
        colorLog('\n1️⃣ Creating virtual environment...', 'cyan');
        runCommand(`${pythonCmd} -m venv venv`, { cwd: backendPath });
        colorLog('   ✅ Virtual environment created', 'green');
      } else {
        colorLog('\n✅ Virtual environment already exists', 'green');
      }

      // Determine pip command based on OS
      const isWindows = process.platform === 'win32';
      const pipCmd = isWindows 
        ? path.join('venv', 'Scripts', 'pip')
        : path.join('venv', 'bin', 'pip');

      colorLog('\n2️⃣ Installing Python dependencies...', 'cyan');
      runCommand(`${pipCmd} install --upgrade pip`, { cwd: backendPath, silent: true });
      runCommand(`${pipCmd} install -r requirements.txt`, { cwd: backendPath });
      colorLog('   ✅ Dependencies installed', 'green');

      // Check if database is running
      try {
        const result = runCommand(`${getDockerCommand()} ps`, { silent: true });
        if (!result.includes('postgres_db') || !result.includes('Up')) {
          colorLog('\n⚠️  Database is not running. Starting now...', 'yellow');
          runCommand(`${getDockerCommand()} up -d db`);
          colorLog('   ⏳ Waiting for database to be ready...', 'cyan');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error) {
        colorLog('\n⚠️  Could not check database status', 'yellow');
      }

      colorLog('\n✅ Backend setup complete!', 'green');
      colorLog('🚀 Start backend with: node setup.js backend', 'cyan');
    }
  },

  'backend': {
    description: 'Start backend server (local Python)',
    action: async () => {
      if (!checkBackendVenv()) {
        colorLog('❌ Backend virtual environment not found', 'red');
        colorLog('💡 Run: node setup.js backend-setup', 'yellow');
        return;
      }

      const backendPath = path.join(process.cwd(), 'backend');
      const isWindows = process.platform === 'win32';
      const uvicornCmd = isWindows
        ? path.join('venv', 'Scripts', 'uvicorn')
        : path.join('venv', 'bin', 'uvicorn');

      colorLog('🚀 Starting FastAPI backend server...', 'cyan');
      colorLog('═'.repeat(60), 'cyan');
      colorLog('📍 Location: ./backend', 'white');
      colorLog('🌐 API: http://localhost:8000', 'blue');
      colorLog('📖 Docs: http://localhost:8000/docs', 'blue');
      colorLog('📋 ReDoc: http://localhost:8000/redoc', 'blue');
      colorLog('═'.repeat(60), 'cyan');
      colorLog('💡 Press Ctrl+C to stop the server', 'yellow');
      colorLog('', 'white');

      await runCommandLive(`${uvicornCmd} main:app --reload --host 0.0.0.0 --port 8000`, { cwd: backendPath });
    }
  },

  'backend-install': {
    description: 'Install backend dependencies only',
    action: () => {
      if (!checkBackendVenv()) {
        colorLog('❌ Backend virtual environment not found', 'red');
        colorLog('💡 Run: node setup.js backend-setup', 'yellow');
        return;
      }

      const backendPath = path.join(process.cwd(), 'backend');
      const isWindows = process.platform === 'win32';
      const pipCmd = isWindows
        ? path.join('venv', 'Scripts', 'pip')
        : path.join('venv', 'bin', 'pip');

      colorLog('📦 Installing backend dependencies...', 'cyan');
      runCommand(`${pipCmd} install -r requirements.txt`, { cwd: backendPath });
      colorLog('✅ Backend dependencies installed', 'green');
    }
  },

  'frontend': {
    description: 'Start frontend development server (local)',
    action: async () => {
      colorLog('🎨 Starting React frontend development server...', 'cyan');
      colorLog('═'.repeat(60), 'cyan');
      colorLog('📍 Location: ./frontend', 'white');
      colorLog('🌐 URL: http://localhost:3000', 'blue');
      colorLog('═'.repeat(60), 'cyan');
      
      // Check if node_modules exists
      const frontendPath = path.join(process.cwd(), 'frontend');
      const nodeModulesPath = path.join(frontendPath, 'node_modules');
      
      if (!fs.existsSync(nodeModulesPath)) {
        colorLog('📦 Installing frontend dependencies...', 'yellow');
        runCommand('npm install', { cwd: frontendPath });
        colorLog('✅ Dependencies installed', 'green');
        colorLog('', 'white');
      }
      
      colorLog('💡 Press Ctrl+C to stop the server', 'yellow');
      colorLog('', 'white');
      
      await runCommandLive('npm start', { cwd: frontendPath });
    }
  },

  'frontend-install': {
    description: 'Install frontend dependencies',
    action: () => {
      colorLog('📦 Installing frontend dependencies...', 'cyan');
      const frontendPath = path.join(process.cwd(), 'frontend');
      runCommand('npm install', { cwd: frontendPath });
      colorLog('✅ Frontend dependencies installed', 'green');
    }
  },

  'frontend-build': {
    description: 'Build frontend for production',
    action: () => {
      colorLog('🏗️  Building frontend for production...', 'cyan');
      const frontendPath = path.join(process.cwd(), 'frontend');
      runCommand('npm run build', { cwd: frontendPath });
      colorLog('✅ Frontend built successfully!', 'green');
      colorLog('📁 Output: frontend/build', 'white');
    }
  },

  'docker': {
    description: 'Start all services with Docker Compose',
    action: async () => {
      colorLog('🐳 Starting all services with Docker...', 'cyan');
      colorLog('═'.repeat(60), 'cyan');
      
      runCommand(`${getDockerCommand()} up -d`);
      
      colorLog('\n⏳ Waiting for services to start...', 'white');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      checkServicesHealth();
      showUrls();
      
      colorLog('\n💡 View logs with: node setup.js logs', 'cyan');
    }
  },

  'docker-build': {
    description: 'Build and start all services with Docker Compose',
    action: async () => {
      colorLog('🏗️  Building and starting all services...', 'cyan');
      colorLog('═'.repeat(60), 'cyan');
      
      await runCommandLive(`${getDockerCommand()} up --build -d`);
      
      colorLog('\n⏳ Waiting for services to start...', 'white');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      checkServicesHealth();
      showUrls();
    }
  },

  'up': {
    description: 'Start all Docker services',
    action: async () => {
      colorLog('🚀 Starting all services...', 'cyan');
      runCommand(`${getDockerCommand()} up -d`);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      checkServicesHealth();
      showUrls();
    }
  },

  'down': {
    description: 'Stop all Docker services',
    action: () => {
      colorLog('🛑 Stopping all services...', 'yellow');
      runCommand(`${getDockerCommand()} down`);
      colorLog('✅ Services stopped', 'green');
    }
  },

  'restart': {
    description: 'Restart all Docker services',
    action: async () => {
      colorLog('🔄 Restarting all services...', 'cyan');
      runCommand(`${getDockerCommand()} restart`);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      checkServicesHealth();
      showUrls();
    }
  },

  'logs': {
    description: 'View live logs from all services',
    action: async () => {
      colorLog('📋 Viewing logs (Ctrl+C to exit)...', 'cyan');
      await runCommandLive(`${getDockerCommand()} logs -f`);
    }
  },

  'logs-backend': {
    description: 'View backend logs only',
    action: async () => {
      colorLog('📋 Viewing backend logs (Ctrl+C to exit)...', 'cyan');
      await runCommandLive(`${getDockerCommand()} logs -f backend`);
    }
  },

  'logs-frontend': {
    description: 'View frontend logs only',
    action: async () => {
      colorLog('📋 Viewing frontend logs (Ctrl+C to exit)...', 'cyan');
      await runCommandLive(`${getDockerCommand()} logs -f frontend`);
    }
  },

  'logs-db': {
    description: 'View database logs only',
    action: async () => {
      colorLog('📋 Viewing database logs (Ctrl+C to exit)...', 'cyan');
      await runCommandLive(`${getDockerCommand()} logs -f db`);
    }
  },

  'status': {
    description: 'Show container status',
    action: () => {
      colorLog('📊 Container status:', 'cyan');
      checkServicesHealth();
    }
  },

  'ps': {
    description: 'List running containers',
    action: () => {
      runCommand(`${getDockerCommand()} ps`);
    }
  },

  'shell-db': {
    description: 'Open PostgreSQL shell',
    action: async () => {
      colorLog('🐚 Opening PostgreSQL shell...', 'cyan');
      await runCommandLive(`${getDockerCommand()} exec -it postgres_db psql -U admin -d crudapp`);
    }
  },

  'shell-backend': {
    description: 'Open Python shell in backend container',
    action: async () => {
      colorLog('🐚 Opening Python shell in backend container...', 'cyan');
      await runCommandLive(`${getDockerCommand()} exec -it fastapi_backend python`);
    }
  },

  'backend-shell': {
    description: 'Open Python shell with backend context (local)',
    action: async () => {
      if (!checkBackendVenv()) {
        colorLog('❌ Backend virtual environment not found', 'red');
        colorLog('💡 Run: node setup.js backend-setup', 'yellow');
        return;
      }

      const backendPath = path.join(process.cwd(), 'backend');
      const isWindows = process.platform === 'win32';
      const pythonCmd = isWindows
        ? path.join('venv', 'Scripts', 'python')
        : path.join('venv', 'bin', 'python');

      colorLog('🐚 Opening Python shell...', 'cyan');
      await runCommandLive(`${pythonCmd}`, { cwd: backendPath });
    }
  },

  'clean': {
    description: 'Clean up containers, volumes, and images',
    action: () => {
      colorLog('🧹 Cleaning Docker environment...', 'yellow');
      colorLog('═'.repeat(60), 'cyan');

      colorLog('1️⃣ Stopping and removing containers...', 'white');
      runCommand(`${getDockerCommand()} down -v --remove-orphans`);

      colorLog('2️⃣ Removing unused images...', 'white');
      try {
        runCommand('docker image prune -f');
      } catch (error) {
        colorLog('   Some images could not be removed', 'yellow');
      }

      colorLog('3️⃣ Removing unused volumes...', 'white');
      try {
        runCommand('docker volume prune -f');
      } catch (error) {
        colorLog('   Some volumes could not be removed', 'yellow');
      }

      colorLog('✅ Environment cleaned', 'green');
    }
  },

  'reset': {
    description: 'Reset database (remove volume and restart)',
    action: async () => {
      colorLog('⚠️  WARNING: This will DELETE ALL DATA!', 'red');
      colorLog('Press Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      colorLog('\n🔄 Resetting database...', 'magenta');
      
      colorLog('\n1️⃣ Stopping services...', 'cyan');
      runCommand(`${getDockerCommand()} down -v`);
      colorLog('   ✅ Services stopped and volumes removed', 'green');
      
      colorLog('\n2️⃣ Starting database...', 'cyan');
      runCommand(`${getDockerCommand()} up -d db`);
      colorLog('   ✅ Database started with fresh data', 'green');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      checkServicesHealth();
      
      colorLog('\n✅ Database reset complete!', 'green');
    }
  },

  'test-backend': {
    description: 'Run backend tests',
    action: async () => {
      if (!checkBackendVenv()) {
        colorLog('❌ Backend virtual environment not found', 'red');
        colorLog('💡 Run: node setup.js backend-setup', 'yellow');
        return;
      }

      const backendPath = path.join(process.cwd(), 'backend');
      const isWindows = process.platform === 'win32';
      const pytestCmd = isWindows
        ? path.join('venv', 'Scripts', 'pytest')
        : path.join('venv', 'bin', 'pytest');

      colorLog('🧪 Running backend tests...', 'cyan');
      try {
        await runCommandLive(`${pytestCmd}`, { cwd: backendPath });
        colorLog('✅ Tests completed', 'green');
      } catch (error) {
        colorLog('❌ Tests failed', 'red');
      }
    }
  },

  'test-frontend': {
    description: 'Run frontend tests',
    action: async () => {
      const frontendPath = path.join(process.cwd(), 'frontend');
      
      colorLog('🧪 Running frontend tests...', 'cyan');
      try {
        await runCommandLive('npm test', { cwd: frontendPath });
        colorLog('✅ Tests completed', 'green');
      } catch (error) {
        colorLog('❌ Tests failed', 'red');
      }
    }
  },

  'dev': {
    description: 'Instructions for running both backend and frontend',
    action: () => {
      colorLog('\n💡 To run both backend and frontend locally:', 'cyan');
      colorLog('═'.repeat(60), 'cyan');
      colorLog('\n📝 Option 1 - Two Terminals:', 'yellow');
      colorLog('   Terminal 1: node setup.js backend', 'white');
      colorLog('   Terminal 2: node setup.js frontend', 'white');
      colorLog('\n📝 Option 2 - Docker (Recommended):', 'yellow');
      colorLog('   node setup.js docker', 'white');
      colorLog('\n📝 Option 3 - Docker with rebuild:', 'yellow');
      colorLog('   node setup.js docker-build', 'white');
      showUrls();
    }
  }
};

function showUrls() {
  colorLog('\n🔗 Application URLs:', 'cyan');
  colorLog('═'.repeat(60), 'cyan');
  colorLog('🌐 Frontend:     http://localhost:3000', 'blue');
  colorLog('🔧 Backend API:  http://localhost:8000', 'blue');
  colorLog('📖 API Docs:     http://localhost:8000/docs', 'blue');
  colorLog('📋 ReDoc:        http://localhost:8000/redoc', 'blue');
  colorLog('🗄️  Database:     localhost:5432 (PostgreSQL)', 'blue');
  colorLog('═'.repeat(60), 'cyan');
}

function showHelp() {
  colorLog('\n🚀 FastAPI + React CRUD Application Setup', 'cyan');
  colorLog('═'.repeat(60), 'cyan');

  colorLog('\n📦 Initial Setup:', 'yellow');
  colorLog('  setup              - Complete setup (database + backend + frontend)', 'white');
  colorLog('  backend-setup      - Setup backend only (venv, dependencies)', 'white');

  colorLog('\n🎮 Development (Local):', 'yellow');
  colorLog('  backend            - Start backend server (Python/FastAPI)', 'white');
  colorLog('  frontend           - Start frontend dev server (React)', 'white');
  colorLog('  dev                - Instructions for running both', 'white');

  colorLog('\n🐳 Docker Commands:', 'yellow');
  colorLog('  docker             - Start all services with Docker', 'white');
  colorLog('  docker-build       - Build and start all services', 'white');
  colorLog('  up                 - Start all Docker services', 'white');
  colorLog('  down               - Stop all Docker services', 'white');
  colorLog('  restart            - Restart all Docker services', 'white');

  colorLog('\n📦 Dependencies:', 'yellow');
  colorLog('  backend-install    - Install backend Python packages', 'white');
  colorLog('  frontend-install   - Install frontend npm packages', 'white');
  colorLog('  frontend-build     - Build frontend for production', 'white');

  colorLog('\n🗄️  Database:', 'yellow');
  colorLog('  shell-db           - Open PostgreSQL shell', 'white');
  colorLog('  reset              - Reset database (DELETE ALL DATA)', 'white');

  colorLog('\n🛠️  Development Tools:', 'yellow');
  colorLog('  backend-shell      - Open Python shell (local venv)', 'white');
  colorLog('  shell-backend      - Open Python shell (Docker container)', 'white');
  
  colorLog('\n📋 Logs & Status:', 'yellow');
  colorLog('  logs               - View all service logs', 'white');
  colorLog('  logs-backend       - View backend logs', 'white');
  colorLog('  logs-frontend      - View frontend logs', 'white');
  colorLog('  logs-db            - View database logs', 'white');
  colorLog('  status             - Show service status', 'white');
  colorLog('  ps                 - List running containers', 'white');

  colorLog('\n🧪 Testing:', 'yellow');
  colorLog('  test-backend       - Run backend tests', 'white');
  colorLog('  test-frontend      - Run frontend tests', 'white');
  
  colorLog('\n🧹 Maintenance:', 'yellow');
  colorLog('  clean              - Clean up Docker environment', 'white');

  colorLog('\n💡 Quick Start Guide:', 'green');
  colorLog('═'.repeat(60), 'cyan');
  colorLog('  1. First time setup:', 'white');
  colorLog('     node setup.js setup', 'cyan');
  colorLog('', 'white');
  colorLog('  2. Start with Docker (recommended):', 'white');
  colorLog('     node setup.js docker', 'cyan');
  colorLog('', 'white');
  colorLog('  3. Or start locally (2 terminals):', 'white');
  colorLog('     node setup.js backend    # Terminal 1', 'cyan');
  colorLog('     node setup.js frontend   # Terminal 2', 'cyan');
  colorLog('═'.repeat(60), 'cyan');
  
  colorLog('\n📖 Documentation:', 'green');
  colorLog('  See README.md for detailed information', 'white');
  colorLog('  See requirements.md for complete specifications', 'white');
}

// Main execution
async function main() {
  const command = process.argv[2];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  if (!checkDocker()) {
    return;
  }

  if (appCommands[command]) {
    try {
      await appCommands[command].action();
    } catch (error) {
      colorLog(`\n❌ Command '${command}' failed:`, 'red');
      colorLog(error.message, 'red');
      colorLog('\n💡 Try running: node setup.js help', 'yellow');
    }
  } else {
    colorLog(`❌ Unknown command: ${command}`, 'red');
    colorLog("👉 Run 'node setup.js help' to see available commands.", 'yellow');
  }
}

if (require.main === module) {
  main().catch(error => {
    colorLog(`\n❌ Unexpected error:`, 'red');
    colorLog(error.message, 'red');
    process.exit(1);
  });
}

module.exports = { getDockerCommand, getProjectName, colorLog };
