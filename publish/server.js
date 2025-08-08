const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const morgan = require('morgan');

// Import service layer
const optimizationController = require('./controllers/optimization-controller');
const rhinoConfig = require('./config/rhino-compute');

// Import AI-enhanced controller
const AIEnhancedController = require('./controllers/ai-enhanced-controller');
const aiEnhancedController = new AIEnhancedController();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for IIS reverse proxy
app.set('trust proxy', 1);

// Basic middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.softlyplease.com', 'https://softlyplease.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','RhinoComputeKey','X-Requested-With','Accept','Origin','X-Request-ID','X-Client-Version'],
  exposedHeaders: ['X-Total-Count','X-Page-Count','X-Processing-Time'],
  maxAge: 86400
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    features: {
      rhinoCompute: true,
      enhancedOperations: true,
      computePlugins: true,
      advancedOptimization: true
    }
  });
});

// Rhino Compute API Routes
app.get('/api/rhino/test-connection', optimizationController.testConnection.bind(optimizationController));
app.get('/api/rhino/capabilities', optimizationController.getCapabilities.bind(optimizationController));
app.get('/api/rhino/metrics', optimizationController.getPerformanceMetrics.bind(optimizationController));

// Standard Rhino Compute operations
app.post('/api/rhino/topopt', upload.single('file'), optimizationController.executeTopOpt.bind(optimizationController));
app.post('/api/rhino/hops', upload.single('file'), optimizationController.executeHops.bind(optimizationController));

// Back-compat alias used by frontend
app.post('/api/optimize', upload.single('file'), optimizationController.executeTopOpt.bind(optimizationController));

// VM Health Check (updated to use localhost)
app.get('/api/rhino/vm-health', async (req, res) => {
  try {
    const status = await rhinoConfig.getServiceStatus();
    if (status.ok) {
      res.json({ success: true, message: 'Rhino.Compute OK', version: status.version, url: rhinoConfig.url });
    } else {
      res.status(503).json({ success: false, message: status.error || 'Unavailable', url: rhinoConfig.url });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// AI Enhanced Routes
app.post('/api/ai/complete', (req, res) => aiEnhancedController.complete?.(req, res));

app.post('/api/ai/geometry/analyze', (req, res) => aiEnhancedController.analyzeGeometryWithAI(req, res));

app.post('/api/ai/parameters/optimize', (req, res) => aiEnhancedController.optimizeParametersWithAI(req, res));

app.post('/api/ai/natural-language/convert', (req, res) => aiEnhancedController.naturalLanguageToOperation(req, res));

app.post('/api/ai/error/diagnose', (req, res) => aiEnhancedController.diagnoseAndResolveError(req, res));

app.post('/api/ai/performance/recommendations', (req, res) => aiEnhancedController.getPerformanceRecommendations(req, res));

app.get('/api/ai/metrics', (req, res) => aiEnhancedController.getAIServiceMetrics(req, res));

// OpenAI API validation endpoint
app.get('/api/ai/validate', (req, res) => aiEnhancedController.validateAPIConnection(req, res));

// OpenAI Responses API endpoint
app.post('/api/ai/responses', (req, res) => aiEnhancedController.useResponsesAPI?.(req, res));

// Start server without hard-failing on AI validation
async function startServer() {
  try {
    let apiValidation;
    try {
      apiValidation = await aiEnhancedController.validateAPIConnection({},{ json: (x)=>x, status: ()=>({ json: ()=>{} }) });
      // best-effort; do not block startup
    } catch (e) {
      console.warn('OpenAI API validation failed (non-fatal):', e.message);
    }

    app.listen(PORT, () => {
      console.log(`Soft backend server listening on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Rhino.Compute URL: ${rhinoConfig.url}`);
      if (apiValidation?.data?.configuration) {
        console.log(`API Version: ${apiValidation.data.configuration.apiVersion}`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

<<<<<<< Current (Your changes)
validateAndStartServer();
=======
startServer();
>>>>>>> Incoming (Background Agent changes)
