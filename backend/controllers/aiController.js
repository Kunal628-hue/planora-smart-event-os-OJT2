import Event from "../models/Event.js";
import Task from "../models/Task.js";
import Vendor from "../models/Vendor.js";
import Guest from "../models/Guest.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export const getEventHealth = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const tasks = await Task.find({ event: new mongoose.Types.ObjectId(eventId) });
        const vendors = await Vendor.find({ event: new mongoose.Types.ObjectId(eventId) });
        const guests = await Guest.find({ event: new mongoose.Types.ObjectId(eventId) });

        const now = new Date();
        const eventDate = new Date(event.date);
        const daysRemaining = Math.max(0, Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24)));

        // 1. Task Completion Rate (Weighted by due dates)
        const completedTasks = tasks.filter(t => t.status === "Completed").length;
        const taskRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 100;

        // 2. Budget Precision
        const totalCost = vendors.reduce((sum, v) => sum + (v.cost || 0), 0);
        const budgetUsage = event.budget > 0 ? (totalCost / event.budget) * 100 : 0;
        let budgetScore = 100;
        if (budgetUsage > 110) budgetScore = 0;
        else if (budgetUsage > 100) budgetScore = Math.max(0, 100 - (budgetUsage - 100) * 10);
        else if (budgetUsage < 50 && daysRemaining < 30) budgetScore = 80; // Underspending warning

        // 3. Strategic Vendor Readiness
        const criticalCategories = ["Venue", "Catering", "Decor"];
        const criticalVendors = vendors.filter(v => criticalCategories.includes(v.service));
        const confirmedCritical = criticalVendors.filter(v => v.status === "Booked" || v.status === "Paid").length;
        const vendorRate = criticalVendors.length > 0 ? (confirmedCritical / criticalVendors.length) * 100 : 100;

        // 4. Audience Engagement (RSVP)
        const confirmedRSVPs = guests.filter(g => g.status === "Confirmed").length;
        const rsvpRate = guests.length > 0 ? (confirmedRSVPs / guests.length) * 100 : 100;

        // Time-based Penalty: Risks become 2x more severe if event is within 14 days
        const timeUrgencyFactor = daysRemaining < 14 ? 1.5 : (daysRemaining < 3 ? 2.5 : 1.0);
        
        const overdueTasks = tasks.filter(t => t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < now).length;
        const delayPenalty = overdueTasks * 4 * timeUrgencyFactor;

        // Final Aggregate Calculation
        const healthScore = Math.max(0, Math.min(100, (
            (taskRate * 0.25) +
            (budgetScore * 0.35) +
            (vendorRate * 0.20) +
            (rsvpRate * 0.20)
        ) - delayPenalty));

        res.status(200).json({
            score: Math.round(healthScore),
            metrics: {
                taskCompletion: Math.round(taskRate),
                budgetUsage: Math.round(budgetUsage),
                totalSpent: totalCost,
                vendorConfirmation: Math.round(vendorRate),
                rsvpRate: Math.round(rsvpRate),
                overdueTasks,
                daysRemaining
            }
        });
    } catch (error) {
        console.error("Health calculation error:", error);
        res.status(500).json({ message: "Internal server error during health calculation" });
    }
};

