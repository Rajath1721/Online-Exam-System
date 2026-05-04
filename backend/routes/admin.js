const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminAuth } = require('../middleware/authMiddleware');

// Get generic metrics for Dashboard
router.get('/metrics', adminAuth, async (req, res) => {
    try {
        const [tests] = await db.query('SELECT COUNT(*) as count FROM Tests');
        const [students] = await db.query('SELECT COUNT(*) as count FROM Users WHERE role = "student"');
        const [results] = await db.query('SELECT AVG(percentage) as avg_score, COUNT(*) as total_attempts FROM Results');
        
        res.json({
            total_tests: tests[0].count,
            total_students: students[0].count,
            average_score: results[0].avg_score ? parseFloat(results[0].avg_score).toFixed(2) : 0,
            total_attempts: results[0].total_attempts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching metrics' });
    }
});

// Create Test
router.post('/tests', adminAuth, async (req, res) => {
    try {
        const { title, subject, marks_per_question, timer_minutes } = req.body;
        const [result] = await db.query(
            'INSERT INTO Tests (title, subject, created_by, marks_per_question, timer_minutes) VALUES (?, ?, ?, ?, ?)',
            [title, subject, req.user.id, marks_per_question || 1, timer_minutes || 0]
        );
        res.status(201).json({ message: 'Test created', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating test' });
    }
});

// View all tests
router.get('/tests', adminAuth, async (req, res) => {
    try {
        const [tests] = await db.query('SELECT * FROM Tests ORDER BY created_at DESC');
        res.json(tests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching tests' });
    }
});

// Edit Test
router.put('/tests/:id', adminAuth, async (req, res) => {
    try {
        const { title, subject, marks_per_question, timer_minutes } = req.body;
        await db.query(
            'UPDATE Tests SET title = ?, subject = ?, marks_per_question = ?, timer_minutes = ? WHERE id = ?',
            [title, subject, marks_per_question, timer_minutes, req.params.id]
        );
        res.json({ message: 'Test updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating test' });
    }
});

// Delete Test
router.delete('/tests/:id', adminAuth, async (req, res) => {
    try {
        await db.query('DELETE FROM Tests WHERE id = ?', [req.params.id]);
        res.json({ message: 'Test deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting test' });
    }
});

// Add Question
router.post('/tests/:testId/questions', adminAuth, async (req, res) => {
    try {
        const { testId } = req.params;
        const { question, option_a, option_b, option_c, option_d, correct_answer } = req.body;
        
        await db.query(
            'INSERT INTO Questions (test_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [testId, question, option_a, option_b, option_c, option_d, correct_answer]
        );
        res.status(201).json({ message: 'Question added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding question' });
    }
});

// View Questions for a test
router.get('/tests/:testId/questions', adminAuth, async (req, res) => {
    try {
        const [questions] = await db.query('SELECT * FROM Questions WHERE test_id = ?', [req.params.testId]);
        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching questions' });
    }
});

// Delete Question
router.delete('/questions/:id', adminAuth, async (req, res) => {
    try {
        await db.query('DELETE FROM Questions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Question deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting question' });
    }
});


// View Student Results
router.get('/results', adminAuth, async (req, res) => {
    try {
        const query = `
            SELECT r.id, r.score, r.percentage, r.date_attempted,
                   u.name as student_name, u.email as student_email,
                   t.title as test_title
            FROM Results r
            JOIN Users u ON r.user_id = u.id
            JOIN Tests t ON r.test_id = t.id
            ORDER BY r.date_attempted DESC
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching results' });
    }
});

module.exports = router;
