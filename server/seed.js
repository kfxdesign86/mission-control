const db = require('./db');

console.log('🌱 Seeding Mission Control database...');

// Clear existing data
db.exec('DELETE FROM tasks');
db.exec('DELETE FROM boards');
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('boards', 'tasks')");

// Create boards
const insertBoard = db.prepare('INSERT INTO boards (name, slug) VALUES (?, ?)');
const boards = [
  { name: 'Tag Markets', slug: 'tag-markets' },
  { name: 'Bit1', slug: 'bit1' },
  { name: 'BIX', slug: 'bix' },
  { name: 'Personal', slug: 'personal' }
];

const boardIds = {};
for (const board of boards) {
  const result = insertBoard.run(board.name, board.slug);
  boardIds[board.slug] = result.lastInsertRowid;
}

console.log('✅ Created boards:', Object.keys(boardIds).join(', '));

// Create sample tasks
const insertTask = db.prepare(`
  INSERT INTO tasks (board_id, title, description, assignee, priority, due_date, status, position)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const sampleTasks = [
  // Tag Markets
  { board: 'tag-markets', title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated deployments', assignee: 'Jared', priority: 'high', due_date: '2026-02-10', status: 'in-progress', position: 0 },
  { board: 'tag-markets', title: 'API rate limiting', description: 'Implement rate limiting middleware', assignee: '', priority: 'medium', due_date: '2026-02-15', status: 'backlog', position: 0 },
  { board: 'tag-markets', title: 'Dashboard analytics', description: 'Add charts for key metrics', assignee: 'Jared', priority: 'medium', due_date: null, status: 'backlog', position: 1 },
  { board: 'tag-markets', title: 'User authentication', description: 'JWT-based auth system', assignee: '', priority: 'high', due_date: '2026-02-08', status: 'review', position: 0 },
  
  // Bit1
  { board: 'bit1', title: 'Mobile app wireframes', description: 'Design main screens in Figma', assignee: '', priority: 'high', due_date: '2026-02-12', status: 'in-progress', position: 0 },
  { board: 'bit1', title: 'Database optimization', description: 'Index slow queries', assignee: 'Jared', priority: 'medium', due_date: null, status: 'backlog', position: 0 },
  { board: 'bit1', title: 'Payment integration', description: 'Stripe checkout flow', assignee: '', priority: 'high', due_date: '2026-02-20', status: 'backlog', position: 1 },
  
  // BIX
  { board: 'bix', title: 'Landing page redesign', description: 'Modern, conversion-focused design', assignee: '', priority: 'medium', due_date: '2026-02-18', status: 'backlog', position: 0 },
  { board: 'bix', title: 'Email templates', description: 'Transactional email designs', assignee: 'Jared', priority: 'low', due_date: null, status: 'done', position: 0 },
  { board: 'bix', title: 'API documentation', description: 'OpenAPI spec + docs site', assignee: '', priority: 'medium', due_date: '2026-02-25', status: 'in-progress', position: 0 },
  
  // Personal
  { board: 'personal', title: 'Gym membership', description: 'Research local gyms and pricing', assignee: 'Jared', priority: 'low', due_date: '2026-02-07', status: 'backlog', position: 0 },
  { board: 'personal', title: 'Read "Deep Work"', description: 'Cal Newport book', assignee: 'Jared', priority: 'low', due_date: null, status: 'in-progress', position: 0 },
  { board: 'personal', title: 'Plan Dubai trip', description: 'Flights, hotels, activities', assignee: 'Jared', priority: 'medium', due_date: '2026-02-28', status: 'backlog', position: 1 },
  { board: 'personal', title: 'Update resume', description: 'Add recent projects', assignee: 'Jared', priority: 'medium', due_date: null, status: 'done', position: 0 }
];

for (const task of sampleTasks) {
  insertTask.run(
    boardIds[task.board],
    task.title,
    task.description,
    task.assignee,
    task.priority,
    task.due_date,
    task.status,
    task.position
  );
}

console.log(`✅ Created ${sampleTasks.length} sample tasks`);
console.log('🎉 Seeding complete!');
