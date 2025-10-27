import React, { useState, useRef, useEffect, useCallback } from 'react';
import { commands } from './data/commands';
import { quizQuestions } from './data/quiz';
import type { HistoryItem, QuizQuestion } from './types';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Practice Mode State
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [virtualFS, setVirtualFS] = useState<any>({ home: { user: {} } });
  const [currentVfsPath, setCurrentVfsPath] = useState<string[]>(['home', 'user']);

  // Quiz Mode State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const getCurrentVfsNode = useCallback((path: string[]) => {
    let currentNode = virtualFS;
    for (const part of path) {
      if (currentNode && typeof currentNode === 'object' && part in currentNode) {
        currentNode = currentNode[part];
      } else {
        return null;
      }
    }
    return currentNode;
  }, [virtualFS]);

  const resolvePath = useCallback((rawPath: string) => {
    if (!rawPath) return currentVfsPath;
    const parts = rawPath.replace(/\/$/, '').split('/').filter(p => p);
    let newPath;

    if (rawPath.startsWith('/')) {
      newPath = [];
    } else if (rawPath.startsWith('~')) {
      newPath = ['home', 'user'];
      parts.shift();
    } else {
      newPath = [...currentVfsPath];
    }

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        if (newPath.length > 0) newPath.pop();
      } else {
        newPath.push(part);
      }
    }

    // Ensure we don't go above root
    if (newPath.length === 0 && (rawPath.startsWith('..') || !rawPath.startsWith('/'))) {
        return [];
    }
    
    // Check if path is valid
    let tempNode = virtualFS;
    for (const p of newPath) {
        if (tempNode[p] && typeof tempNode[p] === 'object') {
            tempNode = tempNode[p];
        } else if (p in tempNode && typeof tempNode[p] !== 'object') {
           // allow targeting a file for commands like cat/rm
           return newPath;
        } else {
            return null; // Invalid path
        }
    }
    return newPath;
  }, [currentVfsPath, virtualFS]);

  const PROMPT = (
    <span className="flex-shrink-0">
      <span className="text-green-400">user@bashlearner</span>
      <span className="text-gray-400">:</span>
      <span className="text-blue-400">{isPracticeMode ? `~/${currentVfsPath.slice(2).join('/') || ''}` : '~'}</span>
      <span className="text-gray-400">$</span>
    </span>
  );

  const WELCOME_MESSAGES = [
    "Welcome to BashLearner Terminal!",
    "Type 'help' to see a list of available custom commands.",
    "Type 'ls -c' to list all command categories.",
    "Type 'man <command>' to learn about a specific command.",
    "Type 'search <keyword>' to find commands.",
    "Type 'quiz' to test your knowledge.",
    "Type 'practice on' to enter interactive practice mode."
  ];

  const getHelpMessage = () => (
    <div>
      <p className="font-bold">BashLearner Custom Commands:</p>
      <ul className="list-disc list-inside ml-2">
        <li><span className="font-bold text-yellow-300">help</span> - Show this help message.</li>
        <li><span className="font-bold text-yellow-300">man {'<command>'}</span> - Display details for a specific command.</li>
        <li><span className="font-bold text-yellow-300">ls | list</span> - List all available commands. Use <span className="font-bold text-gray-300">-c</span> for categories.</li>
        <li><span className="font-bold text-yellow-300">search {'<keyword>'}</span> - Search commands by name, description, or tags.</li>
        <li><span className="font-bold text-yellow-300">quiz</span> - Start a multiple-choice quiz.</li>
        <li><span className="font-bold text-yellow-300">practice on|off</span> - Toggle interactive practice mode.</li>
        <li><span className="font-bold text-yellow-300">clear</span> - Clear the terminal screen.</li>
        <li><span className="font-bold text-yellow-300">date</span> - Display the current date.</li>
        <li><span className="font-bold text-yellow-300">whoami</span> - Display the current user.</li>
        <li><span className="font-bold text-yellow-300">echo ...</span> - Display a line of text.</li>
      </ul>
    </div>
  );

  const startQuiz = (): React.ReactNode => {
    setIsQuizActive(true);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    return renderQuizQuestion(quizQuestions[0]);
  }

  const renderQuizQuestion = (question: QuizQuestion): React.ReactNode => {
    return (
      <div>
        <p className="font-bold mb-2">Question {currentQuestionIndex + 1}/{quizQuestions.length}: {question.question}</p>
        {question.options.map((opt, i) => (
          <p key={i} className="ml-2">{(i + 1)}. {opt}</p>
        ))}
        <p className="mt-2">Type the number of your answer (1-4).</p>
      </div>
    );
  };
  
  const processQuizAnswer = (answer: string): React.ReactNode => {
    if (quizAnswered) {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < quizQuestions.length) {
        setCurrentQuestionIndex(nextIndex);
        setQuizAnswered(false);
        return renderQuizQuestion(quizQuestions[nextIndex]);
      } else {
        setIsQuizActive(false);
        return <div className="font-bold text-green-400">Quiz Finished! Your score: {quizScore}/{quizQuestions.length}</div>;
      }
    }
    
    const answerIndex = parseInt(answer, 10) - 1;
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= currentQuestion.options.length) {
      return "Invalid option. Please type a number from 1 to 4.";
    }

    setQuizAnswered(true);
    const selectedOption = currentQuestion.options[answerIndex];
    if (selectedOption === currentQuestion.correctAnswer) {
      setQuizScore(prev => prev + 1);
      return (
        <div>
          <p className="text-green-400">Correct!</p>
          <p>{currentQuestion.explanation}</p>
          <p className="mt-2 text-gray-400">Press Enter to continue.</p>
        </div>
      );
    } else {
      return (
        <div>
          <p className="text-red-400">Incorrect.</p>
          <p>The correct answer was: <span className="font-bold">{currentQuestion.correctAnswer}</span></p>
          <p>{currentQuestion.explanation}</p>
          <p className="mt-2 text-gray-400">Press Enter to continue.</p>
        </div>
      );
    }
  };

  const processPracticeCommand = (cmdStr: string): React.ReactNode => {
    const [command, ...args] = cmdStr.trim().split(/\s+/);
    let newVFS = JSON.parse(JSON.stringify(virtualFS));

    switch (command.toLowerCase()) {
      case 'ls':
        const node = getCurrentVfsNode(currentVfsPath);
        if (!node) return "ls: cannot access '.': No such file or directory";
        const contents = Object.keys(node);
        return contents.length > 0 ? <div className="grid grid-cols-3 gap-x-4">{contents.map(item => <span key={item}>{item}</span>)}</div> : null;

      case 'pwd':
        return `/${currentVfsPath.join('/')}`;
      
      case 'cd':
        const newPath = resolvePath(args[0] || '~');
        if (newPath === null) return `cd: no such file or directory: ${args[0]}`;
        const targetNode = getCurrentVfsNode(newPath);
        if (typeof targetNode !== 'object') return `cd: not a directory: ${args[0]}`;
        setCurrentVfsPath(newPath);
        return null;

      case 'mkdir':
        if (!args[0]) return "mkdir: missing operand";
        const dirName = args[0];
        let parentNode = getCurrentVfsNode(currentVfsPath);
        if (parentNode && !parentNode[dirName]) {
          parentNode[dirName] = {};
          setVirtualFS(newVFS);
          return null;
        }
        return `mkdir: cannot create directory ‘${dirName}’: File exists`;

      case 'touch':
        if (!args[0]) return "touch: missing file operand";
        const fileName = args[0];
        let parent = getCurrentVfsNode(currentVfsPath);
        parent[fileName] = `content of ${fileName}`;
        setVirtualFS(newVFS);
        return null;
      
      case 'cat':
        if (!args[0]) return "cat: missing file operand";
        const fileToRead = args[0];
        const fileParentNode = getCurrentVfsNode(currentVfsPath);
        if (fileParentNode && typeof fileParentNode[fileToRead] === 'string') {
          return fileParentNode[fileToRead];
        }
        return `cat: ${fileToRead}: No such file or directory`;

      case 'rm':
        if (!args[0]) return "rm: missing operand";
        const itemToRemove = args[0];
        const itemParent = getCurrentVfsNode(currentVfsPath);
        if (itemParent && itemToRemove in itemParent) {
          delete itemParent[itemToRemove];
          setVirtualFS(newVFS);
          return null;
        }
        return `rm: cannot remove '${itemToRemove}': No such file or directory`;

      default:
        // Fallback to normal command processing for non-interactive commands
        return processCommand(cmdStr, false);
    }
  };
  
  const processCommand = useCallback((cmdStr: string, fromUserInput = true): React.ReactNode => {
    if (fromUserInput && isPracticeMode) {
        return processPracticeCommand(cmdStr);
    }
    
    if (!cmdStr.trim()) return null;

    const [command, ...args] = cmdStr.trim().split(/\s+/);

    switch (command.toLowerCase()) {
      case 'help':
        return getHelpMessage();

      case 'clear':
        setHistory([]);
        return null;

      case 'quiz':
        return startQuiz();

      case 'practice':
        if (args[0] === 'on') {
          setIsPracticeMode(true);
          return "Practice mode enabled. You have a virtual file system. Try 'ls', 'mkdir test', 'cd test'.";
        }
        if (args[0] === 'off') {
          setIsPracticeMode(false);
          return "Practice mode disabled.";
        }
        return "Usage: practice on|off";

      case 'man':
        if (args.length === 0) return "What manual page do you want?";
        const cmdToFind = commands.find(c => c.name.toLowerCase() === args[0].toLowerCase());
        if (!cmdToFind) return `No manual entry for ${args[0]}`;
        return (
          <div className="whitespace-pre-wrap">
            <p><span className="font-bold">NAME</span></p>
            <p className="ml-4">{cmdToFind.name} - {cmdToFind.description}</p>
            <br />
            <p><span className="font-bold">CATEGORY</span></p>
            <p className="ml-4">{cmdToFind.category}</p>
            <br />
            {cmdToFind.tags.length > 0 && <>
              <p><span className="font-bold">TAGS</span></p>
              <p className="ml-4">{cmdToFind.tags.join(', ')}</p>
              <br />
            </>}
            <p><span className="font-bold">EXAMPLES</span></p>
            {cmdToFind.examples.map((ex, i) => (
              <div key={i} className="ml-4">
                <p className="text-green-300">$ {ex.command}</p>
                <p className="ml-4 text-gray-300"># {ex.description}</p>
              </div>
            ))}
          </div>
        );

      case 'ls':
      case 'list':
         if (args[0] === '-c') {
            const categories = [...new Set(commands.map(c => c.category))];
            return (
              <div>
                <p className="font-bold">Command Categories:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4">
                  {categories.sort().map(cat => <span key={cat}>{cat}</span>)}
                </div>
              </div>
            );
        }
        return (
            <div>
              <p className="font-bold">Available Commands ({commands.length}):</p>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2">
                  {commands.map(c => <span key={c.name}>{c.name}</span>)}
              </div>
            </div>
        );

      case 'search':
        if (args.length === 0) return "Usage: search <keyword>";
        const keyword = args.join(' ').toLowerCase();
        const results = commands.filter(c => 
          c.name.toLowerCase().includes(keyword) ||
          c.description.toLowerCase().includes(keyword) ||
          c.category.toLowerCase().includes(keyword) ||
          c.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
        if (results.length === 0) return `No commands found for "${keyword}"`;
        return (
          <div>
            <p>Found {results.length} commands for "{keyword}":</p>
            <ul className="list-disc list-inside ml-2">
              {results.map(c => (
                <li key={c.name}>
                  <span className="font-bold text-yellow-300">{c.name}</span> - {c.description}
                </li>
              ))}
            </ul>
          </div>
        );
      
      case 'date':
        return new Date().toString();
      
      case 'whoami':
        return 'user';
      
      case 'echo':
        return args.join(' ');

      default:
        const isKnownCommand = commands.some(c => c.name.toLowerCase() === command.toLowerCase());
        if (isKnownCommand) {
            if (isPracticeMode) {
              return `bash: ${command}: This command is not simulated in practice mode. To see details, type 'man ${command}'`;
            }
            return `bash: ${command}: This is a learning tool. To see details, type 'man ${command}'`;
        }
        return `bash: command not found: ${command}`;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPracticeMode, isQuizActive, quizAnswered, currentQuestionIndex, quizScore, virtualFS, currentVfsPath, resolvePath, getCurrentVfsNode]);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setHistory([{ id: 0, command: '', output: WELCOME_MESSAGES.map((msg, i) => <div key={i}>{msg}</div>) }]);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmedInput = input.trim();
      const output = isQuizActive ? processQuizAnswer(trimmedInput) : processCommand(trimmedInput);
      
      const newHistoryItem: HistoryItem = {
        id: history.length,
        command: input,
        output: output,
      };

      const command = input.trim().split(/\s+/)[0];
      if (command.toLowerCase() !== 'clear') {
         setHistory(prev => [...prev, newHistoryItem]);
      }
      setInput('');
    }
  };

  return (
    <div
      className="bg-black text-white font-mono h-screen w-full p-2 md:p-4 overflow-hidden flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={terminalRef} className="flex-grow overflow-y-auto pr-2">
        {history.map(item => (
          <div key={item.id}>
            {item.command && (
              <div className="flex items-center space-x-2">
                {PROMPT}
                <span>{item.command}</span>
              </div>
            )}
            {item.output && <div className="text-white mt-1 mb-2">{item.output}</div>}
          </div>
        ))}
        <div className="flex items-center space-x-2">
          {PROMPT}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-white w-full flex-grow"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
            disabled={isQuizActive && quizAnswered}
          />
           <span className="cursor-blink bg-green-400 w-2 h-5 inline-block -ml-2"></span>
        </div>
      </div>
    </div>
  );
};

export default App;