import { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Which command is used to list the contents of a directory?",
    options: ["dir", "list", "ls", "show"],
    correctAnswer: "ls",
    explanation: "'ls' is the standard command on Unix-like systems to list files and directories."
  },
  {
    question: "How do you change your current directory to your home directory?",
    options: ["cd home", "cd ~", "goto home", "cd /home"],
    correctAnswer: "cd ~",
    explanation: "The '~' character is a shortcut for the current user's home directory. 'cd' alone also typically works."
  },
  {
    question: "What command is used to create a new directory named 'project'?",
    options: ["newdir project", "crdir project", "mkdir project", "makedir project"],
    correctAnswer: "mkdir project",
    explanation: "'mkdir' stands for 'make directory' and is used to create new directories."
  },
  {
    question: "How can you create an empty file named 'notes.txt'?",
    options: ["touch notes.txt", "create notes.txt", "new file notes.txt", "mkfile notes.txt"],
    correctAnswer: "touch notes.txt",
    explanation: "The 'touch' command is used to create a new empty file or update the timestamp of an existing file."
  },
  {
    question: "Which command prints the full path of your current working directory?",
    options: ["path", "whereami", "pwd", "showpath"],
    correctAnswer: "pwd",
    explanation: "'pwd' stands for 'print working directory'."
  },
  {
    question: "How do you copy a file named 'source.txt' to 'destination.txt'?",
    options: ["copy source.txt destination.txt", "cp source.txt destination.txt", "move source.txt destination.txt", "duplicate source.txt destination.txt"],
    correctAnswer: "cp source.txt destination.txt",
    explanation: "'cp' is the command used for copying files and directories."
  },
  {
    question: "Which command is used to rename 'old.txt' to 'new.txt'?",
    options: ["rename old.txt new.txt", "ren old.txt new.txt", "mv old.txt new.txt", "changename old.txt new.txt"],
    correctAnswer: "mv old.txt new.txt",
    explanation: "The 'mv' (move) command is used for both moving and renaming files."
  },
  {
    question: "How do you remove a file named 'temp.log'?",
    options: ["del temp.log", "rm temp.log", "erase temp.log", "remove temp.log"],
    correctAnswer: "rm temp.log",
    explanation: "'rm' is the command used to remove files."
  },
  {
    question: "What does the 'cd ..' command do?",
    options: ["Moves to the root directory", "Moves to the previous directory you were in", "Moves one directory level up", "Creates a directory named '..'"],
    correctAnswer: "Moves one directory level up",
    explanation: "'..' is a special directory name that refers to the parent directory of the current one."
  },
  {
    question: "Which command displays the content of a text file named 'readme.md'?",
    options: ["cat readme.md", "type readme.md", "display readme.md", "read readme.md"],
    correctAnswer: "cat readme.md",
    explanation: "'cat' (short for concatenate) is commonly used to display the contents of files."
  }
];
