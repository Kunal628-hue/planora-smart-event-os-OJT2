import Event from "../models/Event.js";
import Task from "../models/Task.js";
import Vendor from "../models/Vendor.js";
import Guest from "../models/Guest.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const generateGroqCompletion = async (prompt) => {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing");
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

/**
 * AI STRATEGIC PLANNING ENGINE
 * Goal: Create a professional, granular budget division plan for Indian context.
 */
export const generateStrategicPlan = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event context lost" });

        const totalBudget = event.budget || 0;
        if (totalBudget === 0) {
            return res.status(400).json({ message: "Event budget is set to ₹0. Please define a budget in Event Settings before generating a strategic plan." });
        }

        const safetyBuffer = Math.round(totalBudget * 0.10);
        const allocatableBudget = totalBudget - safetyBuffer;

        console.log(`[AI Strategist] Generating plan for ${event.title} | Budget: ₹${totalBudget}`);

        const prompt = `
            You are an elite Indian Event Strategist. Generate a granular budget division plan for a "${event.type}" named "${event.title}" with a total budget of ₹${totalBudget.toLocaleString()}.

            STRICT REQUIREMENTS:
            1. LUXURY SCALE: If budget < 5L (Budget), 5L-20L (Premium), >20L (Luxury). Current: ₹${totalBudget}. Adjust task descriptions and item complexity accordingly.
            2. 90/10 RULE: Allocate exactly ₹${allocatableBudget} (90%) across 6-8 categories. Reserve exactly ₹${safetyBuffer} (10%) as an 'Unallocated Safety Buffer'.
            3. INDIAN CONTEXT: Focus on Indian meal timings (Breakfast, Lunch, High Tea, Dinner, Late Night Bites) and specific program-wise tasks (Haldi Decor, Mehendi Artist, Sangeet Choreography, etc.).
            4. ITEMIZATION: Every task within a category must have a specific 'price' (₹ amount).
            5. RATIONALE: Provide a 2-3 sentence strategic rationale (no emojis) explaining why this distribution is optimized for this budget scale.

            OUTPUT FORMAT:
            Return ONLY a valid JSON object with this structure:
            {
              "rationale": "Strategic reasoning goes here...",
              "safetyBuffer": ${safetyBuffer},
              "categories": [
                {
                  "name": "Catering: Wedding Dinner",
                  "allocated": 500000,
                  "tasks": [
                    { "name": "Main Course Live Counters", "price": 300000 },
                    { "name": "Dessert Bar & Exotic Fruits", "price": 200000 }
                  ]
                }
              ]
            }
        `;

        const aiResponse = await generateGroqCompletion(prompt);
        console.log(`[AI Strategist] AI Response received (Length: ${aiResponse.length})`);
        
        // Robust JSON Extraction
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("[AI Strategist] Failed to find JSON in response:", aiResponse);
            throw new Error("AI failed to return a valid strategic document.");
        }
        
        const plan = JSON.parse(jsonMatch[0]);
        console.log(`[AI Strategist] Plan synthesized successfully with ${plan.categories?.length} categories.`);

        res.status(200).json(plan);
    } catch (error) {
        return handleControllerError(res, error, "Strategic engine failed to synthesize plan. Please try again.");
    }
};

