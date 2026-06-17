require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Class = require('../models/Class');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const Material = require('../models/Material');
const Notification = require('../models/Notification');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected for seeding');
};

const clearDB = async () => {
  await Promise.all([
    User.deleteMany({}),
    Class.deleteMany({}),
    Quiz.deleteMany({}),
    Submission.deleteMany({}),
    Material.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');
};

const seed = async () => {
  await connectDB();
  await clearDB();

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@learnloop.com',
    password: 'admin123',
    role: 'admin',
  });

  // Create teachers
  const teacher1 = await User.create({
    name: 'Dr. Sarah Johnson',
    email: 'sarah@learnloop.com',
    password: 'teacher123',
    role: 'teacher',
    subjects: ['Mathematics', 'Algebra'],
    phone: '+1-555-0101',
  });

  const teacher2 = await User.create({
    name: 'Prof. Michael Chen',
    email: 'michael@learnloop.com',
    password: 'teacher123',
    role: 'teacher',
    subjects: ['Science', 'Physics', 'Chemistry'],
    phone: '+1-555-0102',
  });

  const teacher3 = await User.create({
    name: 'Ms. Priya Sharma',
    email: 'priya@learnloop.com',
    password: 'teacher123',
    role: 'teacher',
    subjects: ['English', 'Literature'],
    phone: '+1-555-0103',
  });

  // Create students
  const studentData = [
    { name: 'Alex Kumar', email: 'alex@student.com', grade: '10th', avgScore: 72 },
    { name: 'Emma Wilson', email: 'emma@student.com', grade: '10th', avgScore: 88 },
    { name: 'Raj Patel', email: 'raj@student.com', grade: '10th', avgScore: 45 },
    { name: 'Sofia Martinez', email: 'sofia@student.com', grade: '10th', avgScore: 91 },
    { name: 'James Lee', email: 'james@student.com', grade: '10th', avgScore: 63 },
    { name: 'Priya Nair', email: 'priya.n@student.com', grade: '10th', avgScore: 78 },
    { name: 'Tom Brown', email: 'tom@student.com', grade: '9th', avgScore: 55 },
    { name: 'Aisha Hassan', email: 'aisha@student.com', grade: '9th', avgScore: 82 },
  ];

  const students = await Promise.all(
    studentData.map(s => User.create({
      ...s,
      password: 'student123',
      role: 'student',
      averageScore: s.avgScore,
    }))
  );

  // Create classes
  const mathClass = await Class.create({
    name: 'Mathematics - Grade 10',
    description: 'Advanced mathematics covering algebra, geometry, and trigonometry',
    grade: '10th',
    subject: 'Mathematics',
    teacher: teacher1._id,
    students: students.slice(0, 6).map(s => s._id),
    coverColor: '#4F46E5',
    schedule: 'Mon, Wed, Fri - 9:00 AM',
  });

  const scienceClass = await Class.create({
    name: 'Science - Grade 10',
    description: 'Physics, Chemistry and Biology fundamentals',
    grade: '10th',
    subject: 'Science',
    teacher: teacher2._id,
    students: students.slice(0, 5).map(s => s._id),
    coverColor: '#059669',
    schedule: 'Tue, Thu - 10:00 AM',
  });

  const englishClass = await Class.create({
    name: 'English Literature - Grade 10',
    description: 'Exploring classic and contemporary literature',
    grade: '10th',
    subject: 'English',
    teacher: teacher3._id,
    students: students.slice(2, 8).map(s => s._id),
    coverColor: '#D97706',
    schedule: 'Mon, Wed - 11:00 AM',
  });

  const grade9Math = await Class.create({
    name: 'Mathematics - Grade 9',
    description: 'Foundation mathematics for Grade 9',
    grade: '9th',
    subject: 'Mathematics',
    teacher: teacher1._id,
    students: students.slice(6).map(s => s._id),
    coverColor: '#DC2626',
    schedule: 'Tue, Thu, Fri - 2:00 PM',
  });

  // Update teachers' teachingClasses
  await User.findByIdAndUpdate(teacher1._id, { teachingClasses: [mathClass._id, grade9Math._id] });
  await User.findByIdAndUpdate(teacher2._id, { teachingClasses: [scienceClass._id] });
  await User.findByIdAndUpdate(teacher3._id, { teachingClasses: [englishClass._id] });

  // Update students' enrolledClasses
  for (let i = 0; i < 6; i++) {
    let classes = [mathClass._id, scienceClass._id];
    if (i >= 2) classes.push(englishClass._id);
    await User.findByIdAndUpdate(students[i]._id, { enrolledClasses: classes });
  }
  await User.findByIdAndUpdate(students[6]._id, { enrolledClasses: [grade9Math._id, englishClass._id] });
  await User.findByIdAndUpdate(students[7]._id, { enrolledClasses: [grade9Math._id, englishClass._id] });

  // Create quizzes
  const algebrazQuiz = await Quiz.create({
    title: 'Algebra Fundamentals - Chapter 1',
    description: 'Test your understanding of basic algebra concepts',
    class: mathClass._id,
    teacher: teacher1._id,
    subject: 'Mathematics',
    timeLimit: 30,
    passingScore: 60,
    isPublished: true,
    status: 'active',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    questions: [
      { question: 'Solve for x: 2x + 6 = 14', options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'], correctAnswer: 1, topic: 'Algebra', difficulty: 'easy', points: 10, explanation: '2x = 14 - 6 = 8, so x = 4' },
      { question: 'What is the value of 3² + 4²?', options: ['20', '25', '30', '49'], correctAnswer: 1, topic: 'Powers', difficulty: 'easy', points: 10, explanation: '9 + 16 = 25' },
      { question: 'Simplify: (x² - 4) / (x - 2)', options: ['x + 2', 'x - 2', 'x² + 2', 'x'], correctAnswer: 0, topic: 'Algebra', difficulty: 'medium', points: 15, explanation: 'Factor x² - 4 = (x+2)(x-2), then cancel (x-2)' },
      { question: 'Find the slope of line: y = 3x - 7', options: ['3', '-7', '7', '-3'], correctAnswer: 0, topic: 'Linear Equations', difficulty: 'easy', points: 10, explanation: 'In y = mx + b form, m is the slope = 3' },
      { question: 'Solve: x² - 5x + 6 = 0', options: ['x = 2, 3', 'x = -2, -3', 'x = 1, 6', 'x = -1, 6'], correctAnswer: 0, topic: 'Quadratic', difficulty: 'medium', points: 15 },
      { question: 'If f(x) = 2x² + 3x - 1, find f(2)', options: ['13', '12', '11', '10'], correctAnswer: 0, topic: 'Functions', difficulty: 'medium', points: 15, explanation: '2(4) + 3(2) - 1 = 8 + 6 - 1 = 13' },
    ],
  });

  const geometryQuiz = await Quiz.create({
    title: 'Geometry - Triangles & Circles',
    description: 'Properties of triangles and circle theorems',
    class: mathClass._id,
    teacher: teacher1._id,
    subject: 'Mathematics',
    timeLimit: 25,
    passingScore: 60,
    isPublished: true,
    status: 'active',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    questions: [
      { question: 'Sum of angles in a triangle is:', options: ['90°', '180°', '270°', '360°'], correctAnswer: 1, topic: 'Geometry', difficulty: 'easy', points: 10 },
      { question: 'Area of a circle with radius 7 (π ≈ 22/7):', options: ['44', '154', '22', '49'], correctAnswer: 1, topic: 'Circles', difficulty: 'easy', points: 10 },
      { question: 'Pythagorean theorem: a² + b² = ?', options: ['c', 'c²', 'ab', '2c'], correctAnswer: 1, topic: 'Geometry', difficulty: 'easy', points: 10 },
      { question: 'An isosceles triangle has:', options: ['All sides equal', 'Two equal sides', 'No equal sides', 'One right angle'], correctAnswer: 1, topic: 'Triangles', difficulty: 'easy', points: 10 },
      { question: 'Circumference of circle with diameter 14:', options: ['22', '44', '88', '154'], correctAnswer: 1, topic: 'Circles', difficulty: 'medium', points: 15 },
    ],
  });

  const physicsQuiz = await Quiz.create({
    title: 'Forces & Motion - Chapter 3',
    description: 'Newton\'s laws and applications',
    class: scienceClass._id,
    teacher: teacher2._id,
    subject: 'Science',
    timeLimit: 20,
    passingScore: 60,
    isPublished: true,
    status: 'active',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    questions: [
      { question: 'Newton\'s 1st law describes:', options: ['Force = Mass × Acceleration', 'Inertia', 'Action-Reaction', 'Gravity'], correctAnswer: 1, topic: 'Newton Laws', difficulty: 'easy', points: 10 },
      { question: 'Unit of force is:', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 1, topic: 'Units', difficulty: 'easy', points: 10 },
      { question: 'F = ma. If F = 20N and m = 4kg, find a:', options: ['4 m/s²', '5 m/s²', '80 m/s²', '2 m/s²'], correctAnswer: 1, topic: 'Newton Laws', difficulty: 'medium', points: 15 },
      { question: 'Speed = Distance / Time. If d = 100m, t = 5s, speed = ?', options: ['10 m/s', '20 m/s', '500 m/s', '2 m/s'], correctAnswer: 1, topic: 'Kinematics', difficulty: 'easy', points: 10 },
      { question: 'g (acceleration due to gravity) ≈', options: ['9.8 cm/s²', '9.8 m/s²', '98 m/s²', '0.98 m/s²'], correctAnswer: 1, topic: 'Gravity', difficulty: 'easy', points: 10 },
    ],
  });

  // Create submissions with realistic scores
  const submissionConfigs = [
    // Alex - average student
    { student: students[0], quiz: algebrazQuiz, answers: [1,1,0,0,1,0], time: 1450 },
    { student: students[0], quiz: geometryQuiz, answers: [1,0,1,1,0], time: 980 },
    { student: students[0], quiz: physicsQuiz, answers: [1,1,1,0,1], time: 850 },
    // Emma - top student
    { student: students[1], quiz: algebrazQuiz, answers: [1,1,0,0,0,0], time: 1200 },
    { student: students[1], quiz: geometryQuiz, answers: [1,1,1,1,1], time: 750 },
    { student: students[1], quiz: physicsQuiz, answers: [1,1,1,1,1], time: 620 },
    // Raj - struggling student
    { student: students[2], quiz: algebrazQuiz, answers: [0,1,0,0,0,0], time: 1780 },
    { student: students[2], quiz: geometryQuiz, answers: [1,0,0,1,0], time: 1420 },
    { student: students[2], quiz: physicsQuiz, answers: [1,1,0,0,1], time: 1100 },
    // Sofia - excellent student
    { student: students[3], quiz: algebrazQuiz, answers: [1,1,0,0,0,0], time: 1050 },
    { student: students[3], quiz: geometryQuiz, answers: [1,1,1,1,1], time: 680 },
    { student: students[3], quiz: physicsQuiz, answers: [1,1,1,1,1], time: 590 },
    // James - below average
    { student: students[4], quiz: algebrazQuiz, answers: [1,0,0,0,1,0], time: 1680 },
    { student: students[4], quiz: geometryQuiz, answers: [1,1,0,1,0], time: 1350 },
    // Priya - above average
    { student: students[5], quiz: algebrazQuiz, answers: [1,1,0,0,0,0], time: 1300 },
    { student: students[5], quiz: geometryQuiz, answers: [1,1,1,1,0], time: 920 },
    { student: students[5], quiz: physicsQuiz, answers: [1,1,1,0,1], time: 760 },
  ];

  const createSubmission = async (config) => {
    const { student, quiz, answers: studentAnswers, time } = config;
    const scoredAnswers = quiz.questions.map((q, idx) => {
      const selected = studentAnswers[idx] !== undefined ? studentAnswers[idx] : null;
      const isCorrect = selected === q.correctAnswer;
      return {
        questionId: q._id,
        question: q.question,
        topic: q.topic,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        points: isCorrect ? q.points : 0,
        maxPoints: q.points,
      };
    });

    const sub = new Submission({
      quiz: quiz._id,
      student: student._id,
      class: quiz.class,
      answers: scoredAnswers,
      timeTaken: time,
      attemptNumber: 1,
    });
    
    await sub.save();
    sub.passed = sub.percentage >= quiz.passingScore;
    await sub.save();
    return sub;
  };

  for (const config of submissionConfigs) {
    await createSubmission(config);
  }

  // Create materials
  await Material.create([
    {
      title: 'Algebra Basics - Study Notes',
      description: 'Comprehensive notes on algebraic expressions and equations',
      class: mathClass._id,
      teacher: teacher1._id,
      subject: 'Mathematics',
      topic: 'Algebra',
      type: 'notes',
      content: `# Algebra Fundamentals\n\n## Key Concepts\n\n### Variables and Expressions\nA variable is a symbol (usually a letter) that represents an unknown value.\n\n**Example:** In the expression 3x + 5, 'x' is the variable.\n\n### Solving Equations\n1. Identify the variable\n2. Use inverse operations to isolate the variable\n3. Check your answer\n\n**Example:** Solve 2x + 6 = 14\n- Step 1: Subtract 6 from both sides: 2x = 8\n- Step 2: Divide by 2: x = 4\n- Step 3: Check: 2(4) + 6 = 14 ✓`,
      isPublished: true,
      tags: ['algebra', 'equations', 'variables'],
    },
    {
      title: 'Geometry Formulas Reference Sheet',
      description: 'Quick reference for all geometry formulas',
      class: mathClass._id,
      teacher: teacher1._id,
      subject: 'Mathematics',
      topic: 'Geometry',
      type: 'notes',
      content: `# Geometry Formulas\n\n## Triangles\n- Area = (1/2) × base × height\n- Perimeter = a + b + c\n- Pythagoras: a² + b² = c²\n\n## Circles\n- Area = πr²\n- Circumference = 2πr\n- Diameter = 2r\n\n## Quadrilaterals\n- Rectangle: Area = l × w\n- Square: Area = s²\n- Parallelogram: Area = base × height`,
      isPublished: true,
      tags: ['geometry', 'formulas', 'shapes'],
    },
    {
      title: 'Newton\'s Laws - Assignment #2',
      description: 'Practice problems on Newton\'s three laws of motion',
      class: scienceClass._id,
      teacher: teacher2._id,
      subject: 'Science',
      topic: 'Newton Laws',
      type: 'assignment',
      content: `# Newton's Laws - Assignment\n\n## Due: Next Friday\n\n### Questions\n1. A car of mass 1000 kg accelerates at 2 m/s². Find the force.\n2. Explain Newton's First Law with a real-life example.\n3. A ball hits a wall with 50N force. What force does the wall exert back?\n\n### Submission\nSubmit your handwritten work in class.`,
      isPublished: true,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tags: ['physics', 'newton', 'forces'],
    },
    {
      title: 'Shakespeare\'s Hamlet - Act 1 Analysis',
      description: 'Scene-by-scene analysis and discussion questions',
      class: englishClass._id,
      teacher: teacher3._id,
      subject: 'English',
      topic: 'Shakespeare',
      type: 'notes',
      content: `# Hamlet Act 1 Analysis\n\n## Scene 1 - The Ghost\nThe play opens on a cold night at Elsinore Castle. Guards encounter the ghost of King Hamlet.\n\n**Key Themes:**\n- Uncertainty and doubt\n- Supernatural elements\n- Political instability\n\n## Discussion Questions\n1. Why does Shakespeare open the play with ordinary soldiers rather than nobility?\n2. What does the Ghost's appearance suggest about the state of Denmark?`,
      isPublished: true,
      tags: ['shakespeare', 'hamlet', 'literature'],
    },
  ]);

  // Create notifications
  await Notification.create([
    {
      title: 'Welcome to LearnLoop!',
      message: 'Welcome to LearnLoop – No Student Left Behind. Start exploring your dashboard!',
      type: 'system',
      recipients: [...students.map(s => ({ user: s._id })), { user: teacher1._id }, { user: teacher2._id }],
      priority: 'high',
    },
    {
      title: 'New Quiz Available',
      message: 'Algebra Fundamentals - Chapter 1 quiz is now available. Due in 7 days!',
      type: 'quiz',
      sender: teacher1._id,
      recipients: students.slice(0, 6).map(s => ({ user: s._id })),
      class: mathClass._id,
      priority: 'high',
    },
    {
      title: 'Class Announcement',
      message: 'Remember to complete your Newton\'s Laws assignment before Friday!',
      type: 'announcement',
      sender: teacher2._id,
      recipients: students.slice(0, 5).map(s => ({ user: s._id })),
      class: scienceClass._id,
      priority: 'medium',
    },
  ]);

  console.log('\n🌱 Seed data created successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('👑 Admin: admin@learnloop.com / admin123');
  console.log('👩‍🏫 Teacher 1: sarah@learnloop.com / teacher123');
  console.log('👨‍🏫 Teacher 2: michael@learnloop.com / teacher123');
  console.log('👩‍🏫 Teacher 3: priya@learnloop.com / teacher123');
  console.log('🧑‍🎓 Student 1: alex@student.com / student123');
  console.log('🧑‍🎓 Student 2: emma@student.com / student123');
  console.log('🧑‍🎓 Student 3: raj@student.com / student123');
  console.log('🧑‍🎓 Student 4: sofia@student.com / student123');
  console.log('');

  await mongoose.connection.close();
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});