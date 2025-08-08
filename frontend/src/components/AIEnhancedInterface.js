import React, { useState, useEffect } from 'react';
import './AIEnhancedInterface.css';

const AIEnhancedInterface = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('natural-language');
  const [operationHistory, setOperationHistory] = useState([]);
  const [aiMetrics, setAiMetrics] = useState(null);

  const modes = [
    { id: 'natural-language', label: '🗣️ Natural Language', description: 'Describe what you want to do with your geometry' },
    { id: 'geometry-analysis', label: '🔍 Geometry Analysis', description: 'Get detailed AI analysis of your geometry' },
    { id: 'parameter-optimization', label: '⚙️ Parameter Optimization', description: 'AI-driven parameter optimization' },
    { id: 'error-diagnosis', label: '🔧 Error Diagnosis', description: 'Intelligent error analysis and resolution' },
    { id: 'performance-recommendations', label: '📊 Performance Recommendations', description: 'AI-powered performance optimization' }
  ];

  useEffect(() => {
    loadAIMetrics();
  }, []);

  const loadAIMetrics = async () => {
    try {
      const response = await fetch('/api/ai/metrics');
      const data = await response.json();
      if (data.success) {
        setAiMetrics(data.data);
      }
    } catch (error) {
      // Non-fatal in UI; keep working without metrics
      console.warn('Failed to load AI metrics:', error.message);
    }
  };

  const handleAIOperation = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setAiResponse(null);

    try {
      let endpoint = '';
      let requestBody = {};

      switch (selectedMode) {
        case 'natural-language':
          endpoint = '/api/ai/natural-language/convert';
          requestBody = {
            userRequest: userInput,
            availableOperations: []
          };
          break;

        case 'geometry-analysis':
          endpoint = '/api/ai/geometry/analyze';
          requestBody = {
            geometryData: 'sample-geometry-data',
            analysisType: 'comprehensive',
            context: { userInput }
          };
          break;

        case 'parameter-optimization':
          endpoint = '/api/ai/parameters/optimize';
          requestBody = {
            geometryType: 'mesh',
            optimizationGoal: userInput,
            constraints: {}
          };
          break;

        case 'error-diagnosis':
          endpoint = '/api/ai/error/diagnose';
          requestBody = {
            errorMessage: userInput,
            operationContext: {},
            geometryData: null
          };
          break;

        case 'performance-recommendations':
          endpoint = '/api/ai/performance/recommendations';
          requestBody = {
            operationHistory: operationHistory,
            currentMetrics: aiMetrics
          };
          break;

        default:
          throw new Error('Invalid mode selected');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (data.success) {
        setAiResponse(data);
        setOperationHistory(prev => [...prev, {
          mode: selectedMode,
          input: userInput,
          response: data,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error(data.error || 'AI operation failed');
      }
    } catch (error) {
      setAiResponse({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAIResponse = () => {
    if (!aiResponse) return null;

    if (!aiResponse.success) {
      return (
        <div className="ai-response error">
          <h3>❌ AI Operation Failed</h3>
          <p>{aiResponse.error}</p>
        </div>
      );
    }

    const { data, metadata } = aiResponse;

    return (
      <div className="ai-response">
        <div className="ai-response-header">
          <h3>🤖 AI Analysis Complete</h3>
          <div className="ai-metrics">
            <span>⏱️ {metadata.processingTime}ms</span>
            <span>🧠 GPT-5</span>
            <span>📝 Verbose Mode</span>
            <span>🔍 Detailed Reasoning</span>
          </div>
        </div>

        <div className="ai-response-content">
          {selectedMode === 'natural-language' && data.conversion && (
            <div className="conversion-result">
              <h4>🔄 Operation Conversion</h4>
              <div className="conversion-details">
                <p><strong>Selected Operation:</strong> {data.conversion.operation}</p>
                <p><strong>Parameters:</strong> {JSON.stringify(data.conversion.parameters, null, 2)}</p>
                <p><strong>Reasoning:</strong> {data.conversion.reasoning}</p>
              </div>
            </div>
          )}

          {selectedMode === 'geometry-analysis' && data.analysis && (
            <div className="analysis-result">
              <h4>🔍 Geometry Analysis</h4>
              <div className="analysis-details">
                <p><strong>Mathematical Analysis:</strong> {data.analysis.mathematicalAnalysis}</p>
                <p><strong>Computational Complexity:</strong> {data.analysis.computationalComplexity}</p>
                <p><strong>Optimization Recommendations:</strong> {data.analysis.optimizationRecommendations}</p>
                <p><strong>Performance Implications:</strong> {data.analysis.performanceImplications}</p>
              </div>
            </div>
          )}

          {selectedMode === 'parameter-optimization' && data.optimization && (
            <div className="optimization-result">
              <h4>⚙️ Parameter Optimization</h4>
              <div className="optimization-details">
                <p><strong>Algorithm Selection:</strong> {data.optimization.algorithmSelection}</p>
                <p><strong>Optimal Parameters:</strong> {JSON.stringify(data.optimization.optimalParameters, null, 2)}</p>
                <p><strong>Expected Performance:</strong> {data.optimization.expectedPerformance}</p>
                <p><strong>Risk Assessment:</strong> {data.optimization.riskAssessment}</p>
              </div>
            </div>
          )}

          {selectedMode === 'error-diagnosis' && data.diagnosis && (
            <div className="diagnosis-result">
              <h4>🔧 Error Diagnosis</h4>
              <div className="diagnosis-details">
                <p><strong>Root Cause:</strong> {data.diagnosis.rootCause}</p>
                <p><strong>Resolution Steps:</strong> {data.diagnosis.resolutionSteps}</p>
                <p><strong>Prevention Strategies:</strong> {data.diagnosis.preventionStrategies}</p>
                <p><strong>Debugging Steps:</strong> {data.diagnosis.debuggingSteps}</p>
              </div>
            </div>
          )}

          {selectedMode === 'performance-recommendations' && data.recommendations && (
            <div className="recommendations-result">
              <h4>📊 Performance Recommendations</h4>
              <div className="recommendations-details">
                <p><strong>Bottlenecks:</strong> {data.recommendations.bottlenecks}</p>
                <p><strong>Optimization Strategies:</strong> {data.recommendations.optimizationStrategies}</p>
                <p><strong>Resource Utilization:</strong> {data.recommendations.resourceUtilization}</p>
                <p><strong>Expected Improvements:</strong> {data.recommendations.expectedImprovements}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-enhanced-interface">
      <div className="ai-header">
        <h2>🤖 AI-Enhanced Geometry Operations</h2>
        <p>Powered by GPT-5 with Verbose Reasoning & Detailed Analysis</p>
        
        {aiMetrics && (
          <div className="ai-stats">
            <span>🧠 Operations: {aiMetrics.aiOperations?.geometryAnalysis || 0}</span>
            <span>⚡ Cache Hit Rate: {aiMetrics.cachePerformance?.hitRate || 0}%</span>
            <span>📊 Model: {aiMetrics.modelConfig?.model}</span>
          </div>
        )}
      </div>

      <div className="ai-controls">
        <div className="mode-selection">
          <h3>Select AI Mode:</h3>
          <div className="mode-grid">
            {modes.map(mode => (
              <button
                key={mode.id}
                className={`mode-button ${selectedMode === mode.id ? 'active' : ''}`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <div className="mode-icon">{mode.label.split(' ')[0]}</div>
                <div className="mode-info">
                  <div className="mode-title">{mode.label.split(' ').slice(1).join(' ')}</div>
                  <div className="mode-description">{mode.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="input-section">
          <h3>AI Input:</h3>
          <div className="input-container">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`Enter your ${selectedMode.replace('-', ' ')} request...`}
              rows={4}
              className="ai-input"
            />
            <button
              onClick={handleAIOperation}
              disabled={isLoading || !userInput.trim()}
              className="ai-submit-button"
            >
              {isLoading ? '🤖 Processing...' : '🚀 Execute AI Operation'}
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="ai-loading">
          <div className="loading-spinner"></div>
          <p>🤖 AI is analyzing with verbose reasoning...</p>
        </div>
      )}

      {renderAIResponse()}

      {operationHistory.length > 0 && (
        <div className="operation-history">
          <h3>📚 Operation History</h3>
          <div className="history-list">
            {operationHistory.slice(-5).reverse().map((op, index) => (
              <div key={index} className="history-item">
                <div className="history-header">
                  <span className="history-mode">{modes.find(m => m.id === op.mode)?.label}</span>
                  <span className="history-time">{new Date(op.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="history-input">{op.input}</div>
                <div className="history-status">
                  {op.response.success ? '✅ Success' : '❌ Failed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIEnhancedInterface;