export const applyStrategicPlan = async (req, res) => {
    try {
        const { eventId, plan, userId } = req.body;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // 1. Clear existing AI-generated tasks/vendors if needed? 
        // For now, we append but maybe mark them.
        
        const tasksToCreate = [];
        const vendorsToCreate = [];

        plan.categories.forEach(cat => {
            cat.tasks.forEach(task => {
                // Add to Workflow Milestones
                tasksToCreate.push({
                    title: task.name,
                    description: `AI Suggested Task for ${cat.name}`,
                    budget: task.price,
                    status: "To Do",
                    event: eventId,
                    user: userId,
                    dueDate: event.date // Default to event date
                });

                // Add to Financial Ledger (Expenses)
                const lowerCat = cat.name.toLowerCase();
                let service = "Operations";
                if (lowerCat.includes("catering") || lowerCat.includes("food") || lowerCat.includes("meal")) service = "Catering";
                else if (lowerCat.includes("decor") || lowerCat.includes("design")) service = "Decor";
                else if (lowerCat.includes("photo") || lowerCat.includes("video")) service = "Photography";
                else if (lowerCat.includes("venue") || lowerCat.includes("hall")) service = "Venue";
                else if (lowerCat.includes("music") || lowerCat.includes("entertainment") || lowerCat.includes("dj")) service = "Entertainment";
                else if (lowerCat.includes("logistics") || lowerCat.includes("transport")) service = "Logistics";

                vendorsToCreate.push({
                    name: task.name,
                    service: service,
                    cost: task.price,
                    status: "Inquiry", // Planned/Suggested
                    event: eventId,
                    user: userId
                });
            });
        });

        await Task.insertMany(tasksToCreate);
        await Vendor.insertMany(vendorsToCreate);

        console.log(`[AI Strategist] Successfully applied plan to ${eventId}. Created ${tasksToCreate.length} tasks and ${vendorsToCreate.length} ledger entries.`);

        res.status(200).json({ message: "Strategic Plan synchronized successfully", tasksCount: tasksToCreate.length });
    } catch (error) {
        console.error("Apply Plan Error:", error);
        res.status(500).json({ message: "Failed to synchronize strategic plan" });
    }
};

export const getEventHealth = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId).lean();
        if (!event) return res.status(404).json({ message: "Event not found" });

        const tasks = await Task.find({ event: new mongoose.Types.ObjectId(eventId) }).lean();
        const vendors = await Vendor.find({ event: new mongoose.Types.ObjectId(eventId) }).lean();
        const guests = await Guest.find({ event: new mongoose.Types.ObjectId(eventId) }).lean();

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
        const event = await Event.findById(eventId).lean();
        if (!event) return res.status(404).json({ message: "Strategic Context not found" });

        const tasks = await Task.find({ event: new mongoose.Types.ObjectId(eventId) }).lean();
        const vendors = await Vendor.find({ event: new mongoose.Types.ObjectId(eventId) }).lean();
        const guests = await Guest.find({ event: new mongoose.Types.ObjectId(eventId) }).lean();

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

const vendorMatchCache = new Map();

