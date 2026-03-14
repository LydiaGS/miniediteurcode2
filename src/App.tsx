import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

// Types
interface Project {
  id: string;
  name: string;
  html: string;
  css: string;
  js: string;
  createdAt: number;
  updatedAt: number;
}

interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: number;
}

// Templates
const templates = {
  blank: { html: '', css: '', js: '' },
  hello: {
    html: `<div class="container">
  <h1>👋 Hello World!</h1>
  <p>Bienvenue dans LevelUp Code Editor</p>
  <button id="btn">Cliquez-moi!</button>
  <p id="counter">Compteur: 0</p>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.2);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

p {
  color: #666;
  margin-bottom: 1.5rem;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

#counter {
  margin-top: 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #764ba2;
}`,
    js: `let count = 0;
const btn = document.getElementById('btn');
const counter = document.getElementById('counter');

btn.addEventListener('click', () => {
  count++;
  counter.textContent = 'Compteur: ' + count;
  console.log('Bouton cliqué! Compteur:', count);
});

console.log('🚀 Application initialisée!');`
  },
  animation: {
    html: `<div class="scene">
  <div class="cube">
    <div class="face front">Front</div>
    <div class="face back">Back</div>
    <div class="face right">Right</div>
    <div class="face left">Left</div>
    <div class="face top">Top</div>
    <div class="face bottom">Bottom</div>
  </div>
</div>
<p class="info">Survolez le cube!</p>`,
    css: `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #1a1a2e;
  perspective: 1000px;
}

.scene {
  width: 200px;
  height: 200px;
  perspective: 600px;
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(-20deg) rotateY(30deg);
  transition: transform 1s;
}

.scene:hover .cube {
  transform: rotateX(20deg) rotateY(-30deg) rotateZ(10deg);
}

.face {
  position: absolute;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Arial', sans-serif;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.front  { background: rgba(255,0,0,0.7); transform: translateZ(100px); }
.back   { background: rgba(0,255,0,0.7); transform: rotateY(180deg) translateZ(100px); }
.right  { background: rgba(0,0,255,0.7); transform: rotateY(90deg) translateZ(100px); }
.left   { background: rgba(255,255,0,0.7); transform: rotateY(-90deg) translateZ(100px); }
.top    { background: rgba(255,0,255,0.7); transform: rotateX(90deg) translateZ(100px); }
.bottom { background: rgba(0,255,255,0.7); transform: rotateX(-90deg) translateZ(100px); }

.info {
  margin-top: 3rem;
  color: #888;
  font-family: sans-serif;
}`,
    js: `console.log('🎲 Cube 3D chargé!');
console.log('Survolez le cube pour le voir tourner');`
  },
  todoApp: {
    html: `<div class="todo-app">
  <h1>📝 Todo List</h1>
  <div class="input-container">
    <input type="text" id="todoInput" placeholder="Ajouter une tâche...">
    <button id="addBtn">+</button>
  </div>
  <ul id="todoList"></ul>
  <div class="footer">
    <span id="count">0 tâches</span>
    <button id="clearBtn">Tout effacer</button>
  </div>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.todo-app {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #2a5298;
}

button {
  padding: 12px 20px;
  background: #2a5298;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s;
}

button:hover {
  background: #1e3c72;
}

ul {
  list-style: none;
  margin-bottom: 1rem;
}

li {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  margin-bottom: 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

li:hover {
  background: #e8e8e8;
}

li.done {
  text-decoration: line-through;
  opacity: 0.6;
}

li input[type="checkbox"] {
  margin-right: 12px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

li span {
  flex: 1;
}

li .delete-btn {
  background: #ff4757;
  padding: 6px 12px;
  font-size: 0.9rem;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

#count {
  color: #666;
}

#clearBtn {
  background: #ff6b6b;
  padding: 8px 16px;
  font-size: 0.9rem;
}`,
    js: `const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const countSpan = document.getElementById('count');
const clearBtn = document.getElementById('clearBtn');

let todos = [];

function updateCount() {
  const remaining = todos.filter(t => !t.done).length;
  countSpan.textContent = remaining + ' tâche' + (remaining > 1 ? 's' : '');
}

function renderTodos() {
  todoList.innerHTML = '';
  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    if (todo.done) li.classList.add('done');
    li.innerHTML = \`
      <input type="checkbox" \${todo.done ? 'checked' : ''}>
      <span>\${todo.text}</span>
      <button class="delete-btn">×</button>
    \`;
    
    li.querySelector('input').addEventListener('change', () => {
      todos[index].done = !todos[index].done;
      renderTodos();
    });
    
    li.querySelector('.delete-btn').addEventListener('click', () => {
      todos.splice(index, 1);
      renderTodos();
    });
    
    todoList.appendChild(li);
  });
  updateCount();
}

function addTodo() {
  const text = todoInput.value.trim();
  if (text) {
    todos.push({ text, done: false });
    todoInput.value = '';
    renderTodos();
    console.log('✅ Tâche ajoutée:', text);
  }
}

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTodo();
});

clearBtn.addEventListener('click', () => {
  todos = [];
  renderTodos();
  console.log('🗑️ Liste effacée');
});

console.log('📝 Todo App prête!');`
  },
  game: {
    html: `<div class="game-container">
  <h1>🎮 Snake Game</h1>
  <canvas id="gameCanvas" width="400" height="400"></canvas>
  <div class="controls">
    <p>Score: <span id="score">0</span></p>
    <button id="startBtn">▶️ Démarrer</button>
  </div>
  <p class="instructions">Utilisez les flèches ← ↑ → ↓</p>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: #0f0f23;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-container {
  text-align: center;
}

h1 {
  color: #00ff88;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(0,255,136,0.5);
}

canvas {
  background: #1a1a2e;
  border: 3px solid #00ff88;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0,255,136,0.3);
}

.controls {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

#score {
  color: #00ff88;
  font-size: 1.5rem;
  font-weight: bold;
}

p {
  color: white;
}

button {
  background: #00ff88;
  color: #0f0f23;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  background: #00cc6a;
  transform: scale(1.05);
}

.instructions {
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}`,
    js: `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const startBtn = document.getElementById('startBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 0, dy = 0;
let score = 0;
let gameLoop;
let gameRunning = false;

function drawGame() {
  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  ctx.strokeStyle = '#2a2a4e';
  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
  
  // Draw food
  ctx.fillStyle = '#ff6b6b';
  ctx.shadowColor = '#ff6b6b';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Draw snake
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#00ff88' : '#00cc6a';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = index === 0 ? 15 : 5;
    ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
  });
  ctx.shadowBlur = 0;
}

function moveSnake() {
  if (dx === 0 && dy === 0) return;
  
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};
  
  // Check walls
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }
  
  // Check self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }
  
  snake.unshift(head);
  
  // Check food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreSpan.textContent = score;
    placeFood();
    console.log('🍎 +10 points! Score:', score);
  } else {
    snake.pop();
  }
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

function gameOver() {
  gameRunning = false;
  clearInterval(gameLoop);
  startBtn.textContent = '🔄 Rejouer';
  console.log('💀 Game Over! Score final:', score);
  alert('Game Over! Score: ' + score);
}

function startGame() {
  snake = [{x: 10, y: 10}];
  dx = 0; dy = 0;
  score = 0;
  scoreSpan.textContent = '0';
  placeFood();
  gameRunning = true;
  startBtn.textContent = '⏸️ Pause';
  
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(() => {
    moveSnake();
    drawGame();
  }, 100);
  
  console.log('🎮 Jeu démarré!');
}

document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowUp': if (dy !== 1) { dx = 0; dy = -1; } break;
    case 'ArrowDown': if (dy !== -1) { dx = 0; dy = 1; } break;
    case 'ArrowLeft': if (dx !== 1) { dx = -1; dy = 0; } break;
    case 'ArrowRight': if (dx !== -1) { dx = 1; dy = 0; } break;
  }
});

startBtn.addEventListener('click', () => {
  if (gameRunning) {
    gameRunning = false;
    clearInterval(gameLoop);
    startBtn.textContent = '▶️ Reprendre';
  } else {
    startGame();
  }
});

drawGame();
console.log('🎮 Snake Game prêt! Cliquez sur Démarrer');`
  }
};

