const OpenAI = require('openai');
const { PerformanceMonitor } = require('../utils/performance-monitor');
const { ErrorHandler } = require('../utils/error-handler');
const { AdvancedCache } = require('../utils/advanced-cache');

class AIEnhancementService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // Ensure we're using the latest API version
      defaultHeaders: {
        'OpenAI-Beta': 'assistants=v2' // Enable latest features
      }
    });
    
    this.performanceMonitor = new PerformanceMonitor();
    this.errorHandler = new ErrorHandler();
    this.cache = new AdvancedCache();
    
    // Enhanced GPT-5 configuration with verbose and detailed reasoning
    // Aligned with OpenAI API documentation
    this.gpt5Config = {
      model: "gpt-5",
      verbosity_mode: "verbose",
      reasoning_effort: "detailed",
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" },
      // Additional parameters for better control
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    };
    
    // o1 model configuration for complex reasoning
    this.o1Config = {
      model: "o1-preview",
      temperature: 1.0, // o1 models work best at temperature 1
      max_tokens: 10000,
      response_format: { type: "json_object" }
    };
    
    // GPT-4o configuration for multimodal capabilities
    this.gpt4oConfig = {
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    };
    
    this.geometryExpertise = {
      systemPrompt: `You are an expert computational geometry engineer with deep knowledge of:
      - RhinoCommon's 2400+ geometric operations
      - Topology optimization algorithms (BESO, Level Set, Multi-Objective)
      - Mesh analysis and processing
      - 3D modeling and CAD operations
      - Performance optimization for geometric computations
      
      Provide detailed, verbose analysis with step-by-step reasoning for all geometry-related queries.
      Always explain the mathematical principles, computational complexity, and practical implications.
      
      Follow OpenAI API best practices:
      - Use structured JSON responses when requested
      - Provide clear, actionable recommendations
      - Include error handling suggestions
      - Consider performance implications`,
      
      capabilities: {
        geometryAnalysis: true,
        parameterOptimization: true,
        errorDiagnosis: true,
        naturalLanguageToOperation: true,
        performanceRecommendations: true,
        algorithmSelection: true
      }
    };
  }

  /**
   * Enhanced geometry analysis with GPT-5 verbose reasoning
   * Aligned with OpenAI API documentation
   */
  async analyzeGeometryWithAI(geometryData, analysisType, context = {}) {
    const cacheKey = `geometry_analysis_${analysisType}_${Buffer.from(geometryData).toString('base64').substring(0, 50)}`;
    
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.performanceMonitor.recordCacheHit('ai_geometry_analysis');
        return cached;
      }

      const startTime = Date.now();
      
      // Use GPT-5 with proper API parameters
      const response = await this.openai.chat.completions.create({
        ...this.gpt5Config,
        messages: [
          {
            role: "system",
            content: this.geometryExpertise.systemPrompt
          },
          {
            role: "user",
            content: `Perform a comprehensive ${analysisType} analysis on the provided geometry data.
            
            Geometry Data: ${geometryData.substring(0, 1000)}...
            Context: ${JSON.stringify(context)}
            
            Please provide a JSON response with:
            {
              "mathematicalAnalysis": "Detailed mathematical explanation",
              "computationalComplexity": "Complexity assessment",
              "optimizationRecommendations": "Specific recommendations",
              "potentialIssues": "Issues and solutions",
              "performanceImplications": "Performance impact",
              "recommendedOperations": ["op1", "op2"],
              "confidence": 0.95
            }
            
            Use verbose reasoning to explain each step and recommendation.`
          }
        ]
      });

      // Validate response according to OpenAI API documentation
      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI API');
      }

      const result = {
        analysis: JSON.parse(response.choices[0].message.content),
        metadata: {
          model: this.gpt5Config.model,
          verbosity_mode: this.gpt5Config.verbosity_mode,
          reasoning_effort: this.gpt5Config.reasoning_effort,
          processingTime: Date.now() - startTime,
          tokensUsed: response.usage?.total_tokens || 0,
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          finishReason: response.choices[0].finish_reason
        }
      };

      await this.cache.set(cacheKey, result, 3600); // Cache for 1 hour
      this.performanceMonitor.recordOperation('ai_geometry_analysis', Date.now() - startTime);
      
      return result;
    } catch (error) {
      return this.errorHandler.handleError('AI_GEOMETRY_ANALYSIS', error);
    }
  }

  /**
   * AI-driven parameter optimization with detailed reasoning
   * Uses o1 model for complex structural reasoning
   */
  async optimizeParametersWithAI(geometryType, optimizationGoal, constraints = {}) {
    const cacheKey = `param_optimization_${geometryType}_${optimizationGoal}_${JSON.stringify(constraints)}`;
    
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.performanceMonitor.recordCacheHit('ai_parameter_optimization');
        return cached;
      }

      const startTime = Date.now();
      
      // Use o1 model for complex reasoning tasks
      const response = await this.openai.chat.completions.create({
        ...this.o1Config,
        messages: [
          {
            role: "system",
            content: this.geometryExpertise.systemPrompt
          },
          {
            role: "user",
            content: `Optimize parameters for ${geometryType} geometry with goal: ${optimizationGoal}
            
            Constraints: ${JSON.stringify(constraints)}
            
            Available algorithms:
            - BESO (Bi-directional Evolutionary Structural Optimization)
            - Level Set Optimization
            - Multi-Objective Optimization
            - Adaptive Mesh Optimization
            - Stress-Based Optimization
            - Frequency-Based Optimization
            
            Please provide a JSON response with:
            {
              "algorithmSelection": "Reasoning for algorithm choice",
              "optimalParameters": {
                "volumeFraction": 0.4,
                "penaltyFactor": 2.5,
                "filterRadius": 0.1,
                "convergenceCriteria": 0.001
              },
              "expectedPerformance": "Performance characteristics",
              "convergenceAnalysis": "Convergence behavior",
              "riskAssessment": "Risk analysis",
              "alternativeParameters": [{"scenario": "conservative", "params": {...}}],
              "confidence": 0.92
            }
            
            Use detailed reasoning to explain the optimization process and parameter selection.`
          }
        ]
      });

      const result = {
        optimization: JSON.parse(response.choices[0].message.content),
        metadata: {
          model: this.o1Config.model,
          processingTime: Date.now() - startTime,
          tokensUsed: response.usage?.total_tokens || 0,
          finishReason: response.choices[0].finish_reason
        }
      };

      await this.cache.set(cacheKey, result, 7200); // Cache for 2 hours
      this.performanceMonitor.recordOperation('ai_parameter_optimization', Date.now() - startTime);
      
      return result;
    } catch (error) {
      return this.errorHandler.handleError('AI_PARAMETER_OPTIMIZATION', error);
    }
  }

  /**
   * Natural language to Rhino Compute operation conversion
   * Uses GPT-4o for better understanding
   */
  async naturalLanguageToOperation(userRequest, availableOperations = []) {
    const cacheKey = `nl_to_op_${Buffer.from(userRequest).toString('base64').substring(0, 50)}`;
    
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.performanceMonitor.recordCacheHit('ai_natural_language_conversion');
        return cached;
      }

      const startTime = Date.now();
      
      // Use GPT-4o for natural language understanding
      const response = await this.openai.chat.completions.create({
        ...this.gpt4oConfig,
        messages: [
          {
            role: "system",
            content: this.geometryExpertise.systemPrompt
          },
          {
            role: "user",
            content: `Convert this natural language request to specific Rhino Compute operations:
            
            User Request: "${userRequest}"
            
            Available Operations (2400+): ${JSON.stringify(availableOperations.slice(0, 100))}...
            
            Please provide a JSON response with:
            {
              "operation": "selected_operation_name",
              "parameters": {"param1": "value1"},
              "reasoning": "Detailed reasoning for selection",
              "alternativeOperations": ["alt1", "alt2"],
              "expectedInput": "Input requirements",
              "expectedOutput": "Output specifications",
              "performanceConsiderations": "Performance notes",
              "errorHandling": "Error handling recommendations",
              "confidence": 0.88
            }
            
            Use detailed reasoning to explain the conversion process and operation selection.`
          }
        ]
      });

      const result = {
        conversion: JSON.parse(response.choices[0].message.content),
        metadata: {
          model: this.gpt4oConfig.model,
          processingTime: Date.now() - startTime,
          tokensUsed: response.usage?.total_tokens || 0,
          finishReason: response.choices[0].finish_reason
        }
      };

      await this.cache.set(cacheKey, result, 1800); // Cache for 30 minutes
      this.performanceMonitor.recordOperation('ai_natural_language_conversion', Date.now() - startTime);
      
      return result;
    } catch (error) {
      return this.errorHandler.handleError('AI_NATURAL_LANGUAGE_CONVERSION', error);
    }
  }

  /**
   * Enhanced error diagnosis with detailed reasoning
   * Uses o1-mini for focused error analysis
   */
  async diagnoseAndResolveError(errorMessage, operationContext, geometryData = null) {
    const cacheKey = `error_diagnosis_${Buffer.from(errorMessage).toString('base64').substring(0, 50)}`;
    
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.performanceMonitor.recordCacheHit('ai_error_diagnosis');
        return cached;
      }

      const startTime = Date.now();
      
      // Use o1-mini for focused error analysis
      const response = await this.openai.chat.completions.create({
        model: "o1-mini",
        temperature: 1.0,
        max_tokens: 5000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: this.geometryExpertise.systemPrompt
          },
          {
            role: "user",
            content: `Diagnose and resolve this Rhino Compute error:
            
            Error: ${errorMessage}
            Operation Context: ${JSON.stringify(operationContext)}
            Geometry Data: ${geometryData ? geometryData.substring(0, 500) + '...' : 'Not provided'}
            
            Please provide a JSON response with:
            {
              "rootCause": "Detailed error analysis",
              "resolutionSteps": ["step1", "step2"],
              "alternativeApproaches": ["approach1", "approach2"],
              "preventionStrategies": ["strategy1", "strategy2"],
              "performanceImpact": "Impact assessment",
              "debuggingSteps": ["debug1", "debug2"],
              "severity": "high|medium|low",
              "confidence": 0.85
            }
            
            Use detailed reasoning to explain the diagnosis and resolution process.`
          }
        ]
      });

      const result = {
        diagnosis: JSON.parse(response.choices[0].message.content),
        metadata: {
          model: "o1-mini",
          processingTime: Date.now() - startTime,
          tokensUsed: response.usage?.total_tokens || 0,
          finishReason: response.choices[0].finish_reason
        }
      };

      await this.cache.set(cacheKey, result, 3600); // Cache for 1 hour
      this.performanceMonitor.recordOperation('ai_error_diagnosis', Date.now() - startTime);
      
      return result;
    } catch (error) {
      return this.errorHandler.handleError('AI_ERROR_DIAGNOSIS', error);
    }
  }

  /**
   * Performance optimization recommendations
   * Uses GPT-4o for comprehensive analysis
   */
  async getPerformanceRecommendations(operationHistory, currentMetrics) {
    const cacheKey = `perf_recommendations_${JSON.stringify(operationHistory).substring(0, 100)}`;
    
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.performanceMonitor.recordCacheHit('ai_performance_recommendations');
        return cached;
      }

      const startTime = Date.now();
      
      // Use GPT-4o for performance analysis
      const response = await this.openai.chat.completions.create({
        ...this.gpt4oConfig,
        messages: [
          {
            role: "system",
            content: this.geometryExpertise.systemPrompt
          },
          {
            role: "user",
            content: `Analyze performance and provide optimization recommendations:
            
            Operation History: ${JSON.stringify(operationHistory)}
            Current Metrics: ${JSON.stringify(currentMetrics)}
            
            Please provide a JSON response with:
            {
              "bottlenecks": "Identified bottlenecks",
              "optimizationStrategies": ["strategy1", "strategy2"],
              "resourceUtilization": "Resource recommendations",
              "cachingStrategy": "Caching optimization",
              "algorithmImprovements": ["improvement1", "improvement2"],
              "infrastructureScaling": "Scaling recommendations",
              "expectedImprovements": "Expected performance gains",
              "implementationPriority": "high|medium|low",
              "confidence": 0.90
            }
            
            Use detailed reasoning to explain the performance analysis and optimization strategies.`
          }
        ]
      });

      const result = {
        recommendations: JSON.parse(response.choices[0].message.content),
        metadata: {
          model: this.gpt4oConfig.model,
          processingTime: Date.now() - startTime,
          tokensUsed: response.usage?.total_tokens || 0,
          finishReason: response.choices[0].finish_reason
        }
      };

      await this.cache.set(cacheKey, result, 7200); // Cache for 2 hours
      this.performanceMonitor.recordOperation('ai_performance_recommendations', Date.now() - startTime);
      
      return result;
    } catch (error) {
      return this.errorHandler.handleError('AI_PERFORMANCE_RECOMMENDATIONS', error);
    }
  }

  /**
   * Get AI service metrics and statistics
   * Enhanced with OpenAI API usage tracking
   */
  async getAIServiceMetrics() {
    const metrics = await this.performanceMonitor.getMetrics();
    const cacheStats = await this.cache.getStats();
    
    return {
      aiOperations: {
        geometryAnalysis: metrics.ai_geometry_analysis || 0,
        parameterOptimization: metrics.ai_parameter_optimization || 0,
        naturalLanguageConversion: metrics.ai_natural_language_conversion || 0,
        errorDiagnosis: metrics.ai_error_diagnosis || 0,
        performanceRecommendations: metrics.ai_performance_recommendations || 0
      },
      cachePerformance: {
        hits: cacheStats.hits || 0,
        misses: cacheStats.misses || 0,
        hitRate: cacheStats.hitRate || 0
      },
      modelConfig: {
        gpt5: {
          model: this.gpt5Config.model,
          verbosity_mode: this.gpt5Config.verbosity_mode,
          reasoning_effort: this.gpt5Config.reasoning_effort
        },
        o1: {
          model: this.o1Config.model,
          temperature: this.o1Config.temperature
        },
        gpt4o: {
          model: this.gpt4oConfig.model,
          temperature: this.gpt4oConfig.temperature
        }
      },
      apiVersion: "2024-11-06", // Latest OpenAI API version
      features: {
        assistants: "v2",
        jsonMode: true,
        streaming: true,
        multimodal: true
      }
    };
  }

  /**
   * Clear AI service cache
   */
  async clearCache() {
    return await this.cache.clear();
  }

  /**
   * Validate OpenAI API connection and configuration
   */
  async validateAPIConnection() {
    try {
      const response = await this.openai.models.list();
      return {
        success: true,
        models: response.data.map(model => model.id),
        apiVersion: "2024-11-06",
        features: {
          gpt5: response.data.some(m => m.id.includes('gpt-5')),
          o1: response.data.some(m => m.id.includes('o1')),
          gpt4o: response.data.some(m => m.id.includes('gpt-4o'))
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        apiVersion: "2024-11-06"
      };
    }
  }
}

module.exports = AIEnhancementService;