export const getVendorRecommendations = async (req, res) => {
    try {
        const { type, budget, eventId } = req.query;
        const cacheKey = `${eventId || type || 'default'}`;

        // Return cached vendor recommendations if requested within 10 minutes
        if (vendorMatchCache.has(cacheKey)) {
            const cached = vendorMatchCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
                return res.status(200).json(cached.data);
            }
        }
        
        let remainingBudget = parseFloat(budget) || 1000000;
        let totalBudget = parseFloat(budget) || 1500000;
        let eventType = type || "Wedding";
        let eventTitle = "your event";
        let eventCity = "Mumbai";
        let eventLocation = "Bandra West";
        let eventCountry = "India";

        if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
            const event = await Event.findById(eventId).lean();
            if (event) {
                const bookedVendors = await Vendor.find({ event: event._id }).lean();
                const totalSpent = bookedVendors.reduce((sum, v) => sum + (v.cost || 0), 0);
                totalBudget = event.budget || 1500000;
                remainingBudget = Math.max(0, totalBudget - totalSpent);
                eventType = event.type || "Wedding";
                eventTitle = event.title || event.name || "Event";
                eventCity = event.city || event.location || "Mumbai";
                eventLocation = event.location || "City Center";
                eventCountry = event.country || "India";
            }
        }

        const getPriceTier = (b) => {
            if (b >= 2500000) return "₹₹₹₹";
            if (b >= 1000000) return "₹₹₹";
            if (b >= 300000) return "₹₹";
            return "₹";
        };

        const budgetTier = getPriceTier(totalBudget);

        // 1. High Level AI Generation via Groq AI
        if (process.env.GROQ_API_KEY) {
            try {
                const prompt = `
                    You are an elite event concierge and vendor matchmaking AI.
                    Generate 5 high-level vendor recommendations tailored specifically for:
                    - Event Type: "${eventType}"
                    - Event Title: "${eventTitle}"
                    - Location / City: "${eventCity}, ${eventLocation}, ${eventCountry}"
                    - Total Event Budget: ₹${totalBudget.toLocaleString("en-IN")}
                    - Remaining Budget: ₹${remainingBudget.toLocaleString("en-IN")}
                    - Price Scale Tier: ${budgetTier}

                    CRITICAL REQUIREMENTS:
                    1. LOCATION WISE: Recommend top real/well-known venues, caterers, decorators, AV teams, or photographers that operate directly in or near "${eventCity}, ${eventCountry}".
                    2. BUDGET WISE: The prices and tier MUST match the ${budgetTier} scale (e.g. for ₹25L+ budget recommend luxury 5-star venues & premium caterers; for ₹5L budget recommend boutique & mid-tier vendors). Starting prices must be within ₹${remainingBudget.toLocaleString("en-IN")}.
                    3. EVENT TYPE WISE: Pick services essential to a "${eventType}" (e.g., Wedding: Heritage Venue, Gourmet Dining, Luxury Stage Decor, Cinematic Photo; Conference: Business Hotel Hall, AV & Live Stream, Executive Lunch; College Fest: Concert Arena, Pro Audio, Street Food Stalls).

                    Return ONLY a valid raw JSON array of 5 objects (NO MARKDOWN WRAPPERS) matching this format:
                    [
                      {
                        "name": "Vendor Name",
                        "service": "Venue",
                        "rating": 4.9,
                        "priceRange": "${budgetTier}",
                        "startingPrice": 500000,
                        "city": "${eventCity}",
                        "country": "${eventCountry}",
                        "location": "${eventLocation}",
                        "suitableFor": ["${eventType}"],
                        "description": "High level description highlighting why this vendor excels.",
                        "contact": "+91 98765 43210",
                        "email": "contact@vendor.com",
                        "matchReason": "Ideal ${budgetTier} Venue choice for ${eventType} in ${eventCity}."
                      }
                    ]
                `;

                const aiResponse = await generateGroqCompletion(prompt);
                const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const aiVendors = JSON.parse(jsonMatch[0]);
                    if (Array.isArray(aiVendors) && aiVendors.length > 0) {
                        vendorMatchCache.set(cacheKey, { timestamp: Date.now(), data: aiVendors });
                        return res.status(200).json(aiVendors);
                    }
                }
            } catch (err) {
                console.warn("[AI Match Engine] Groq vendor generation fallback:", err.message);
            }
        }

        // 2. High Level Location & Budget Curated Fallback Matrix
        const fallbackCatalog = [
            {
                name: "The Taj Mahal Palace",
                service: "Venue",
                rating: 4.9,
                priceRange: "₹₹₹₹",
                startingPrice: 2500000,
                city: "Mumbai",
                country: "India",
                location: "Apollo Bunder",
                suitableFor: ["Wedding", "Conference", "Corporate Gala"],
                description: "Heritage luxury sea-facing landmark for elite grand events.",
                contact: "+91 22 6665 3366",
                email: "tajmumbai@tajhotels.com",
                matchReason: `Premier luxury venue matched for high-scale ${eventType} in Mumbai.`
            },
            {
                name: "Blue Sea Catering & Banquets",
                service: "Catering",
                rating: 4.8,
                priceRange: "₹₹₹",
                startingPrice: 600000,
                city: "Mumbai",
                country: "India",
                location: "Worli Sea Face",
                suitableFor: ["Wedding", "Conference", "Party"],
                description: "Master culinary team crafting bespoke global and Indian menus.",
                contact: "+91 22 2490 2222",
                email: "info@blueseacatering.com",
                matchReason: `High-capacity gourmet catering optimized for ${eventType} in Mumbai.`
            },
            {
                name: "Vivaah Couture Decor",
                service: "Decor",
                rating: 4.9,
                priceRange: "₹₹₹",
                startingPrice: 450000,
                city: "Mumbai",
                country: "India",
                location: "Juhu",
                suitableFor: ["Wedding", "Party", "Corporate Gala"],
                description: "Architectural floral installations and thematic luxury lighting.",
                contact: "+91 98200 11223",
                email: "designs@vivaahcouture.com",
                matchReason: `Premium bespoke decor tailored for ${eventCity} venues.`
            },
            {
                name: "Taj Rambagh Palace",
                service: "Venue",
                rating: 5.0,
                priceRange: "₹₹₹₹",
                startingPrice: 3500000,
                city: "Jaipur",
                country: "India",
                location: "Bhawani Singh Road",
                suitableFor: ["Wedding", "Corporate Gala"],
                description: "The Jewel of Jaipur — legendary royal palace grounds.",
                contact: "+91 141 238 5700",
                email: "rambagh.jaipur@tajhotels.com",
                matchReason: `Royal heritage palace destination matched for ${eventType} in Jaipur.`
            },
            {
                name: "Fairmont Jaipur",
                service: "Venue",
                rating: 4.8,
                priceRange: "₹₹₹",
                startingPrice: 1800000,
                city: "Jaipur",
                country: "India",
                location: "Riico Kukas",
                suitableFor: ["Wedding", "Conference"],
                description: "Mughal and Rajput grand banquet architecture.",
                contact: "+91 141 660 8888",
                email: "jaipur@fairmont.com",
                matchReason: `Luxurious grand hall for high-capacity ${eventType} in Jaipur.`
            },
            {
                name: "The Imperial New Delhi",
                service: "Venue",
                rating: 4.9,
                priceRange: "₹₹₹₹",
                startingPrice: 2200000,
                city: "Delhi",
                country: "India",
                location: "Janpath",
                suitableFor: ["Wedding", "Conference", "Corporate"],
                description: "Iconic Victorian heritage banqueting in central Delhi.",
                contact: "+91 11 2334 1234",
                email: "stay@theimperialindia.com",
                matchReason: `Elite central venue matched for ${eventType} in Delhi.`
            },
            {
                name: "Seasons Gourmet Catering",
                service: "Catering",
                rating: 4.7,
                priceRange: "₹₹₹",
                startingPrice: 500000,
                city: "Delhi",
                country: "India",
                location: "Aerocity",
                suitableFor: ["Wedding", "Conference", "Party"],
                description: "Award-winning live interactive culinary counters.",
                contact: "+91 98110 44556",
                email: "events@seasonsgroup.in",
                matchReason: `Top-rated catering partner for ${eventType} in Delhi NCR.`
            },
            {
                name: "The Leela Palace Bengaluru",
                service: "Venue",
                rating: 4.9,
                priceRange: "₹₹₹₹",
                startingPrice: 2000000,
                city: "Bengaluru",
                country: "India",
                location: "HAL Old Airport Road",
                suitableFor: ["Wedding", "Conference", "Product Launch"],
                description: "Palatial grandeur surrounded by lush tropical gardens.",
                contact: "+91 80 2521 1234",
                email: "reservations.bangalore@theleela.com",
                matchReason: `Tech & luxury hub venue matched for ${eventType} in Bengaluru.`
            },
            {
                name: "Silicon Sound & Stage AV",
                service: "AV & Tech",
                rating: 4.8,
                priceRange: "₹₹",
                startingPrice: 250000,
                city: "Bengaluru",
                country: "India",
                location: "Indiranagar",
                suitableFor: ["Conference", "College Fest", "Product Launch"],
                description: "Pro line-array sound, 4K LED walls, and live streaming rigs.",
                contact: "+91 98450 33445",
                email: "ops@siliconsound.in",
                matchReason: `High-tech AV setup tailored for ${eventType} tech requirements.`
            },
            {
                name: "W Goa Resort",
                service: "Venue",
                rating: 4.8,
                priceRange: "₹₹₹₹",
                startingPrice: 2800000,
                city: "Goa",
                country: "India",
                location: "Vagator Beach",
                suitableFor: ["Wedding", "Party", "Music Festival"],
                description: "Vibrant clifftop luxury oceanfront event lawns.",
                contact: "+91 832 671 8888",
                email: "w.goa@whotels.com",
                matchReason: `Destination beachfront venue matched for ${eventType} in Goa.`
            },
            {
                name: "JW Marriott Pune",
                service: "Venue",
                rating: 4.8,
                priceRange: "₹₹₹",
                startingPrice: 1500000,
                city: "Pune",
                country: "India",
                location: "Senapati Bapat Road",
                suitableFor: ["Wedding", "Conference", "Corporate Gala"],
                description: "Grand ballroom and rooftop lounge spaces.",
                contact: "+91 20 6683 3333",
                email: "jw.pune@marriott.com",
                matchReason: `Premium city center venue matched for ${eventType} in Pune.`
            }
        ];

        // Systemic Filtering by Location and Budget
        let filtered = fallbackCatalog.filter(v => {
            const matchesCity = v.city.toLowerCase() === eventCity.toLowerCase();
            const matchesCountry = v.country.toLowerCase() === eventCountry.toLowerCase();
            const matchesType = v.suitableFor.some(t => t.toLowerCase() === eventType.toLowerCase());
            return matchesCity || matchesCountry || matchesType;
        });

        if (filtered.length === 0) filtered = fallbackCatalog;

        // Sort by Location Precision and Rating
        filtered.sort((a, b) => {
            const aCityMatch = a.city.toLowerCase() === eventCity.toLowerCase();
            const bCityMatch = b.city.toLowerCase() === eventCity.toLowerCase();
            if (aCityMatch && !bCityMatch) return -1;
            if (!aCityMatch && bCityMatch) return 1;
            return b.rating - a.rating;
        });

        const finalVendors = filtered.slice(0, 5);
        vendorMatchCache.set(cacheKey, { timestamp: Date.now(), data: finalVendors });
        res.status(200).json(finalVendors);
    } catch (error) {
        console.error("Vendor Recommendation Error:", error);
        res.status(500).json({ message: "Engine Failure" });
    }
};

