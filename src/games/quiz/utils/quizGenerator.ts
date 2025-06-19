
// Quiz question type
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: string;
}

// Generate quiz questions based on theme and difficulty
export const generateQuizQuestions = (themeId: string, difficultyId: string, count: number) => {
  const questions: { 
    question: string; 
    options: string[];
    correctIndex: number;
  }[] = [];
  
  // History questions
  const historyQuestions: QuizQuestion[] = [
    {
      question: "През коя година България се освобождава от османско владичество?",
      options: ["1878", "1885", "1908", "1944"],
      correctIndex: 0,
      difficulty: "easy"
    },
    {
      question: "Кой е първият български владетел, приел християнството?",
      options: ["Кубрат", "Аспарух", "Борис I", "Симеон I"],
      correctIndex: 2,
      difficulty: "easy"
    },
    {
      question: "Коя е първата българска столица?",
      options: ["Плиска", "Преслав", "Охрид", "Търново"],
      correctIndex: 0,
      difficulty: "easy"
    },
    {
      question: "През коя година е основана Българската държава?",
      options: ["632", "681", "864", "927"],
      correctIndex: 1,
      difficulty: "medium"
    },
    {
      question: "Кой български владетел е наречен \"Цар на българите и гърците\"?",
      options: ["Симеон I", "Калоян", "Иван Асен II", "Самуил"],
      correctIndex: 2,
      difficulty: "medium"
    },
    {
      question: "Кога е приета първата българска конституция (Търновската конституция)?",
      options: ["1878", "1879", "1885", "1908"],
      correctIndex: 1,
      difficulty: "medium"
    },
    {
      question: "Кое е най-дългото османско владичество в Европа?",
      options: ["Българското", "Гръцкото", "Сръбското", "Албанското"],
      correctIndex: 0,
      difficulty: "hard"
    },
    {
      question: "Кой е автор на \"История славянобългарска\"?",
      options: ["Св. Иван Рилски", "Паисий Хилендарски", "Софроний Врачански", "Неофит Рилски"],
      correctIndex: 1,
      difficulty: "hard"
    }
  ];
  
  // Science questions
  const scienceQuestions: QuizQuestion[] = [
    {
      question: "Коя е най-близката до Земята планета?",
      options: ["Марс", "Венера", "Меркурий", "Юпитер"],
      correctIndex: 1,
      difficulty: "easy"
    },
    {
      question: "Кой елемент има химичен символ 'O'?",
      options: ["Осмий", "Кислород", "Злато", "Олово"],
      correctIndex: 1,
      difficulty: "easy"
    },
    {
      question: "Каква е основната функция на белите кръвни клетки?",
      options: ["Пренасяне на кислород", "Борба с инфекции", "Съсирване на кръвта", "Произвеждане на хормони"],
      correctIndex: 1,
      difficulty: "easy"
    },
    {
      question: "Какво означава pH?",
      options: ["Потенциал на хидрогена", "Плътност на хелия", "Процент хидратация", "Периодична халогенизация"],
      correctIndex: 0,
      difficulty: "medium"
    },
    {
      question: "Каква част от човешкото тяло е съставена от вода?",
      options: ["Около 50%", "Около 60%", "Около 70%", "Около 80%"],
      correctIndex: 2,
      difficulty: "medium"
    },
    {
      question: "Кой е открил пеницилина?",
      options: ["Луи Пастьор", "Александър Флеминг", "Мария Кюри", "Иван Павлов"],
      correctIndex: 1,
      difficulty: "medium"
    },
    {
      question: "Коя е теорията, която обяснява разширяването на Вселената?",
      options: ["Теория на относителността", "Квантова теория", "Теория на Големия взрив", "Теория на струните"],
      correctIndex: 2,
      difficulty: "hard"
    },
    {
      question: "Какво е броят на Авогадро?",
      options: ["6.022 × 10²³", "3.14159", "9.8 м/с²", "1.602 × 10⁻¹⁹"],
      correctIndex: 0,
      difficulty: "hard"
    }
  ];
  
  // Geography questions
  const geographyQuestions: QuizQuestion[] = [
    {
      question: "Коя е най-дългата река в България?",
      options: ["Дунав", "Марица", "Искър", "Янтра"],
      correctIndex: 0,
      difficulty: "easy"
    },
    {
      question: "Кой е най-високият връх в България?",
      options: ["Мусала", "Вихрен", "Ботев", "Черни връх"],
      correctIndex: 0,
      difficulty: "easy"
    },
    {
      question: "С колко държави граничи България?",
      options: ["3", "4", "5", "6"],
      correctIndex: 2,
      difficulty: "easy"
    },
    {
      question: "Коя е най-голямата планина в България?",
      options: ["Пирин", "Рила", "Стара планина", "Родопи"],
      correctIndex: 2,
      difficulty: "medium"
    },
    {
      question: "Кое е най-голямото езеро в България?",
      options: ["Варненско езеро", "Бургаско езеро", "Сребърна", "Панчаревско езеро"],
      correctIndex: 0,
      difficulty: "medium"
    },
    {
      question: "Кой е най-големият остров в Черно море, принадлежащ на България?",
      options: ["Свети Иван", "Свети Тома", "Свети Петър", "Свети Кирик"],
      correctIndex: 0,
      difficulty: "medium"
    },
    {
      question: "Колко е приблизителната площ на България?",
      options: ["111,000 кв. км", "92,000 кв. км", "128,000 кв. км", "74,000 кв. км"],
      correctIndex: 1,
      difficulty: "hard"
    },
    {
      question: "Кой е най-южният град в България?",
      options: ["Сандански", "Петрич", "Златоград", "Свиленград"],
      correctIndex: 2,
      difficulty: "hard"
    }
  ];
  
  // Select questions based on theme and difficulty
  let themeQuestions: QuizQuestion[] = [];
  
  if (themeId === "history") {
    themeQuestions = historyQuestions;
  } else if (themeId === "science") {
    themeQuestions = scienceQuestions;
  } else if (themeId === "geography") {
    themeQuestions = geographyQuestions;
  }
  
  // Filter by difficulty
  const filteredQuestions = themeQuestions.filter(q => {
    if (difficultyId === "easy") return q.difficulty === "easy";
    if (difficultyId === "medium") return q.difficulty === "easy" || q.difficulty === "medium";
    return true; // hard difficulty includes all questions
  });
  
  // Shuffle and select requested number of questions
  const shuffledQuestions = [...filteredQuestions].sort(() => Math.random() - 0.5);
  
  // Make sure we have enough questions
  const numQuestions = Math.min(count, shuffledQuestions.length);
  
  for (let i = 0; i < numQuestions; i++) {
    questions.push(shuffledQuestions[i]);
  }
  
  return questions;
};
