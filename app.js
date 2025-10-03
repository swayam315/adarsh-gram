// js/app.js

class AdarshGramAI {
    constructor() {
        this.issues = JSON.parse(localStorage.getItem('issues')) || [];
        this.projects = JSON.parse(localStorage.getItem('projects')) || [];
        this.map = null;
        this.init();
    }

    init() {
        console.log('🚀 Initializing Adarsh Gram AI Platform...');
        this.loadDashboard();
        this.initMap();
        this.setupServiceWorker();
        this.setupOfflineDetection();
        
        // Load sample data for demo
        this.loadSampleData();
    }

    loadSampleData() {
        if (this.issues.length === 0) {
            this.issues = [
                {
                    id: 1,
                    text: "Water pump not working near primary school. Children are bringing water from far away.",
                    category: "water",
                    sentiment: "NEGATIVE",
                    urgency: 9,
                    location: { lat: 28.6139, lng: 77.2090 },
                    timestamp: new Date().toISOString(),
                    aiAnalysis: {
                        textAnalysis: {
                            category: "water",
                            sentiment: "NEGATIVE",
                            location: "near primary school",
                            keyPhrases: ["water pump", "not working", "primary school", "children"]
                        }
                    }
                },
                {
                    id: 2,
                    text: "Road near hospital has large potholes causing traffic issues for ambulances.",
                    category: "roads",
                    sentiment: "NEGATIVE", 
                    urgency: 8,
                    location: { lat: 28.6129, lng: 77.2295 },
                    timestamp: new Date().toISOString(),
                    aiAnalysis: {
                        textAnalysis: {
                            category: "roads",
                            sentiment: "NEGATIVE",
                            location: "near hospital",
                            keyPhrases: ["road", "potholes", "hospital", "ambulances"]
                        }
                    }
                }
            ];
            this.saveToStorage();
        }
    }