// Main App Component
export default function App() {
  const [html, setHtml] = useState(templates.hello.html);
  const [css, setCss] = useState(templates.hello.css);
  const [js, setJs] = useState(templates.hello.js);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [layout, setLayout] = useState<'horizontal' | 'vertical' | 'tabs'>('horizontal');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const [autoRun, setAutoRun] = useState(true);
  const [projectName, setProjectName] = useState('Mon Projet');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [splitPosition, setSplitPosition] = useState(50);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setLayout('tabs');
    }
  }, [isMobile]);

  const runCode = useCallback(() => {
    if (!iframeRef.current) return;
    
    const consoleScript = `
      <script>
        (function() {
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
          };
          
          function sendToParent(type, args) {
            window.parent.postMessage({
              type: 'console',
              method: type,
              args: Array.from(args).map(arg => {
                try {
                  if (typeof arg === 'object') return JSON.stringify(arg);
                  return String(arg);
                } catch(e) {
                  return String(arg);
                }
              })
            }, '*');
          }
          
          console.log = function() { sendToParent('log', arguments); originalConsole.log.apply(console, arguments); };
          console.error = function() { sendToParent('error', arguments); originalConsole.error.apply(console, arguments); };
          console.warn = function() { sendToParent('warn', arguments); originalConsole.warn.apply(console, arguments); };
          console.info = function() { sendToParent('info', arguments); originalConsole.info.apply(console, arguments); };
          
          window.onerror = function(msg, url, line, col, error) {
            sendToParent('error', ['Error: ' + msg + ' (line ' + line + ')']);
            return false;
          };
        })();
      </script>
    `;
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${css}</style>
          ${consoleScript}
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
    
    iframeRef.current.srcdoc = fullHtml;
  }, [html, css, js]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        setConsoleMessages(prev => [...prev.slice(-99), {
          type: event.data.method,
          content: event.data.args.join(' '),
          timestamp: Date.now()
        }]);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (autoRun) {
      const timer = setTimeout(runCode, 500);
      return () => clearTimeout(timer);
    }
  }, [html, css, js, autoRun, runCode]);

  const highlightCode = (code: string, language: string) => {
    try {
      const lang = language === 'html' ? 'markup' : language;
      return Prism.highlight(code, Prism.languages[lang], lang);
    } catch {
      return code;
    }
  };

  const downloadProject = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
  <script>
