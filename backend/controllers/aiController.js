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
        console.error("Strategic Plan Generation Error:", error);
        res.status(500).json({ message: error.message || "Strategic engine failed to synthesize plan" });
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
    try {
        const { type, budget, eventId } = req.query;
        
        let remainingBudget = parseFloat(budget) || 1000000;
        let eventType = type || "Wedding";
        let bookedCategories = [];
        let eventTitle = "your event";
        let eventCity = "Mumbai";
        let eventCountry = "India";

        // If eventId is provided, get real precision data
        if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
            const event = await Event.findById(eventId);
            if (event) {
                const bookedVendors = await Vendor.find({ event: event._id });
                const totalSpent = bookedVendors.reduce((sum, v) => sum + (v.cost || 0), 0);
                remainingBudget = Math.max(0, event.budget - totalSpent);
                eventType = event.type;
                eventTitle = event.title;
                eventCity = event.city || "Mumbai";
                eventCountry = event.country || "India";
                bookedCategories = bookedVendors.map(v => v.service);
            }
        }

        const allVendors = [
            {
                name: "The Taj Mahal Palace",
                service: "Venue",
                rating: 4.9,
                priceRange: "₹₹₹₹",
                startingPrice: 2500000,
                city: "Mumbai",
                country: "India",
                location: "Apollo Bunder",
                suitableFor: ["Wedding", "Conference", "Event"],
                description: "Iconated heritage luxury for grand events.",
                contact: "+91 22 6665 3366"
            },
            {
                name: "Blue Sea Catering",
                service: "Catering",
                rating: 4.8,
                priceRange: "₹₹₹",
                startingPrice: 1500000,
                city: "Mumbai",
                country: "India",
                location: "Worli",
                suitableFor: ["Wedding", "Conference", "Party"],
                description: "Premium gourmet catering solutions.",
                contact: "+91 22 2490 2222"
            },
            {
                name: "Novotel Delhi Aerocity",
                service: "Venue",
                rating: 4.6,
                priceRange: "₹₹",
                startingPrice: 50000,
                city: "Delhi",
                country: "India",
                location: "Aerocity",
                suitableFor: ["Conference", "Party", "Workshop"],
                description: "Modern business-focused venue.",
                contact: "+91 80 6670 0600"
            },
            {
                name: "Eco-Friendly Decorators",
                service: "Decor",
                rating: 4.4,
                priceRange: "₹",
                startingPrice: 80000,
                city: "Delhi",
                country: "India",
                location: "Auroville",
                suitableFor: ["Wedding", "Party", "College Fest"],
                description: "Zero-waste sustainable event design.",
                contact: "+91 77665 54433"
            },
            {
                name: "Street Bites Live",
                service: "Catering",
                rating: 4.5,
                priceRange: "₹",
                startingPrice: 30000,
                city: "Pune",
                country: "India",
                location: "Kothrud",
                suitableFor: ["College Fest", "Party"],
                description: "Hygienic and vibrant live food counters.",
                contact: "+91 88776 65544"
            },
            {
                name: "The Ritz-Carlton, New York",
                service: "Venue",
                rating: 4.9,
                priceRange: "₹₹₹₹",
                startingPrice: 500000,
                city: "New York",
                country: "USA",
                location: "Central Park South",
                suitableFor: ["Wedding", "Conference"],
                description: "Legendary luxury in the heart of Manhattan.",
                contact: "+1 212 308 9100"
            },
            {
                name: "Empire Steak House",
                service: "Catering",
                rating: 4.7,
                priceRange: "₹₹₹",
                startingPrice: 150000,
                city: "New York",
                country: "USA",
                location: "Midtown",
                suitableFor: ["Party", "Corporate"],
                description: "Classic American steakhouse gourmet catering.",
                contact: "+1 212 555 0199"
            }
        ];

        // Systemic Filtering
        // 1. Filter by budget and suitability
        let filtered = allVendors.filter(v => {
            // Broaden suitability check: if event is Birthday, match "Party" vendors, etc.
            const broaderMapping = {
                "Birthday": "Party",
                "Tech Summits": "Conference",
                "Corporate": "Conference",
                "Other": "Event"
            };
            const targetTag = broaderMapping[eventType] || eventType;
            
            return (v.suitableFor.includes(targetTag) || v.suitableFor.includes("Event")) && 
                   v.startingPrice <= remainingBudget;
        });

        // 2. Prioritize Country then City Match
        filtered.sort((a, b) => {
            const aCountryMatch = a.country?.toLowerCase() === eventCountry?.toLowerCase();
            const bCountryMatch = b.country?.toLowerCase() === eventCountry?.toLowerCase();
            
            if (aCountryMatch && !bCountryMatch) return -1;
            if (!aCountryMatch && bCountryMatch) return 1;

            const aCityMatch = a.city?.toLowerCase() === eventCity?.toLowerCase();
            const bCityMatch = b.city?.toLowerCase() === eventCity?.toLowerCase();
            
            if (aCityMatch && !bCityMatch) return -1;
            if (!aCityMatch && bCityMatch) return 1;

            // Then booked categories
            const aBooked = bookedCategories.includes(a.service);
            const bBooked = bookedCategories.includes(b.service);
            if (!aBooked && bBooked) return -1;
            if (aBooked && !bBooked) return 1;

            return b.rating - a.rating;
        });

        const topPicks = filtered.slice(0, 3);

        // Enhance with Groq Match Reason
        if (process.env.GROQ_API_KEY && topPicks.length > 0) {
            try {
                const prompt = `
                    You are an expert event planner. Recommend these ${topPicks.length} vendors for "${eventTitle}" in "${eventCity}, ${eventCountry}" with a remaining budget of ₹${remainingBudget.toLocaleString()}.
                    Vendors: ${topPicks.map(v => `${v.name} (Located in ${v.city}, ${v.country}, Starts at ₹${v.startingPrice})`).join(", ")}.
                    For each vendor, write a 1-sentence "Match Reason" explaining why it fits this specific geography (country/city), budget and event type.
                    Return ONLY a raw JSON array of strings, nothing else. Example: ["reason 1", "reason 2"]
                `;
                const resultText = await generateGroqCompletion(prompt);
                const reasons = JSON.parse(resultText.replace(/```json|```/g, "").trim());
                
                topPicks.forEach((v, i) => {
                    v.matchReason = reasons[i] || `Ideal ${v.service} choice for events in ${v.city}, ${v.country}.`;
                });
            } catch (err) {
                if (err.message && err.message.includes("429")) {
                    console.warn("[Optimization Engine] Vendor AI feature rate limited. Using fast fallback matches.");
                } else {
                    console.error("[Optimization Engine] Gemini Recommendation Error (Non-Quota):", err.message);
                }
                topPicks.forEach(v => v.matchReason = `Expert ${v.service} optimized for your budget.`);
            }
        } else {
            topPicks.forEach(v => v.matchReason = `Localized ${v.service} expert optimized for your budget.`);
        }

        res.status(200).json(topPicks);
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