export const getRiskAssessment = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Strategic Context not found" });

        const tasks = await Task.find({ event: new mongoose.Types.ObjectId(eventId) });
        const vendors = await Vendor.find({ event: new mongoose.Types.ObjectId(eventId) });
        const guests = await Guest.find({ event: new mongoose.Types.ObjectId(eventId) });

        const now = new Date();
        const eventDate = new Date(event.date);
        const daysToEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
        const risks = [];

        // 1. Critical Vendor Risk
        const criticalVenues = vendors.filter(v => (v.service === "Venue" || v.service === "Catering") && v.status !== "Booked" && v.status !== "Paid");
        if (criticalVenues.length > 0 && daysToEvent < 30) {
            risks.push({
                type: "CRITICAL",
                category: "Partners",
                message: "Primary anchor (Venue/Catering) not secured.",
                suggestion: `Secure booking immediately. High probability of date loss within 30-day window.`
            });
        }

        // 2. Budget Burn Risk
        const totalCost = vendors.reduce((sum, v) => sum + (v.cost || 0), 0);
        if (totalCost > event.budget) {
            risks.push({
                type: "CRITICAL",
                category: "Budget",
                message: `Capital overflow: ₹${(totalCost - event.budget).toLocaleString('en-IN')} over allocation`,
                suggestion: "De-prioritize non-essential add-ons or reallocate contingency funds."
            });
        }

        // 3. Operational Bottleneck (Task Backlog)
        const overdueTasks = tasks.filter(t => t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < now);
        if (overdueTasks.length > 3) {
            risks.push({
                type: daysToEvent < 7 ? "CRITICAL" : "WARNING",
                category: "Timeline",
                message: `${overdueTasks.length} milestones missed in current sprint.`,
                suggestion: "Initiate emergency task redirection or increase team velocity."
            });
        }

        // 4. RSVP Inertia
        const rsvpTotal = guests.length;
        const confirmed = guests.filter(g => g.status === "Confirmed").length;
        const rsvpPercent = rsvpTotal > 0 ? (confirmed / rsvpTotal) * 100 : 100;
        
        if (daysToEvent < 15 && rsvpPercent < 40 && rsvpTotal > 0) {
            risks.push({
                type: "WARNING",
                category: "Audience",
                message: `Low turnout probability: Only ${Math.round(rsvpPercent)}% confirmed.`,
                suggestion: "Broadcast automated follow-up sequence to pending contacts."
            });
        }

        res.status(200).json(risks);
    } catch (error) {
        console.error("Risk assessment error:", error);
        res.status(500).json({ message: "Analytical engine malfunction" });
    }
};

export const getSmartTimeline = async (req, res) => {
    const { type } = req.query; // Wedding, Conference, College Fest, etc.

    const timelines = {
        "Wedding": [
            { title: "Venue Selection & Booking", daysBefore: 180, category: "Venue" },
            { title: "Guest List Preparation", daysBefore: 150, category: "Planning" },
            { title: "Catering & Menu Tasting", daysBefore: 120, category: "Vendor" },
            { title: "Wedding Invitations Dispatch", daysBefore: 90, category: "Guests" },
            { title: "Final Vendor Confirmations", daysBefore: 30, category: "Coordination" },
            { title: "Rehearsal & Setup", daysBefore: 2, category: "Final" }
        ],
        "Conference": [
            { title: "Define Goals & Speakers", daysBefore: 120, category: "Strategy" },
            { title: "Venue & AV Setup", daysBefore: 90, category: "Logistics" },
            { title: "Open Registrations", daysBefore: 60, category: "Marketing" },
            { title: "Final Agenda Circulation", daysBefore: 15, category: "Coordination" },
            { title: "Materials & Badges Printing", daysBefore: 7, category: "Logistics" }
        ],
        "College Fest": [
            { title: "Club Coordination & Funding", daysBefore: 60, category: "Admin" },
            { title: "Sponsorship Outreach", daysBefore: 45, category: "Finance" },
            { title: "Event Permissions & Security", daysBefore: 30, category: "Legal" },
            { title: "Performance Lineup & Gear", daysBefore: 20, category: "Technical" },
            { title: "Promotion & Ticket Sales", daysBefore: 15, category: "Marketing" }
        ],
        "Other": [
            { title: "Initial Planning & Budgeting", daysBefore: 60, category: "Strategy" },
            { title: "Venue & Key Vendor Booking", daysBefore: 45, category: "Logistics" },
            { title: "Invitations & Guest Management", daysBefore: 30, category: "Guests" },
            { title: "Final Logistics Check", daysBefore: 10, category: "Coordination" },
            { title: "Execution & Setup", daysBefore: 1, category: "Final" }
        ]
    };

    const suggestedTimeline = timelines[type] || timelines["Conference"];
    res.status(200).json(suggestedTimeline);
};