export const askAiAssistant = async (req, res) => {
    const { message, eventId } = req.body;

    if (!process.env.GROQ_API_KEY) {


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
        const pendingTasksList = tasks.filter(t => t.status !== "Completed").map(t => `- ${t.title} (${t.dueDate})`).join("\n");
        const vendorsList = vendors.map(v => `- ${v.name} (${v.service}): ₹${v.cost.toLocaleString()}`).join("\n");
        const confirmedGuests = guests.filter(g => g.status === "Confirmed").length;
        const totalGuests = guests.length;

        const context = `
            You are Planora's AI Strategic Operations Unit. You are a highly advanced intelligence model integrated into the Smart Event OS.
            
            Current Operational Context for "${event.title}":
            - Event Configuration: ${event.type} in ${event.location}, ${event.city}.
            - Financial Health: Spent ₹${totalCost.toLocaleString()} of total budget ₹${event.budget.toLocaleString()}.
            - Remaining Liquidity: ₹${(event.budget - totalCost).toLocaleString()}.
            - Operational Status: ${completedTasks}/${totalTasks} milestones secured.
            - Logistics: ${confirmedGuests}/${totalGuests} guests deployment confirmed.
            - Temporal Reference: Event date is set for ${event.date}.

            Critical Pending Milestones:
            ${pendingTasksList || "All tactical objectives achieved."}

            Active Vendor Matrix:
            ${vendorsList || "No external assets deployed yet."}

            User Query: "${message}"

            Strategic Directives:
            1. Response Quality: Provide high-density, actionable insights. Use the data above to answer specifically.
            2. Language: Use professional, tactical terminology (e.g., "Operational liquidity," "Milestone status").
            3. Formatting: 
               - Use **Bold** for all numerical values and critical terms.
               - Use Markdown Tables for budget breakdowns if requested.
               - Use hierarchical bullet points for multi-step strategies.
            4. Restrictions: STRICTLY NO EMOJIS. No conversational fluff.
            5. Analysis: If budget is over 90%, issue a "Financial Risk Advisory". If tasks are behind, suggest "Operational Acceleration".
        `;

        const response = await generateGroqCompletion(context);

        res.status(200).json({ response });
    } catch (error) {
        if (error.message?.includes("429") || error.message?.includes("quota")) {
            console.warn("[Neural Chatbot] AI quota exhausted. Sending fallback message to user.");
        } else {
            console.error("[Neural Chatbot] Backend Error:", error.message);
        }
        let userMessage = "I'm sorry, I'm having trouble thinking right now. Could you try asking again?";

        if (error.message?.includes("429") || error.message?.includes("quota")) {
            userMessage = "I've reached my limit. Please wait a moment.";
        } else if (error.message?.includes("404")) {
            userMessage = "I'm experiencing a configuration issue. Please check your API key.";
        }

        res.status(200).json({ response: userMessage });
    }
};

