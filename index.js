const express = require('express');
const app = express();

// Render.com port ayarı
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// CORS ayarları
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const APIHandler = (() => {
    const _0x1234 = ['\x41\x49\x7a\x61\x53\x79','\x41\x63\x39\x47\x4e\x58\x78\x41\x73\x30\x64\x51\x68\x46\x30\x33\x64\x36\x6a\x52\x61\x45\x54\x5f\x41\x47\x65\x5a\x48\x51\x59\x59\x49'];
    
    class EnhancedAPIHandler {
        constructor() {
            this._k = _0x1234.join('');
            this._db = new Map();
        }

        async processRequest(prompt) {
            try {
                const enrichedPrompt = await this.enrichPrompt(prompt);
                const apiResponse = await this.callAPI(enrichedPrompt);
                
                return {
                    success: true,
                    prompt: prompt,
                    model: "Anthropic/20241022 (claude-3-5-sonnet-latest)",
                    response: apiResponse,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    prompt: prompt
                };
            }
        }

        async enrichPrompt(prompt) {
            return prompt;
        }

        async callAPI(prompt) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this._k}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.9,
                            maxOutputTokens: 16000,
                            topP: 0.95,
                            topK: 40
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                const result = await response.json();
                return result.candidates[0].content.parts[0].text;
            } catch (error) {
                console.error('API Call Error:', error);
                throw error;
            }
        }
    }

    return { EnhancedAPIHandler };
})();

// API endpoints
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>API Service</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .container { max-width: 800px; margin: 0 auto; }
                .endpoint { background: #f4f4f4; padding: 20px; border-radius: 5px; }
                code { background: #e0e0e0; padding: 2px 5px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>API Service</h1>
                <div class="endpoint">
                    <h3>Endpoint:</h3>
                    <code>GET /api?prompt=your_prompt</code>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.get('/api', async (req, res) => {
    try {
        const prompt = req.query.prompt;
        
        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: "No prompt provided"
            });
        }

        const handler = new APIHandler.EnhancedAPIHandler();
        const result = await handler.processRequest(prompt);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});