${js}
  </script>
</body>
</html>`;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveProject = () => {
    const project: Project = {
      id: Date.now().toString(),
      name: projectName,
      html, css, js,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const project: Project = JSON.parse(e.target?.result as string);
            setProjectName(project.name);
            setHtml(project.html);
            setCss(project.css);
            setJs(project.js);
            setConsoleMessages([]);
          } catch {
            alert('Fichier invalide');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const loadTemplate = (name: keyof typeof templates) => {
    const template = templates[name];
    setHtml(template.html);
    setCss(template.css);
    setJs(template.js);
    setConsoleMessages([]);
    setShowTemplates(false);
  };

  const clearConsole = () => setConsoleMessages([]);

  const editorStyle = {
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: editorFontSize,
    lineHeight: 1.6,
    minHeight: '100%',
  };

  const getConsoleIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getConsoleColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-2 sm:px-4 py-2 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">⚡</span>
            <span className="font-bold text-sm sm:text-lg bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent hidden sm:inline">
              LevelUp Code Editor
            </span>
          </div>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={`px-2 py-1 rounded text-sm w-24 sm:w-40 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border`}
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Templates */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`p-2 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              title="Templates"
            >
              📋
            </button>
            {showTemplates && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-50 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="p-2">
                  <p className="text-xs text-gray-500 mb-2 px-2">Choisir un template</p>
                  {Object.keys(templates).map((name) => (
                    <button
                      key={name}
                      onClick={() => loadTemplate(name as keyof typeof templates)}
                      className={`w-full text-left px-3 py-2 rounded text-sm capitalize ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {name === 'blank' && '📄 '}
                      {name === 'hello' && '👋 '}
                      {name === 'animation' && '🎨 '}
                      {name === 'todoApp' && '📝 '}
                      {name === 'game' && '🎮 '}
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Layout */}
          {!isMobile && (
            <div className="flex rounded overflow-hidden border border-gray-600">
              <button
                onClick={() => setLayout('horizontal')}
                className={`p-2 text-xs ${layout === 'horizontal' ? 'bg-purple-600' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                title="Horizontal"
              >
                ⬜⬜
              </button>
              <button
                onClick={() => setLayout('vertical')}
                className={`p-2 text-xs ${layout === 'vertical' ? 'bg-purple-600' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                title="Vertical"
              >
                ⬜<br/>⬜
              </button>
              <button
                onClick={() => setLayout('tabs')}
                className={`p-2 text-xs ${layout === 'tabs' ? 'bg-purple-600' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                title="Tabs"
              >
                📑
              </button>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={runCode}
            className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1"
          >
            ▶️ <span className="hidden sm:inline">Run</span>
          </button>

          <button
            onClick={() => setAutoRun(!autoRun)}
            className={`p-2 rounded ${autoRun ? 'bg-green-600' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
            title={autoRun ? 'Auto-run ON' : 'Auto-run OFF'}
          >
            {autoRun ? '🔄' : '⏸️'}
          </button>

          <button onClick={saveProject} className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`} title="Sauvegarder">
            💾
          </button>

          <button onClick={loadProject} className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`} title="Ouvrir">
            📂
          </button>

          <button onClick={downloadProject} className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`} title="Télécharger HTML">
            ⬇️
          </button>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              ⚙️
            </button>
            {showSettings && (
              <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-xl z-50 p-4 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h3 className="font-bold mb-3">Paramètres</h3>
                
                <div className="mb-3">
                  <label className="text-sm text-gray-400 block mb-1">Thème</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 py-1 px-2 rounded text-sm ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                      🌙 Sombre
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 py-1 px-2 rounded text-sm ${theme === 'light' ? 'bg-purple-600' : 'bg-gray-300 text-gray-800'}`}
                    >
                      ☀️ Clair
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-sm text-gray-400 block mb-1">Taille police: {editorFontSize}px</label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={editorFontSize}
                    onChange={(e) => setEditorFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-1 rounded text-sm"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden" style={{ flexDirection: layout === 'vertical' ? 'column' : 'row' }}>
        {/* Editors */}
        <div 
          className={`flex overflow-hidden ${layout === 'vertical' ? 'w-full' : ''}`}
          style={{ 
            width: layout === 'horizontal' ? `${splitPosition}%` : '100%',
            height: layout === 'vertical' ? `${splitPosition}%` : '100%',
            flexDirection: layout === 'tabs' ? 'column' : (layout === 'horizontal' ? 'column' : 'row')
          }}
        >
          {/* Tabs (for tabs layout) */}
          {layout === 'tabs' && (
            <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-200'}`}>
              {(['html', 'css', 'js'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-purple-600 text-white'
                      : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'html' && '🔶 HTML'}
                  {tab === 'css' && '🔷 CSS'}
                  {tab === 'js' && '🟡 JavaScript'}
                </button>
              ))}
              <button
                onClick={() => setActiveTab('html')}
                className={`py-2 px-4 text-sm font-medium bg-blue-600 text-white sm:hidden`}
                style={{ display: activeTab ? 'none' : 'block' }}
              >
                👁️ Preview
              </button>
            </div>
          )}

          {/* Editor Panels */}
          {layout === 'tabs' ? (
            <div className={`flex-1 overflow-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
              {activeTab === 'html' && (
                <Editor
                  value={html}
                  onValueChange={setHtml}
                  highlight={(code) => highlightCode(code, 'html')}
                  padding={16}
                  style={editorStyle}
                  className="min-h-full"
                />
              )}
              {activeTab === 'css' && (
                <Editor
                  value={css}
                  onValueChange={setCss}
                  highlight={(code) => highlightCode(code, 'css')}
                  padding={16}
                  style={editorStyle}
                  className="min-h-full"
                />
              )}
              {activeTab === 'js' && (
                <Editor
                  value={js}
                  onValueChange={setJs}
                  highlight={(code) => highlightCode(code, 'javascript')}
                  padding={16}
                  style={editorStyle}
                  className="min-h-full"
                />
              )}
            </div>
          ) : (
            <div className={`flex-1 flex ${layout === 'horizontal' ? 'flex-col' : 'flex-row'} overflow-hidden`}>
              {/* HTML Editor */}
              <div className={`flex-1 flex flex-col overflow-hidden border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                <div className={`px-3 py-1.5 text-sm font-medium flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <span className="text-orange-500">🔶</span> HTML
                </div>
                <div className={`flex-1 overflow-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                  <Editor
                    value={html}
                    onValueChange={setHtml}
                    highlight={(code) => highlightCode(code, 'html')}
                    padding={12}
                    style={editorStyle}
                  />
                </div>
              </div>

              {/* CSS Editor */}
              <div className={`flex-1 flex flex-col overflow-hidden border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                <div className={`px-3 py-1.5 text-sm font-medium flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <span className="text-blue-500">🔷</span> CSS
                </div>
                <div className={`flex-1 overflow-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                  <Editor
                    value={css}
                    onValueChange={setCss}
                    highlight={(code) => highlightCode(code, 'css')}
                    padding={12}
                    style={editorStyle}
                  />
                </div>
              </div>

              {/* JS Editor */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className={`px-3 py-1.5 text-sm font-medium flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <span className="text-yellow-500">🟡</span> JavaScript
                </div>
                <div className={`flex-1 overflow-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                  <Editor
                    value={js}
                    onValueChange={setJs}
                    highlight={(code) => highlightCode(code, 'javascript')}
                    padding={12}
                    style={editorStyle}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resizer */}
        {layout !== 'tabs' && (
          <div
            className={`${layout === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'} bg-purple-600 hover:bg-purple-500 transition-colors flex-shrink-0`}
            onMouseDown={(e) => {
              e.preventDefault();
              const startPos = layout === 'horizontal' ? e.clientX : e.clientY;
              const startSplit = splitPosition;
              
              const onMouseMove = (e: MouseEvent) => {
                const containerSize = layout === 'horizontal' 
                  ? window.innerWidth 
                  : window.innerHeight - 56; // header height
                const delta = ((layout === 'horizontal' ? e.clientX : e.clientY) - startPos) / containerSize * 100;
                setSplitPosition(Math.min(80, Math.max(20, startSplit + delta)));
              };
              
              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };
              
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
        )}

        {/* Preview + Console */}
        <div 
          className={`flex flex-col overflow-hidden ${layout === 'tabs' ? 'hidden sm:flex' : ''}`}
          style={{ 
            width: layout === 'horizontal' ? `${100 - splitPosition}%` : '100%',
            height: layout === 'vertical' ? `${100 - splitPosition}%` : '100%'
          }}
        >
          {/* Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`px-3 py-1.5 text-sm font-medium flex items-center justify-between ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div className="flex items-center gap-2">
                <span>👁️</span> Preview
              </div>
              <button
                onClick={runCode}
                className="text-xs bg-green-600 hover:bg-green-700 px-2 py-0.5 rounded"
              >
                🔄 Refresh
              </button>
            </div>
            <div className={`flex-1 ${theme === 'dark' ? 'bg-white' : 'bg-white'}`}>
              <iframe
                ref={iframeRef}
                title="preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>

          {/* Console */}
          <div className={`${showConsole ? 'h-40' : 'h-8'} flex flex-col border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-100'}`}>
            <div 
              className={`px-3 py-1 text-sm font-medium flex items-center justify-between cursor-pointer ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}
              onClick={() => setShowConsole(!showConsole)}
            >
              <div className="flex items-center gap-2">
                <span>🖥️</span> Console
                {consoleMessages.length > 0 && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {consoleMessages.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); clearConsole(); }}
                  className="text-xs hover:text-red-400"
                >
                  🗑️
                </button>
                <span>{showConsole ? '▼' : '▲'}</span>
              </div>
            </div>
            {showConsole && (
              <div className="flex-1 overflow-auto p-2 font-mono text-sm">
                {consoleMessages.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">Console vide</div>
                ) : (
                  consoleMessages.map((msg, i) => (
                    <div key={i} className={`py-0.5 flex items-start gap-2 ${getConsoleColor(msg.type)}`}>
                      <span>{getConsoleIcon(msg.type)}</span>
                      <span className="flex-1 break-all">{msg.content}</span>
                      <span className="text-xs text-gray-600">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Preview Toggle */}
      {isMobile && layout === 'tabs' && (
        <div className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-200'}`}>
          <button
            onClick={() => {
              const previewDiv = document.querySelector('.sm\\:flex') as HTMLElement;
              if (previewDiv) {
                previewDiv.classList.toggle('hidden');
                previewDiv.classList.toggle('flex');
              }
            }}
            className="w-full py-3 text-center text-sm font-medium bg-purple-600 text-white"
          >
            👁️ Voir le Preview
          </button>
        </div>
      )}
    </div>
  );
}
