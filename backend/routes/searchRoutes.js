import express from 'express';
import Event from '../models/Event.js';
import Guest from '../models/Guest.js';
import Vendor from '../models/Vendor.js';
import Task from '../models/Task.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { q, user } = req.query;
        if (!q || q.trim() === '') {
            return res.json({ events: [], people: [], vendors: [], tasks: [] });
        }

        const queryRegex = new RegExp(q, 'i');
        
        // Build queries
        // Events: match name, user must match (if provided)
        const eventQuery = { name: queryRegex };
        if (user) eventQuery.user = user;
        
        const guestQuery = { 
            user: user,
            $or: [
                { name: queryRegex },
                { email: queryRegex }
            ]
        };

        const vendorQuery = { 
            user: user,
            $or: [
                { name: queryRegex },
                { service: queryRegex }
            ]
        };

        const taskQuery = {
            user: user,
            $or: [
                { title: queryRegex },
                { category: queryRegex }
            ]
        };

        // Execute all queries concurrently for performance
        const [events, guests, vendors, tasks] = await Promise.all([
            Event.find(eventQuery).limit(5).lean(),
            Guest.find(guestQuery).limit(5).lean(),
            Vendor.find(vendorQuery).limit(5).lean(),
            Task.find(taskQuery).limit(5).lean()
        ]);

        // Standardize output format slightly so the frontend can consume it easily
        res.json({
            events: events.map(e => ({ id: e._id || e.id, name: e.name, type: 'Event', date: e.date, status: e.status })),
            people: guests.map(g => ({ id: g._id || g.id, name: g.name, email: g.email, type: 'Guest', status: g.status, event: g.event })),
            vendors: vendors.map(v => ({ id: v._id || v.id, name: v.name, service: v.service, type: 'Vendor', status: v.status, event: v.event })),
            tasks: tasks.map(t => ({ id: t._id || t.id, title: t.title, category: t.category, type: 'Task', status: t.status, event: t.event }))
        });
    } catch (err) {
        console.error("Global Search Error:", err);
        res.status(500).json({ error: "Search failed" });
    }
});

export default router;