export const getBudgetOptimization = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event context lost" });

        const vendors = await Vendor.find({ event: new mongoose.Types.ObjectId(eventId) });

        const categories = {};
        vendors.forEach(v => {
            categories[v.service] = (categories[v.service] || 0) + (v.cost || 0);
        });

        const suggestions = [];
        const eventBudget = event.budget || 0;

        // Industry Standard benchmarks (as decimals)
        const benchmarks = {
            "Wedding": { Catering: 0.40, Venue: 0.20, Decor: 0.15, AV: 0.10, Other: 0.15 },
            "Conference": { Catering: 0.25, Venue: 0.35, AV: 0.20, Decor: 0.10, Other: 0.10 },
            "College Fest": { Catering: 0.15, Venue: 0.10, AV: 0.40, Decor: 0.20, Other: 0.15 },
            "Party": { Catering: 0.50, Venue: 0.15, Decor: 0.20, AV: 0.10, Other: 0.05 }
        };

        const currentEventMetrics = benchmarks[event.type] || benchmarks["Wedding"];

        Object.keys(categories).forEach(cat => {
            if (eventBudget > 0) {
                const percentage = (categories[cat] / eventBudget);
                const benchmark = currentEventMetrics[cat] || 0.15;

                if (percentage > benchmark + 0.1) {
                    suggestions.push(`${cat} allocation (${Math.round(percentage * 100)}%) exceeds strategic benchmark (${Math.round(benchmark * 100)}%). Consider negotiating fixed-fee contracts.`);
                } else if (percentage < benchmark - 0.1) {
                    suggestions.push(`${cat} is currently under-resourced (${Math.round(percentage * 100)}%). This may lead to quality compromises in the delivery phase.`);
                }
            }
        });

        if (suggestions.length === 0 && eventBudget > 0) {
            suggestions.push("Your budget distribution mirrors high-performance industry models perfectly.");
        }

        res.status(200).json(suggestions);
    } catch (error) {
        res.status(500).json({ message: "Budget optimization engine error" });
    }
};

