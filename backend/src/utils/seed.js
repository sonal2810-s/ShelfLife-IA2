require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Book = require('../models/Book');
const Member = require('../models/Member');
const BorrowRecord = require('../models/BorrowRecord');

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      Book.deleteMany({}),
      Member.deleteMany({}),
      BorrowRecord.deleteMany({})
    ]);

    console.log('[Seed] Seeding books...');
    const books = await Book.create([
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        ISBN: '978-0132350884',
        genre: 'Computer Science',
        totalCopies: 5,
        availableCopies: 4
      },
      {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        ISBN: '978-0201633610',
        genre: 'Computer Science',
        totalCopies: 3,
        availableCopies: 2
      },
      {
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        ISBN: '978-0262033848',
        genre: 'Computer Science',
        totalCopies: 4,
        availableCopies: 1
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        ISBN: '978-0060935467',
        genre: 'Fiction',
        totalCopies: 6,
        availableCopies: 5
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        ISBN: '978-0743273565',
        genre: 'Fiction',
        totalCopies: 4,
        availableCopies: 4
      },
      {
        title: '1984',
        author: 'George Orwell',
        ISBN: '978-0451524935',
        genre: 'Fiction',
        totalCopies: 5,
        availableCopies: 5
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        ISBN: '978-0553380163',
        genre: 'Science',
        totalCopies: 3,
        availableCopies: 3
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        ISBN: '978-0062316097',
        genre: 'History',
        totalCopies: 5,
        availableCopies: 4
      },
      {
        title: 'Meditations',
        author: 'Marcus Aurelius',
        ISBN: '978-0140449334',
        genre: 'Philosophy',
        totalCopies: 3,
        availableCopies: 3
      },
      {
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell, Peter Norvig',
        ISBN: '978-0136042594',
        genre: 'Computer Science',
        totalCopies: 2,
        availableCopies: 0 // Intentionally 0 to test unavailability
      },
      {
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
        ISBN: '978-0078022159',
        genre: 'Computer Science',
        totalCopies: 4,
        availableCopies: 4
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'David Thomas, Andrew Hunt',
        ISBN: '978-0135957059',
        genre: 'Computer Science',
        totalCopies: 5,
        availableCopies: 5
      }
    ]);

    console.log(`[Seed] Created ${books.length} sample books.`);

    console.log('[Seed] Seeding members...');
    const members = await Member.create([
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@college.edu',
        membershipId: 'MEM-2026-001',
        joinedDate: new Date('2026-01-10')
      },
      {
        name: 'Diya Patel',
        email: 'diya.patel@college.edu',
        membershipId: 'MEM-2026-002',
        joinedDate: new Date('2026-01-15')
      },
      {
        name: 'Rohan Verma',
        email: 'rohan.verma@college.edu',
        membershipId: 'MEM-2026-003',
        joinedDate: new Date('2026-02-01')
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@college.edu',
        membershipId: 'MEM-2026-004',
        joinedDate: new Date('2026-02-12')
      }
    ]);

    console.log(`[Seed] Created ${members.length} sample members.`);

    console.log('[Seed] Seeding borrow records (issued, returned, and overdue)...');
    const now = new Date();
    const pastDueDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago (OVERDUE)
    const futureDueDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days in future (ISSUED)
    const pastIssueDate = new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000); // 19 days ago

    await BorrowRecord.create([
      // Record 1: Overdue loan for Aarav Sharma (Clean Code)
      {
        book: books[0]._id,
        member: members[0]._id,
        issueDate: pastIssueDate,
        dueDate: pastDueDate,
        returnDate: null,
        status: 'overdue'
      },
      // Record 2: Active loan for Aarav Sharma (Design Patterns)
      {
        book: books[1]._id,
        member: members[0]._id,
        issueDate: now,
        dueDate: futureDueDate,
        returnDate: null,
        status: 'issued'
      },
      // Record 3: Successfully returned loan for Aarav Sharma (To Kill a Mockingbird)
      {
        book: books[3]._id,
        member: members[0]._id,
        issueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
        returnDate: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
        status: 'returned'
      },
      // Record 4: Active loan for Diya Patel (Sapiens)
      {
        book: books[7]._id,
        member: members[1]._id,
        issueDate: now,
        dueDate: futureDueDate,
        returnDate: null,
        status: 'issued'
      }
    ]);

    console.log('[Seed] Database successfully seeded with books, members, and borrow records!');
    if (require.main === module) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw err;
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;