    // AI-Powered Issue Analysis
    async analyzeAndSubmitIssue() {
        const issueText = document.getElementById('issue-text').value.trim();
        const photoFile = document.getElementById('issue-photo').files[0];
        
        if (!issueText) {
            alert('Please describe the issue before submitting.');
            return;
        }

        const analysisDiv = document.getElementById('ai-analysis-result');
        analysisDiv.innerHTML = `
            <div class="ai-result">
                <h4>🤖 AI Analysis in Progress</h4>
                <p>Analyzing your issue with natural language processing...</p>
                <div class="loading">🔄 Processing text, image, and calculating priority</div>
            </div>
        `;

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Text Analysis
            const textAnalysis = await this.analyzeTextWithAI(issueText);
            
            // Image Analysis (if provided)
            let imageAnalysis = null;
            if (photoFile) {
                imageAnalysis = await this.analyzeImageWithAI(photoFile);
            }

            // Calculate Priority
            const priorityScore = this.calculatePriority(textAnalysis, imageAnalysis);
            const category = textAnalysis.category;
            const sentiment = textAnalysis.sentiment;

            // Create issue object
            const issue = {
                id: Date.now(),
                text: issueText,
                category: category,
                sentiment: sentiment,
                urgency: priorityScore,
                location: this.generateRandomLocation(), // For demo
                timestamp: new Date().toISOString(),
                aiAnalysis: { textAnalysis, imageAnalysis },
                photo: photoFile ? URL.createObjectURL(photoFile) : null
            };

            this.issues.push(issue);
            this.saveToStorage();
            
            // Display AI results
            this.displayAIResults(issue, analysisDiv);
            this.loadDashboard();
            this.addToMap(issue);

            // Clear form
            document.getElementById('issue-text').value = '';
            document.getElementById('issue-photo').value = '';

        } catch (error) {
            console.error('AI Analysis failed:', error);
            analysisDiv.innerHTML = `
                <div class="ai-result" style="border-left-color: #ff9800;">
                    <h4>⚠️ AI Service Temporarily Unavailable</h4>
                    <p>Your issue has been saved locally and will be analyzed when connection is restored.</p>
                </div>
            `;
            this.saveIssueOffline(issueText, photoFile);
        }
    }

    // Text Analysis with AI
    async analyzeTextWithAI(text) {
        // Simulate AI processing
        return new Promise((resolve) => {
            setTimeout(() => {
                const analysis = {
                    category: this.categorizeIssue(text),
                    sentiment: this.analyzeSentiment(text),
                    location: this.extractLocation(text),
                    keyPhrases: this.extractKeyPhrases(text),
                    confidence: (Math.random() * 0.3 + 0.7).toFixed(2) // 0.7-1.0
                };
                resolve(analysis);
            }, 1500);
        });
    }

    // Image Analysis with AI
    async analyzeImageWithAI(imageFile) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    labels: ['infrastructure', 'construction', 'damage'],
                    safeSearch: { adult: 'VERY_UNLIKELY', violence: 'UNLIKELY' },
                    infrastructureScore: (Math.random() * 0.5 + 0.3).toFixed(2),
                    confidence: (Math.random() * 0.3 + 0.6).toFixed(2)
                });
            }, 1000);
        });
    }

    // AI Categorization Logic
    categorizeIssue(text) {
        const categories = {
            water: ['water', 'pump', 'well', 'tap', 'drink', 'pipe', 'supply'],
            electricity: ['power', 'electric', 'light', 'voltage', 'current', 'transformer'],
            roads: ['road', 'path', 'bridge', 'transport', 'pothole', 'repair'],
            education: ['school', 'teacher', 'education', 'books', 'classroom', 'student'],
            healthcare: ['hospital', 'doctor', 'medicine', 'health', 'clinic', 'ambulance'],
            sanitation: ['toilet', 'sanitation', 'drainage', 'clean', 'garbage']
        };

        text = text.toLowerCase();
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }
        return 'other';
    }

    // Sentiment Analysis
    analyzeSentiment(text) {
        const positiveWords = ['good', 'improved', 'working', 'happy', 'thanks', 'completed', 'fixed'];
        const negativeWords = ['broken', 'not working', 'problem', 'issue', 'bad', 'poor', 'lack', 'missing'];
        
        text = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;
        
        if (negativeCount > positiveCount) return 'NEGATIVE';
        if (positiveCount > negativeCount) return 'POSITIVE';
        return 'NEUTRAL';
    }

    // Location Extraction
    extractLocation(text) {
        const locationPatterns = [
            /near\s+(\w+\s*\w*)/i,
            /at\s+(\w+\s*\w*)/i,
            /in\s+(\w+\s*\w*)/i,
            /beside\s+(\w+\s*\w*)/i
        ];
        
        for (const pattern of locationPatterns) {
            const match = text.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    extractKeyPhrases(text) {
        const phrases = text.toLowerCase().split(/[.,!?]/);
        return phrases.filter(phrase => phrase.trim().length > 3).slice(0, 4);
    }

    // Priority Calculation Algorithm
    calculatePriority(textAnalysis, imageAnalysis) {
        let score = 5; // Base score
        
        // Sentiment impact
        if (textAnalysis.sentiment === 'NEGATIVE') score += 3;
        if (textAnalysis.sentiment === 'POSITIVE') score -= 2;
        
        // Category criticality
        const criticalCategories = {
            'healthcare': 3,
            'water': 3, 
            'electricity': 2,
            'roads': 2,
            'sanitation': 2,
            'education': 1,
            'other': 0
        };
        score += criticalCategories[textAnalysis.category] || 0;
        
        // Image analysis impact
        if (imageAnalysis && imageAnalysis.infrastructureScore < 0.4) {
            score += 2;
        }
        
        // Confidence factor
        if (textAnalysis.confidence > 0.8) score += 1;
        
        return Math.min(Math.max(score, 1), 10);
    }

    displayAIResults(issue, container) {
        const urgencyColors = {
            '1-3': '#4CAF50',   // Low - Green
            '4-6': '#FF9800',   // Medium - Orange  
            '7-10': '#F44336'   // High - Red
        };
        
        let urgencyColor = urgencyColors['7-10'];
        if (issue.urgency <= 3) urgencyColor = urgencyColors['1-3'];
        else if (issue.urgency <= 6) urgencyColor = urgencyColors['4-6'];

        container.innerHTML = `
            <div class="ai-result" style="border-left-color: ${urgencyColor};">
                <h4>✅ AI Analysis Complete</h4>
                <p><strong>Category:</strong> <span class="category-tag">${issue.category.toUpperCase()}</span></p>
                <p><strong>Urgency Level:</strong> <span style="color: ${urgencyColor}; font-weight: bold;">${issue.urgency}/10</span></p>
                <p><strong>Sentiment:</strong> ${issue.sentiment}</p>
                <p><strong>AI Confidence:</strong> ${issue.aiAnalysis.textAnalysis.confidence * 100}%</p>
                <p><strong>Recommended Action:</strong> ${this.getRecommendation(issue.urgency)}</p>
                ${issue.aiAnalysis.textAnalysis.keyPhrases ? `
                    <p><strong>Key Phrases:</strong> ${issue.aiAnalysis.textAnalysis.keyPhrases.join(', ')}</p>
                ` : ''}
            </div>
        `;
    }

    getRecommendation(priorityScore) {
        if (priorityScore >= 9) return '🚨 IMMEDIATE ACTION REQUIRED';
        if (priorityScore >= 7) return '🕒 Schedule within 48 hours';
        if (priorityScore >= 5) return '📅 Plan for this week';
        return '📋 Monitor and include in monthly planning';
    }

    // Dashboard Management
    loadDashboard() {
        this.updateStats();
        this.showAIPriorityMessage();
        this.showRecentIssues();
        this.loadProjects();
    }

    updateStats() {
        document.getElementById('issue-count').textContent = this.issues.length;
        document.getElementById('project-count').textContent = this.projects.length;
        
        const completionRate = this.issues.length > 0 ? 
            Math.round((this.issues.filter(i => i.urgency <= 3).length / this.issues.length) * 100) : 0;
        document.getElementById('completion-rate').textContent = completionRate + '%';
    }

    showAIPriorityMessage() {
        const messageElement = document.getElementById('priority-message');
        
        if (this.issues.length === 0) {
            messageElement.textContent = "No issues reported yet. Encourage villagers to report infrastructure gaps.";
            return;
        }
        
        const urgentIssues = this.issues.filter(issue => issue.urgency >= 8);
        const waterIssues = this.issues.filter(issue => issue.category === 'water');
        const healthcareIssues = this.issues.filter(issue => issue.category === 'healthcare');

        if (urgentIssues.length > 0) {
            messageElement.innerHTML = `🚨 <strong>${urgentIssues.length} urgent issues</strong> need immediate attention!`;
        } else if (waterIssues.length > 0) {
            messageElement.innerHTML = `💧 <strong>${waterIssues.length} water-related issues</strong> reported. Prioritize water infrastructure.`;
        } else if (healthcareIssues.length > 0) {
            messageElement.innerHTML = `🏥 <strong>${healthcareIssues.length} healthcare issues</strong> need attention.`;
        } else {
            messageElement.textContent = "All systems monitoring. Continue community engagement.";
        }
    }

    showRecentIssues() {
        const container = document.getElementById('recent-issues-list');
        const recentIssues = this.issues.slice(-5).reverse();
        
        if (recentIssues.length === 0) {
            container.innerHTML = '<p>No issues reported yet.</p>';
            return;
        }

        container.innerHTML = recentIssues.map(issue => `
            <div class="issue-item">
                <strong>${issue.category.toUpperCase()}</strong> - Urgency: ${issue.urgency}/10
                <br><small>${issue.text.substring(0, 100)}...</small>
                <br><small>${new Date(issue.timestamp).toLocaleDateString()}</small>
            </div>
        `).join('');
    }

    loadProjects() {
        const container = document.getElementById('project-list');
        // For demo - create sample projects based on issues
        const sampleProjects = [
            { id: 1, name: "Water Pump Repair", category: "water", progress: 65, village: "Gram Panchayat A" },
            { id: 2, name: "Road Pothole Fixing", category: "roads", progress: 30, village: "Gram Panchayat B" },
            { id: 3, name: "School Building Maintenance", category: "education", progress: 80, village: "Gram Panchayat C" }
        ];
        
        container.innerHTML = sampleProjects.map(project => `
            <div class="project-card">
                <h4>${project.name}</h4>
                <p><strong>Category:</strong> ${project.category}</p>
                <p><strong>Village:</strong> ${project.village}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <p><strong>Progress:</strong> ${project.progress}%</p>
            </div>
        `).join('');
    }

    // Map Management
    initMap() {
        this.map = L.map('village-map').setView([28.6139, 77.2090], 10);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add existing issues to map
        this.issues.forEach(issue => this.addToMap(issue));
    }

    addToMap(issue) {
        if (!this.map || !issue.location) return;

        const iconColors = {
            water: 'blue',
            electricity: 'yellow', 
            roads: 'orange',
            education: 'green',
            healthcare: 'red',
            sanitation: 'purple',
            other: 'gray'
        };

        const color = iconColors[issue.category] || 'gray';
        
        const marker = L.marker(issue.location).addTo(this.map)
            .bindPopup(`
                <strong>${issue.category.toUpperCase()}</strong><br>
                ${issue.text.substring(0, 100)}...<br>
                <small>Urgency: ${issue.urgency}/10</small>
            `);
    }

    generateRandomLocation() {
        // Generate random location near Delhi for demo
        const baseLat = 28.6139;
        const baseLng = 77.2090;
        return {
            lat: baseLat + (Math.random() - 0.5) * 0.1,
            lng: baseLng + (Math.random() - 0.5) * 0.1
        };
    }

    // Offline Functionality
    saveToStorage() {
        localStorage.setItem('issues', JSON.stringify(this.issues));
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    saveIssueOffline(text, photo) {
        const offlineIssue = {
            id: Date.now(),
            text: text,
            category: 'pending',
            sentiment: 'NEUTRAL',
            urgency: 5,
            timestamp: new Date().toISOString(),
            offline: true
        };
        this.issues.push(offlineIssue);
        this.saveToStorage();
        
        // Show offline notification
        this.showOfflineNotification();
    }

    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.hideOfflineNotification();
        });
        
        window.addEventListener('offline', () => {
            this.showOfflineNotification();
        });
    }

    showOfflineNotification() {
        let indicator = document.getElementById('offline-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'offline-indicator';
            indicator.textContent = '🔴 Offline - Working locally';
            document.body.appendChild(indicator);
        }
    }

    hideOfflineNotification() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Service Worker Setup - FIXED LINE HERE!
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            // CHANGED FROM: '/sw.js' TO: './sw.js'
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        }
    }
}

// Initialize the application
let app;

document.addEventListener('DOMContentLoaded', function() {
    app = new AdarshGramAI();
});

// Global functions for HTML
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

function analyzeAndSubmitIssue() {
    if (app) {
        app.analyzeAndSubmitIssue();
    }
}