/**
 * AI DESCRIPTION POLISHER
 * Takes event details and optional short draft text and expands it into a polished, professional description.
 */
export const polishDescription = async (req, res) => {
    try {
        const { title, type, location, city, country, date, shortDescription } = req.body;

        const eventTitle = title || "Upcoming Event";
        const category = type || "Special Event";
        const venue = [location, city, country].filter(Boolean).join(", ") || "TBD Location";
        const eventDate = date || "Upcoming Date";
        const draftText = shortDescription ? `User's draft notes/points:\n"${shortDescription}"` : "User provided no initial draft text.";

        const prompt = `
            You are an elite event curator, copywriter, and experience architect.
            Draft a comprehensive, compelling, professional event description for the following event:

            - Event Title: "${eventTitle}"
            - Category / Type: "${category}"
            - Venue / Location: "${venue}"
            - Date: "${eventDate}"
            - ${draftText}

            INSTRUCTIONS:
            1. Expand the details and draft notes into a structured, highly engaging event description (2 to 3 paragraphs).
            2. Cover the core vision, expected highlights, atmosphere, and key reasons attendees should participate.
            3. Use elegant, clean formatting with clear paragraphs. Do NOT include markdown code blocks or JSON formatting. Output plain polished description text ONLY.
            4. STRICTLY NO EMOJIS. Maintain an executive, highly professional tone throughout.
        `;

        let polishedText = "";
        if (process.env.GROQ_API_KEY) {
            try {
                polishedText = await generateGroqCompletion(prompt);
                // Strip quotes if AI wrapped the entire output in quotes
                polishedText = polishedText.trim().replace(/^"(.*)"$/s, '$1');
            } catch (err) {
                console.warn("[AI Polisher] Fallback due to Groq error:", err.message);
            }
        }

        if (!polishedText) {
            // Elegant fallback if AI key is missing or errored
            polishedText = `Join us for ${eventTitle}, a premier ${category} taking place at ${venue} on ${eventDate}. ${shortDescription ? shortDescription + " " : ""}This event brings together participants for an unforgettable experience filled with engaging sessions, networking opportunities, and key highlights tailored for every attendee. Reserve your spot today to be part of this exceptional gathering!`;
        }

        res.status(200).json({ polishedDescription: polishedText });
    } catch (error) {
        console.error("Polish Description Error:", error);
        res.status(500).json({ message: "Failed to polish description. Please try again." });
    }
};