export const getVendorRecommendations = async (req, res) => {
    const { type, budget } = req.query;

    // Mock vendor database
    // Comprehensive Real-world Vendor Registry (India Focus)
    const allVendors = [
        // --- LUXURY / PREMIUM (₹₹₹ - ₹₹₹₹) ---
        {
            name: "The Taj Mahal Palace",
            service: "Venue",
            rating: 4.9,
            priceRange: "₹₹₹₹",
            startingPrice: 2500000,
            location: "Apollo Bunder, Mumbai, Maharashtra 400001",
            suitableFor: ["Wedding", "Conference", "Event"],
            description: "Iconic landmark offering legendary hospitality and grand ballrooms for high-profile weddings and corporate summits.",
            contact: "+91 22 6665 3366",
            email: "reservations.mumbai@tajhotels.com",
            specialty: "Heritage Grandeur & Royal Banquets"
        },
        {
            name: "Blue Sea Catering",
            service: "Catering",
            rating: 4.8,
            priceRange: "₹₹₹",
            startingPrice: 1500000,
            location: "Worli Sea Face, Mumbai, Maharashtra 400030",
            suitableFor: ["Wedding", "Conference", "Party"],
            description: "Award-winning gourmet catering specializing in exotic global cuisines and theatrical live stations for elite gatherings.",
            contact: "+91 22 2490 2222",
            email: "info@bluesea.in",
            specialty: "Signature Continental & Pan-Asian Fusion"
        },
        {
            name: "Sabyasachi Mukherjee Decor",
            service: "Decor",
            rating: 5.0,
            priceRange: "₹₹₹₹",
            startingPrice: 10000000,
            location: "Kala Ghoda, Mumbai, Maharashtra 400001",
            suitableFor: ["Wedding", "Other"],
            description: "Bespoke, high-couture event styling that blends traditional Indian craftsmanship with maximalist vintage aesthetics.",
            contact: "+91 33 4031 6000",
            email: "decor@sabyasachi.com",
            specialty: "Vintage Indian & Floral Maximalism"
        },
        {
            name: "Elite Pro-Live AV",
            service: "AV",
            rating: 4.9,
            priceRange: "₹₹₹",
            startingPrice: 800000,
            location: "Andheri East, Mumbai, Maharashtra 400069",
            suitableFor: ["Conference", "College Fest", "Event"],
            description: "Cutting-edge sound and light solutions for large-scale concerts, hybrid conferences, and stadium events.",
            contact: "+91 91234 56789",
            email: "solutions@eliteprolive.com",
            specialty: "3D Projection Mapping & Line-Array Audio"
        },

        // --- MID-RANGE (₹₹ - ₹₹₹) ---
        {
            name: "Novotel City Center",
            service: "Venue",
            rating: 4.6,
            priceRange: "₹₹",
            startingPrice: 500000,
            location: "Ahmedabad, Gujarat 380015",
            suitableFor: ["Conference", "Party", "Workshop"],
            description: "Modern, high-tech banquet halls and meeting rooms designed for efficiency and seamless business flow.",
            contact: "+91 80 6670 0600",
            email: "meetings@novotel.com",
            specialty: "Smart Tech & Modern Corporate Layouts"
        },
        {
            name: "Copper Chimney Catering",
            service: "Catering",
            rating: 4.7,
            priceRange: "₹₹",
            startingPrice: 300000,
            location: "Bandra West, Mumbai, Maharashtra 400050",
            suitableFor: ["Party", "Conference", "Wedding"],
            description: "Decades of culinary excellence bringing legendary North Indian flavors and tandoori specialties to your event.",
            contact: "+91 22 2492 4433",
            email: "catering@copperchimney.in",
            specialty: "Signature North Indian & Frontier Cuisine"
        },
        {
            name: "The Wedding Design Company",
            service: "Decor",
            rating: 4.7,
            priceRange: "₹₹₹",
            startingPrice: 1500000,
            location: "Greater Kailash, New Delhi 110048",
            suitableFor: ["Wedding", "Birthday", "Party"],
            description: "Creative design house focusing on thematic storytelling and modern chic setups for social celebrations.",
            contact: "+91 11 4678 9000",
            email: "hello@twdc.in",
            specialty: "Thematic Storytelling & Modern Chic"
        },
        {
            name: "Pixel Perfect Media",
            service: "Photography",
            rating: 4.8,
            priceRange: "₹₹",
            startingPrice: 200000,
            location: "Indiranagar, Bangalore, Karnataka 560038",
            suitableFor: ["Wedding", "Event", "Conference"],
            description: "Specializing in cinematic event coverage, traditional portraits, and high-speed delivery of digital assets.",
            contact: "+91 99887 76655",
            email: "lens@pixelperfect.in",
            specialty: "Cinematography & 4K Live Streaming"
        },

        // --- AFFORDABLE / BUDGET (₹ - ₹₹) ---
        {
            name: "Suburban Community Hall",
            service: "Venue",
            rating: 4.2,
            priceRange: "₹",
            startingPrice: 50000,
            location: "Borivali West, Mumbai, Maharashtra 400092",
            suitableFor: ["Party", "Workshop", "Other"],
            description: "Spacious and functional community environment ideal for local gatherings and budget-friendly social meetups.",
            contact: "+91 22 1234 5678",
            email: "bookings@suburban.org",
            specialty: "Functional Space & Easy Accessibility"
        },
        {
            name: "Street Bites Live",
            service: "Catering",
            rating: 4.5,
            priceRange: "₹",
            startingPrice: 75000,
            location: "Kothrud, Pune, Maharashtra 411038",
            suitableFor: ["College Fest", "Party"],
            description: "Fun and vibrant live food counters bringing hygienic street food favorites to your event.",
            contact: "+91 88776 65544",
            email: "bite@streetbites.in",
            specialty: "Live Chaat & Global Street Snacks"
        },
        {
            name: "Eco-Friendly Decorators",
            service: "Decor",
            rating: 4.4,
            priceRange: "₹",
            startingPrice: 150000,
            location: "Auroville, Pondicherry 605101",
            suitableFor: ["Wedding", "Party", "College Fest"],
            description: "Sustainable and beautiful decor using recycled materials, locally sourced flowers, and biodegradable elements.",
            contact: "+91 77665 54433",
            email: "earth@ecodecor.com",
            specialty: "Sustainable Design & Zero-Waste Setups"
        },
        {
            name: "Rent-A-Beam AV",
            service: "AV",
            rating: 4.3,
            priceRange: "₹",
            startingPrice: 20000,
            location: "Salt Lake City, Kolkata, West Bengal 700091",
            suitableFor: ["Workshop", "College Fest", "Other"],
            description: "Reliable equipment rentals for basic sound, projectors, and basic stage lighting at competitive prices.",
            contact: "+91 99001 12233",
            email: "rent@rentabeam.com",
            specialty: "Plug-and-Play AV & Projector Kits"
        },
        {
            name: "City-Swift Logistics",
            service: "Logistics",
            rating: 4.5,
            priceRange: "₹",
            startingPrice: 35000,
            location: "Whitefield, Bangalore, Karnataka 560066",
            suitableFor: ["Conference", "Event", "College Fest"],
            description: "Safe and efficient transport solutions for guests and equipment across urban centers.",
            contact: "+91 80 4433 2211",
            email: "logistic@cityswift.in",
            specialty: "Group Transport & Equipment Freight"
        }
    ];

    let recommendations = allVendors.filter(v => v.suitableFor.includes(type));

    // Fallback: If no specific recommendations, show top rated vendors
    if (recommendations.length === 0) {
        recommendations = allVendors.sort((a, b) => b.rating - a.rating).slice(0, 3);
    }

    res.status(200).json(recommendations);
};

