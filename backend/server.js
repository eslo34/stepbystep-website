const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['https://www.usestepbystep.com', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Zoho API Configuration
const ZOHO_CONFIG = {
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    redirectUri: process.env.ZOHO_REDIRECT_URI,
    scope: 'ZohoMail.messages.CREATE,ZohoMail.accounts.READ',
    accessType: 'offline'
};

// Validate required environment variables
if (!ZOHO_CONFIG.clientId || !ZOHO_CONFIG.clientSecret || !ZOHO_CONFIG.redirectUri) {
    console.error('❌ Missing required environment variables: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REDIRECT_URI');
    process.exit(1);
}

// Store tokens (In production, use a database)
let authTokens = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null
};

// Email Templates
const EMAIL_TEMPLATES = {
    welcomeEmail: (companyName, docsUrl) => ({
        subject: "Thank you for your submission! We'll send your custom video list within 24 hours 🎬",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1D3557; font-size: 24px;">Thank you for your submission!</h1>
            </div>
            
            <p>Hi there from the StepByStep team,</p>
            
            <p>Thank you so much for submitting your documentation link! We're excited to help you create better tutorial videos for your users.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1D3557; margin-top: 0;">📋 What happens next:</h3>
                <ol style="line-height: 1.6;">
                    <li><strong>FREE custom tutorial video list</strong> - We'll review your documentation and platform and then give you a complete list of tutorial and other videos that would give you the most value within 24 hours</li>
                    <li><strong>FREE tutorial video creation</strong> - Once you approve the list, we'll create your first tutorial video completely for free</li>
                </ol>
            </div>
            
            <p>Your documentation URL: <a href="${docsUrl}" style="color: #60A5FA;">${docsUrl}</a></p>
            
            <div style="text-align: center; margin: 30px 0;">
                <p><strong>Want to chat sooner?</strong> Book a quick 15-minute call with us:</p>
                <a href="https://calendly.com/eslo-editing/30min" 
                   style="background: #60A5FA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                   📅 Schedule a Quick Call
                </a>
            </div>
            
            <p>We'll be in touch soon with your personalized video recommendations!</p>
            
            <p>Best regards,<br>
            <strong>StepByStep Team</strong><br>
            <a href="mailto:hello@usestepbystep.com">hello@usestepbystep.com</a></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e5e5;">
            <p style="font-size: 12px; color: #666; text-align: center;">
                StepByStep - AI-powered tutorial videos for SaaS platforms<br>
                <a href="https://www.usestepbystep.com">www.usestepbystep.com</a>
            </p>
        </div>`
    })
};

// Zoho OAuth URLs - EU Data Center
const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.eu';
const ZOHO_MAIL_API_URL = 'https://mail.zoho.eu';
const ZOHO_AUTH_URL = `${ZOHO_ACCOUNTS_URL}/oauth/v2/auth?scope=${ZOHO_CONFIG.scope}&client_id=${ZOHO_CONFIG.clientId}&response_type=code&access_type=${ZOHO_CONFIG.accessType}&redirect_uri=${encodeURIComponent(ZOHO_CONFIG.redirectUri)}`;

// Helper function to get access token
async function getAccessToken() {
    if (authTokens.accessToken && authTokens.expiresAt && new Date() < authTokens.expiresAt) {
        return authTokens.accessToken;
    }

    if (authTokens.refreshToken) {
        try {
            const response = await axios.post(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, null, {
                params: {
                    refresh_token: authTokens.refreshToken,
                    client_id: ZOHO_CONFIG.clientId,
                    client_secret: ZOHO_CONFIG.clientSecret,
                    grant_type: 'refresh_token'
                }
            });

            authTokens.accessToken = response.data.access_token;
            authTokens.expiresAt = new Date(Date.now() + (response.data.expires_in * 1000));
            
            return authTokens.accessToken;
        } catch (error) {
            console.error('Error refreshing token:', error.response?.data);
            return null;
        }
    }

    return null;
}

// Send email via Zoho Mail API
async function sendEmail(to, subject, htmlContent, companyName) {
    try {
        const accessToken = await getAccessToken();
        
        if (!accessToken) {
            console.log('No access token available. User needs to authorize.');
            return { success: false, error: 'Authorization required' };
        }

        const emailData = {
            fromAddress: 'hello@usestepbystep.com',
            toAddress: to,
            subject: subject,
            content: htmlContent,
            mailFormat: 'html'
        };

        const response = await axios.post(`${ZOHO_MAIL_API_URL}/api/accounts/me/messages`, emailData, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Email sent successfully to:', to);
        return { success: true, messageId: response.data.data.messageId };

    } catch (error) {
        console.error('Error sending email:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// Routes

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'StepByStep Backend API is running',
        authStatus: authTokens.accessToken ? 'Authorized' : 'Not authorized',
        authUrl: authTokens.accessToken ? null : ZOHO_AUTH_URL
    });
});

// OAuth callback handler
app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
        const tokenResponse = await axios.post(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, null, {
            params: {
                grant_type: 'authorization_code',
                client_id: ZOHO_CONFIG.clientId,
                client_secret: ZOHO_CONFIG.clientSecret,
                redirect_uri: ZOHO_CONFIG.redirectUri,
                code: code
            }
        });

        authTokens.accessToken = tokenResponse.data.access_token;
        authTokens.refreshToken = tokenResponse.data.refresh_token;
        authTokens.expiresAt = new Date(Date.now() + (tokenResponse.data.expires_in * 1000));

        res.send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2 style="color: #1D3557;">✅ Authorization Successful!</h2>
                    <p>Your StepByStep email automation is now configured.</p>
                    <p>You can close this window and return to your admin dashboard.</p>
                    <a href="https://www.usestepbystep.com/admin" style="background: #60A5FA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Admin Dashboard</a>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('Token exchange error:', error.response?.data);
        res.status(500).json({ error: 'Failed to exchange authorization code for tokens' });
    }
});

// Lead magnet form submission
app.post('/api/submit-lead', async (req, res) => {
    try {
        const { company, email, docsUrl } = req.body;

        // Validate required fields
        if (!company || !email || !docsUrl) {
            return res.status(400).json({ 
                error: 'Missing required fields: company, email, docsUrl' 
            });
        }

        // Send welcome email
        const emailTemplate = EMAIL_TEMPLATES.welcomeEmail(company, docsUrl);
        const emailResult = await sendEmail(email, emailTemplate.subject, emailTemplate.html, company);

        if (emailResult.success) {
            // Store lead data (in production, save to database)
            const lead = {
                id: Date.now().toString(),
                company,
                email,
                docsUrl,
                submittedAt: new Date().toISOString(),
                status: 'submitted',
                emailSent: true,
                messageId: emailResult.messageId
            };

            console.log('New lead received:', lead);

            res.json({ 
                success: true, 
                message: 'Thank you! We\'ll send you a custom video list within 24 hours.',
                leadId: lead.id
            });
        } else {
            console.error('Failed to send email:', emailResult.error);
            res.json({ 
                success: true, 
                message: 'Thank you for your submission! We\'ll contact you soon.',
                emailWarning: 'Email delivery may be delayed'
            });
        }

    } catch (error) {
        console.error('Error processing lead:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'We received your submission but there was an issue. Please contact us directly at hello@usestepbystep.com'
        });
    }
});

// Test email endpoint (for debugging)
app.post('/api/test-email', async (req, res) => {
    try {
        const { to = 'eslo.editing@gmail.com', subject = 'Test Email' } = req.body;
        
        const result = await sendEmail(to, subject, '<h1>Test email from StepByStep API</h1><p>If you received this, the integration is working!</p>', 'Test Company');
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 StepByStep Backend API running on port ${PORT}`);
    console.log(`📧 Zoho Mail integration: ${authTokens.accessToken ? 'Authorized' : 'Needs authorization'}`);
    if (!authTokens.accessToken) {
        console.log(`🔗 Authorize at: ${ZOHO_AUTH_URL}`);
    }
});

module.exports = app;