/**
 * AI BANNER GENERATOR (Gemini Nanobanana Lite Image Engine)
 * Takes event parameters and generates an aesthetic, high-resolution 1200x400 header banner.
 */
export const generateBanner = async (req, res) => {
    try {
        const { title, type, location, city, description, stylePrompt } = req.body;

        const eventTitle = title || "Special Event";
        const category = type || "Event";
        const eventLocation = [location, city].filter(Boolean).join(", ") || "";
        const details = description ? description.substring(0, 200) : "";

        const fullText = `${eventTitle} ${category} ${details} ${eventLocation}`.toLowerCase();

        // 1. Intelligent Sub-Theme & Keyword Detector for ultra-accurate visual scenes
        let baseTheme = "Atmospheric luxury event hall venue, elegant ambient mood lighting, cinematic architecture wallpaper background";

        if (fullText.includes("haldi")) {
            baseTheme = "Indian Haldi ceremony venue, bright sunshine yellow marigold flower garlands, traditional brass urli bowl, marigold flower drapes, warm cheerful morning sunlight photography";
        } else if (fullText.includes("mehendi") || fullText.includes("mehndi")) {
            baseTheme = "Indian Mehendi garden party venue, vibrant emerald green foliage, colourful floral canopy, bohemian outdoor seating, fairy lights, festive Indian decor";
        } else if (fullText.includes("sangeet") || fullText.includes("music night") || fullText.includes("musical")) {
            baseTheme = "Indian Sangeet night celebration stage, royal purple and magenta LED illuminated backdrop, twinkling fairy light curtains, musical instrument decor, luxury palace stage";
        } else if (fullText.includes("reception") || fullText.includes("banquet")) {
            baseTheme = "Grand luxury wedding reception banquet hall, opulent crystal chandeliers, white and gold floral centerpieces, elegant candlelit dining, royal interior design";
        } else if (category === "Wedding" || fullText.includes("wedding") || fullText.includes("marriage") || fullText.includes("shaadi")) {
            baseTheme = "Indian luxury royal palace wedding mandap, golden stage pillars, red and marigold floral drapery, soft warm lanterns, opulent royal courtyard venue";
        } else if (category === "Hackathon" || fullText.includes("hackathon") || fullText.includes("code") || fullText.includes("developer")) {
            baseTheme = "Bustling high-tech hackathon event hall, software developers working at workstations with glowing laptop screens, neon purple and cyan LED stage backdrop, vibrant computer coding summit venue";
        } else if (fullText.includes("gaming") || fullText.includes("esports")) {
            baseTheme = "Illuminated esports stadium arena, glowing blue and red neon gaming mainstage, futuristic dark ambient lighting, high tech wallpaper";
        } else if (fullText.includes("ai") || fullText.includes("robotics") || fullText.includes("tech fest") || category === "Tech Fest") {
            baseTheme = "Futuristic tech innovation summit venue, massive glowing blue LED screens, interactive holographic display elements, modern high-tech exhibition stage";
        } else if (category === "Tech Event" || fullText.includes("tech")) {
            baseTheme = "Sleek modern tech conference keynote stage, glowing dark blue cyan backdrop, futuristic architectural lighting, professional summit venue";
        } else if (fullText.includes("gala") || fullText.includes("award") || fullText.includes("red carpet")) {
            baseTheme = "Glamorous red carpet award gala night stage, golden trophy spotlights, luxury crystal ballroom, elegant black-tie event venue";
        } else if (fullText.includes("concert") || fullText.includes("edm") || fullText.includes("dj")) {
            baseTheme = "Epic music concert festival mainstage, dramatic laser beam spotlights, moving light heads, festival crowd silhouettes, vibrant smoke and lights";
        } else if (category === "College Fest" || fullText.includes("college") || fullText.includes("campus")) {
            baseTheme = "Vibrant energetic campus festival stage, colorful laser lights, party crowd silhouette, festival beams and celebratory atmosphere";
        } else if (category === "Birthday" || fullText.includes("birthday")) {
            baseTheme = "Elegant luxury birthday party setup, glowing golden helium balloon backdrop wall, twinkling fairy lights, warm celebratory aesthetic";
        } else if (category === "Corporate" || fullText.includes("corporate") || fullText.includes("executive")) {
            baseTheme = "Modern glass corporate auditorium, executive event stage, sleek architectural interior with warm professional spotlights";
        } else if (fullText.includes("food") || fullText.includes("culinary") || fullText.includes("feast")) {
            baseTheme = "Gourmet food festival banquet setup, luxury outdoor dining table, warm festoon string lights, elegant culinary display";
        }

        let visualScene = baseTheme;

        // 2. Groq AI Visual Art Director Prompt Synthesis
        if (process.env.GROQ_API_KEY) {
            try {
                const promptDraft = `
                    You are a world-class visual art director generating text-to-image prompts for high-resolution event header banners.
                    Create a detailed, hyperrealistic visual scene description for an image banner:

                    - Event Title: "${eventTitle}"
                    - Category/Type: "${category}"
                    - Location: "${eventLocation}"
                    - Description details: "${details}"
                    - Theme baseline: "${baseTheme}"
                    - Style: "${stylePrompt || "photorealistic cinematic high resolution luxury event photography"}"

                    STRICT RULES:
                    1. Describe the VISUAL SCENE ONLY (decorations, stage, venue, lighting, color palette, atmosphere, background elements).
                    2. DO NOT include any text, title, words, logos, alphabet letters, or typography in the scene description.
                    3. Ensure the scene is highly relevant and visually stunning for this specific event. Include concrete subjects (e.g. laptops, screens, stage, flowers, chandeliers).
                    4. Keep it under 45 words.
                    5. Return ONLY the visual description string without intro text or quotes.
                `;
                const aiVisualPrompt = await generateGroqCompletion(promptDraft);
                if (aiVisualPrompt && aiVisualPrompt.trim().length > 10) {
                    visualScene = aiVisualPrompt.replace(/^"(.*)"$/s, '$1').trim();
                }
            } catch (err) {
                console.warn("[AI Banner Engine] Prompt craft fallback:", err.message);
            }
        }

        // 3. Sanitize out any text/typography references so AI doesn't render broken letters
        const sanitizedScene = visualScene
            .replace(/\b(text|words|title|typography|letters|font|logo|banner graphic|header|quote|writing)\b/gi, "")
            .replace(/['"$&<>]/g, "")
            .trim();

        // 4. Construct hyperrealistic 8K photorealistic landscape prompt
        const fullPrompt = `${sanitizedScene}, photographed on 35mm lens, f/1.8 depth of field, 8k resolution wallpaper background, cinematic ambient lighting, photorealistic wide landscape view, clean background, no text, no words`;

        // 5. Check if GEMINI_API_KEY / GOOGLE_API_KEY is available for direct Gemini Imagen generation
        let bannerUrl = "";
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        if (geminiKey) {
            try {
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`;
                const geminiRes = await fetch(geminiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        instances: [{ prompt: fullPrompt }],
                        parameters: {
                            sampleCount: 1,
                            aspectRatio: "16:9",
                            outputMimeType: "image/jpeg"
                        }
                    })
                });

                if (geminiRes.ok) {
                    const geminiData = await geminiRes.json();
                    const b64Data = geminiData?.predictions?.[0]?.bytesBase64Encoded;
                    if (b64Data) {
                        const fs = await import("fs");
                        const path = await import("path");
                        const uploadDir = path.join(process.cwd(), "uploads", "banners");
                        if (!fs.existsSync(uploadDir)) {
                            fs.mkdirSync(uploadDir, { recursive: true });
                        }
                        const filename = `gemini-banner-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
                        const filePath = path.join(uploadDir, filename);
                        fs.writeFileSync(filePath, Buffer.from(b64Data, "base64"));
                        bannerUrl = `/uploads/banners/${filename}`;
                        console.log(`[Gemini Banner Engine] Generated native Gemini Imagen banner: ${bannerUrl}`);
                    }
                } else {
                    const errText = await geminiRes.text();
                    console.warn("[Gemini Banner Engine] API response error, falling back to Flux:", geminiRes.status, errText);
                }
            } catch (err) {
                console.error("[Gemini Banner Engine] Gemini Imagen error:", err.message);
            }
        }

        // Generate banner using high-definition Flux model
        if (!bannerUrl) {
            const seed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(fullPrompt);
            bannerUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=400&nologo=true&seed=${seed}&model=flux&enhance=true`;
        }

        res.status(200).json({ 
            bannerUrl, 
            prompt: fullPrompt,
            model: "flux"
        });
    } catch (error) {
        console.error("Banner Generation Error:", error);
        res.status(500).json({ message: "Failed to generate AI event banner." });
    }
};

