const AIEnhancementService = require('../services/ai-enhancement-service');
const { ErrorHandler } = require('../utils/error-handler');
const { PerformanceMonitor } = require('../utils/performance-monitor');

class AIEnhancedController {
  constructor() {
    this.aiService = new AIEnhancementService();
    this.errorHandler = new ErrorHandler();
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * AI-enhanced geometry analysis with verbose reasoning
   */
  async analyzeGeometryWithAI(req, res) {
    try {
      const { geometryData, analysisType, context } = req.body;
      
      if (!geometryData || !analysisType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: geometryData and analysisType'
        });
      }

      const startTime = Date.now();
      const result = await this.aiService.analyzeGeometryWithAI(geometryData, analysisType, context);
      
      this.performanceMonitor.recordOperation('ai_enhanced_geometry_analysis', Date.now() - startTime);
      
      res.json({
        success: true,
        data: result,
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gpt-5',
          verbosity_mode: 'verbose',
          reasoning_effort: 'detailed'
        }
      });
    } catch (error) {
      const errorResponse = this.errorHandler.handleError('AI_ENHANCED_GEOMETRY_ANALYSIS', error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * AI-driven parameter optimization with detailed reasoning
   */
  async optimizeParametersWithAI(req, res) {
    try {
      const { geometryType, optimizationGoal, constraints } = req.body;
      
      if (!geometryType || !optimizationGoal) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: geometryType and optimizationGoal'
        });
      }

      const startTime = Date.now();
      const result = await this.aiService.optimizeParametersWithAI(geometryType, optimizationGoal, constraints);
      
      this.performanceMonitor.recordOperation('ai_enhanced_parameter_optimization', Date.now() - startTime);
      
      res.json({
        success: true,
        data: result,
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gpt-5',
          verbosity_mode: 'verbose',
          reasoning_effort: 'detailed'
        }
      });
    } catch (error) {
      const errorResponse = this.errorHandler.handleError('AI_ENHANCED_PARAMETER_OPTIMIZATION', error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Natural language to Rhino Compute operation conversion
   */
  async naturalLanguageToOperation(req, res) {
    try {
      const { userRequest, availableOperations } = req.body;
      
      if (!userRequest) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: userRequest'
        });
      }

      const startTime = Date.now();
      const result = await this.aiService.naturalLanguageToOperation(userRequest, availableOperations);
      
      this.performanceMonitor.recordOperation('ai_enhanced_natural_language_conversion', Date.now() - startTime);
      
      res.json({
        success: true,
        data: result,
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gpt-5',
          verbosity_mode: 'verbose',
          reasoning_effort: 'detailed'
        }
      });
    } catch (error) {
      const errorResponse = this.errorHandler.handleError('AI_ENHANCED_NATURAL_LANGUAGE_CONVERSION', error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Enhanced error diagnosis with detailed reasoning
   */
  async diagnoseAndResolveError(req, res) {
    try {
      const { errorMessage, operationContext, geometryData } = req.body;
      
      if (!errorMessage) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: errorMessage'
        });
      }

      const startTime = Date.now();
      const result = await this.aiService.diagnoseAndResolveError(errorMessage, operationContext, geometryData);
      
      this.performanceMonitor.recordOperation('ai_enhanced_error_diagnosis', Date.now() - startTime);
      
      res.json({
        success: true,
        data: result,
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gpt-5',
          verbosity_mode: 'verbose',
          reasoning_effort: 'detailed'
        }
      });
    } catch (error) {
      const errorResponse = this.errorHandler.handleError('AI_ENHANCED_ERROR_DIAGNOSIS', error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Performance optimization recommendations
   */
  async getPerformanceRecommendations(req, res) {
    try {
      const { operationHistory, currentMetrics } = req.body;
      
      if (!operationHistory || !currentMetrics) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: operationHistory and currentMetrics'
        });
      }

      const startTime = Date.now();
      const result = await this.aiService.getPerformanceRecommendations(operationHistory, currentMetrics);
      
      this.performanceMonitor.recordOperation('ai_enhanced_performance_recommendations', Date.now() - startTime);
      
      res.json({
        success: true,
        data: result,
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gpt-5',
          verbosity_mode: 'verbose',
          reasoning_effort: 'detailed'
        }
      });
    } catch (error) {
      const errorResponse = this.errorHandler.handleError('AI_ENHANCED_PERFORMANCE_RECOMMENDATIONS', error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Get AI service metrics and statistics
   */
  async getAIServiceMetrics(req, res) {
    try {
      const startTime = Date.now();
      const metrics = await this.aiService.getAIServiceMetrics();
      
      this.performanceMonitor.recordOperation('ai_enhanced_metrics_retrieval', Date.now() - startTime);
      
      res.json({
        success: true,
        data: metrics,
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gpt-5',
          verbosity_mode: 'verbose',
          reasoning_effort: 'detailed'
        }
      });
    } catch (error) {
      const errorResponse = this.errorHandler.handleError('AI_ENHANCED_METRICS_RETRIEVAL', error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Clear AI service cache
   */
  async clearAICache(req, res) {
    try {
      const startTime = Date.now();
      const result = await this.aiService.clearCache();
      
      this.performanceMonitor.recordOperation('ai_enhanced_cache_clear', Date.now() - startTime);
      
      res.json({
        success: true,
        data: { message: 'AI service cache cleared successfully' },
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gpt-5',
          verbosity_mode: 'verbose',
          reasoning_effort: 'detailed'
        }
      });
    } catch (error) {
      const errorResponse = this.errorHandler.handleError('AI_ENHANCED_CACHE_CLEAR', error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Validate OpenAI API connection and configuration
   */
  async validateAPIConnection(req, res) {
    try {
      const startTime = Date.now();
      const result = await this.aiService.validateAPIConnection();
      
      this.performanceMonitor.recordOperation('ai_enhanced_api_validation', Date.now() - startTime);
      
      res.json({
        success: true,
        data: result,
        metadata: {
          processingTime: Date.now() - startTime,
          apiVersion: "2024-11-06"
        }
      });
    } catch (error) {
      const errorResponse = this.errorHandler.handleError('AI_ENHANCED_API_VALIDATION', error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * AI-enhanced operation execution with intelligent parameter selection
   */
  async executeAIEnhancedOperation(req, res) {
    try {
      const { operation, geometryData, userIntent, context } = req.body;
      
      if (!operation || !geometryData) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: operation and geometryData'
        });
      }

      const startTime = Date.now();
      
      // Step 1: Analyze user intent and optimize parameters
      let optimizedParameters = {};
      if (userIntent) {
        const optimizationResult = await this.aiService.optimizeParametersWithAI(
          'general',
          userIntent,
          { operation, context }
        );
        optimizedParameters = optimizationResult.optimization.recommendedParameters || {};
      }

      // Step 2: Execute the operation with AI-optimized parameters
      const enhancedOperation = {
        ...operation,
        parameters: {
          ...operation.parameters,
          ...optimizedParameters
        }
      };

      // Step 3: Get detailed analysis of the operation
      const analysisResult = await this.aiService.analyzeGeometryWithAI(
        geometryData,
        'operation_execution',
        { operation: enhancedOperation, context }
      );

      this.performanceMonitor.recordOperation('ai_enhanced_operation_execution', Date.now() - startTime);
      
      res.json({
        success: true,
        data: {
          operation: enhancedOperation,
          analysis: analysisResult.analysis,
          recommendations: analysisResult.analysis.recommendations,
          optimizedParameters
        },
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gpt-5',
          verbosity_mode: 'verbose',
          reasoning_effort: 'detailed',
          tokensUsed: analysisResult.metadata.tokensUsed
        }
      });
    } catch (error) {
      const errorResponse = this.errorHandler.handleError('AI_ENHANCED_OPERATION_EXECUTION', error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * AI-powered operation sequence optimization
   */
  async optimizeOperationSequence(req, res) {
    try {
      const { operations, geometryData, goals, constraints } = req.body;
      
      if (!operations || !geometryData || !goals) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: operations, geometryData, and goals'
        });
      }

      const startTime = Date.now();
      
      // Use AI to optimize the operation sequence
      const optimizationResult = await this.aiService.optimizeParametersWithAI(
        'sequence',
        goals,
        { operations, constraints }
      );

      // Get detailed analysis of the optimized sequence
      const analysisResult = await this.aiService.analyzeGeometryWithAI(
        geometryData,
        'sequence_optimization',
        { operations, optimization: optimizationResult.optimization }
      );

      this.performanceMonitor.recordOperation('ai_enhanced_sequence_optimization', Date.now() - startTime);
      
      res.json({
        success: true,
        data: {
          originalSequence: operations,
          optimizedSequence: optimizationResult.optimization.recommendedSequence,
          analysis: analysisResult.analysis,
          performanceImprovements: optimizationResult.optimization.expectedImprovements
        },
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gpt-5',
          verbosity_mode: 'verbose',
          reasoning_effort: 'detailed',
          tokensUsed: analysisResult.metadata.tokensUsed + optimizationResult.metadata.tokensUsed
        }
      });
    } catch (error) {
      const errorResponse = this.errorHandler.handleError('AI_ENHANCED_SEQUENCE_OPTIMIZATION', error);
      res.status(500).json(errorResponse);
    }
  }
}

module.exports = AIEnhancedController;