export const askAiAssistant = async (req, res) => {
    const { message, eventId } = req.body;

    if (!genAI) {
        return res.status(200).json({
            response: "Gemini API key is not configured. Please use simple queries or add a valid key."
        });
    }

    try {
        const event = await Event.findById(eventId);
        const tasks = await Task.find({ event: new mongoose.Types.ObjectId(eventId) });
        const vendors = await Vendor.find({ event: new mongoose.Types.ObjectId(eventId) });
        const guests = await Guest.find({ event: new mongoose.Types.ObjectId(eventId) });

        if (!event) return res.status(404).json({ message: "Event not found" });

        // Calculate summary for context
        const totalCost = vendors.reduce((sum, v) => sum + (v.cost || 0), 0);
        const completedTasks = tasks.filter(t => t.status === "Completed").length;
        const totalTasks = tasks.length;
        const confirmedGuests = guests.filter(g => g.status === "Confirmed").length;
        const totalGuests = guests.length;

        const context = `
            You are Planora's AI Event Assistant. You have access to the following live data for the event "${event.title}":
            - Event Type: ${event.type}
            - Current Budget Usage: ₹${totalCost.toLocaleString()} spent out of ₹${event.budget.toLocaleString()}
            - Task Progress: ${completedTasks}/${totalTasks} tasks completed.
            - Guest Status: ${confirmedGuests}/${totalGuests} confirmed RSVPs.
            - Event Date: ${event.date}
            - Location: ${event.location}

            User Question: "${message}"

            Guidelines:
            1. Be helpful, professional, and concise.
            2. Use the provided data to give specific answers.
            3. If the user asks for suggestions, provide them based on the event type.
            4. Keep responses friendly and encouraging.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(context);
        const response = result.response.text();

        res.status(200).json({ response });
    } catch (error) {
        console.error("Gemini Error:", error);

        let userMessage = "I'm sorry, I'm having trouble thinking right now. Could you try asking again?";

        if (error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("Quota")) {
            userMessage = "I've reached my daily free-tier limit for a moment. Please wait a minute and try again; I'll be ready to help soon!";
        } else if (error.message?.includes("404")) {
            userMessage = "I'm experiencing a configuration issue. Please check your API key.";
        }

        res.status(200).json({ response: userMessage });
    }
};
