const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/authMiddleware');

// Get available tests (not yet taken by student)
router.get('/tests/available', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        // Select tests that haven't been completed by this user
        const query = `
            SELECT t.*, 
                   (SELECT COUNT(*) FROM Questions q WHERE q.test_id = t.id) as question_count
            FROM Tests t 
            WHERE t.id NOT IN (SELECT test_id FROM Results WHERE user_id = ?)
        `;
        const [tests] = await db.query(query, [userId]);
        // Filter out tests with 0 questions for students
        res.json(tests.filter(t => t.question_count > 0));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching available tests' });
    }
});

// Get completed tests (results for this student)
router.get('/results', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT r.*, t.title as test_title, t.subject 
            FROM Results r
            JOIN Tests t ON r.test_id = t.id
            WHERE r.user_id = ?
            ORDER BY r.date_attempted DESC
        `;
        const [results] = await db.query(query, [userId]);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching results' });
    }
});

// Fetch a test to take (questions without correct answers)
router.get('/tests/:id', auth, async (req, res) => {
    try {
        const testId = req.params.id;
        const userId = req.user.id;

        // Verify they haven't taken it
        const [attempt] = await db.query('SELECT id FROM Results WHERE user_id = ? AND test_id = ?', [userId, testId]);
        if (attempt.length > 0) {
            return res.status(403).json({ message: 'Test already taken' });
        }

        const [tests] = await db.query('SELECT * FROM Tests WHERE id = ?', [testId]);
        if (tests.length === 0) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Fetch questions without 'correct_answer'
        const [questions] = await db.query(
            'SELECT id, test_id, question, option_a, option_b, option_c, option_d FROM Questions WHERE test_id = ?',
            [testId]
        );

        res.json({
            test: tests[0],
            questions
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching test data' });
    }
});

// Submit a test
router.post('/tests/:id/submit', auth, async (req, res) => {
    try {
        const testId = req.params.id;
        const userId = req.user.id;
        const { answers } = req.body; // answers: { question_id: 'A'|'B'|'C'|'D' }

        // 1. Verify not taken
        const [attempt] = await db.query('SELECT id FROM Results WHERE user_id = ? AND test_id = ?', [userId, testId]);
        if (attempt.length > 0) {
            return res.status(403).json({ message: 'Test already taken' });
        }

        // 2. Fetch test info & questions with correct answers
        const [tests] = await db.query('SELECT marks_per_question FROM Tests WHERE id = ?', [testId]);
        if (tests.length === 0) return res.status(404).json({ message: 'Test not found' });
        
        const marksPerQuestion = tests[0].marks_per_question;
        const [questions] = await db.query('SELECT id, correct_answer FROM Questions WHERE test_id = ?', [testId]);
        
        // 3. Calculate score
        let correctCount = 0;
        let totalScore = 0;
        const totalQuestions = questions.length;
        const maxScore = totalQuestions * marksPerQuestion;

        if (totalQuestions === 0) {
             return res.status(400).json({ message: 'Cannot submit an empty test' });
        }

        questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                correctCount++;
            }
        });

        totalScore = correctCount * marksPerQuestion;
        const percentage = (totalScore / maxScore) * 100;

        // 4. Save result
        await db.query(
            'INSERT INTO Results (user_id, test_id, score, percentage) VALUES (?, ?, ?, ?)',
            [userId, testId, totalScore, percentage]
        );

        res.json({
            message: 'Test submitted successfully',
            score: totalScore,
            percentage: parseFloat(percentage.toFixed(2)),
            correct_answers: correctCount,
            total_questions: totalQuestions
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error submitting test' });
    }
});

module.exports = router;
