import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import GeometryViewerPage from './pages/GeometryViewerPage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('optimization');
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('standard');
  const [optimizationParams, setOptimizationParams] = useState({
    volumeFraction: 0.5,
    penalty: 3.0,
    iterations: 50,
    loadMagnitude: 1000,
    supportType: 'fixed'
  });

  // Enhanced state management
  const [processingStage, setProcessingStage] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  // Advanced algorithm parameters
  const [advancedParams, setAdvancedParams] = useState({
    // BESO parameters
    evolutionRate: 0.02,
    rejectionRatio: 0.01,
    // Level Set parameters
    timeStep: 0.1,
    // Multi-Objective parameters
    objectives: ['compliance', 'stress', 'frequency'],
    // Adaptive Mesh parameters
    refinementThreshold: 0.1,
    // Stress-Based parameters
    stressThreshold: 100.0,
    // Frequency-Based parameters
    targetFrequency: 100.0
  });

  // Enhanced file validation
  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['.3dm', '.stl', '.obj'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (file.size > maxSize) {
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of 50MB`);
    }
    
    if (!allowedTypes.includes(fileExtension)) {
      throw new Error(`Unsupported file type: ${fileExtension}. Allowed: ${allowedTypes.join(', ')}`);
    }
    
    return true;
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError('File is too large. Maximum size is 50MB.');
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('Invalid file type. Please upload .3dm, .stl, or .obj files.');
      } else {
        setError(`File rejected: ${rejection.errors[0].message}`);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      try {
        validateFile(acceptedFiles[0]);
        setFile(acceptedFiles[0]);
        setError(null);
        setResult(null);
        setProgress(0);
        setProcessingStage('');
      } catch (error) {
        setError(error.message);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.3dm'],
      'model/3dm': ['.3dm'],
      'application/stl': ['.stl'],
      'application/obj': ['.obj']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  // Enhanced optimization handler with comprehensive error handling and retry logic
  const handleOptimize = async () => {
    if (!file) {
      setError('Please select a file to optimize');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);
    setProcessingStage('Initializing...');
    setProcessingTime(0);
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('file', file);

      let endpoint = '/api/optimize';
      let params = optimizationParams;

      // Use advanced algorithm endpoints
      if (selectedAlgorithm !== 'standard') {
        endpoint = `/api/advanced/${selectedAlgorithm}-optimization`;
        params = { ...optimizationParams, ...advancedParams };
      }

      formData.append('params', JSON.stringify(params));

      setProcessingStage('Uploading file...');
      setProgress(10);

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(10 + (percentCompleted * 0.3)); // Upload is 30% of total progress
        },
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(40 + (percentCompleted * 0.6)); // Download is 60% of total progress
        }
      });

      setProcessingStage('Processing results...');
      setProgress(90);

      // Extract request ID and processing time from response
      if (response.data.requestId) {
        setRequestId(response.data.requestId);
      }
      if (response.data.processingTime) {
        setProcessingTime(response.data.processingTime);
      }

      setProgress(100);
      setProcessingStage('Complete!');
      setResult(response.data);
      setRetryCount(0);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setProcessingStage('');
      }, 5000);

    } catch (err) {
      const errorMessage = this.getErrorMessage(err);
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      // Auto-retry for certain errors
      if (this.shouldRetry(err) && retryCount < maxRetries) {
        setTimeout(() => {
          setError(`Retrying... (${retryCount + 1}/${maxRetries})`);
          handleOptimize();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setIsProcessing(false);
      setProcessingTime(Date.now() - startTime);
    }
  };

  // Enhanced error message handling
  const getErrorMessage = (err) => {
    if (err.response) {
      const { status, data } = err.response;
      
      switch (status) {
        case 400:
          return data.message || 'Invalid request. Please check your parameters.';
        case 408:
          return 'Request timeout. The optimization took too long. Try with fewer iterations.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 502:
          return 'Service temporarily unavailable. Please try again later.';
        case 503:
          return 'Service is currently overloaded. Please try again in a few minutes.';
        case 413:
          return 'File is too large. Please use a smaller file.';
        default:
          return data.message || `Server error (${status}). Please try again.`;
      }
    } else if (err.request) {
      return 'Network error. Please check your connection and try again.';
    } else if (err.code === 'ECONNABORTED') {
      return 'Request timeout. The operation took too long.';
    } else {
      return err.message || 'An unexpected error occurred.';
    }
  };

  // Determine if request should be retried
  const shouldRetry = (err) => {
    if (err.response) {
      const { status } = err.response;
      return status >= 500 || status === 408; // Retry server errors and timeouts
    }
    return err.code === 'ECONNABORTED' || err.message.includes('Network');
  };

  // Enhanced download handler with better error handling
  const handleDownload = async (filename) => {
    try {
      setProcessingStage('Downloading...');
      
      const response = await axios.get(`/api/visualization/download/${filename}`, {
        responseType: 'blob',
        timeout: 60000, // 1 minute timeout for downloads
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setProcessingStage('Download complete!');
      setTimeout(() => setProcessingStage(''), 3000);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`Download failed: ${errorMessage}`);
    }
  };

  // Enhanced parameter change handlers with validation
  const handleParameterChange = (param, value) => {
    // Validate parameter ranges
    const validation = validateParameter(param, value);
    if (validation.isValid) {
      setOptimizationParams(prev => ({
        ...prev,
        [param]: value
      }));
      setError(null); // Clear any previous errors
    } else {
      setError(validation.error);
    }
  };

  const handleAdvancedParameterChange = (param, value) => {
    const validation = validateParameter(param, value);
    if (validation.isValid) {
      setAdvancedParams(prev => ({
        ...prev,
        [param]: value
      }));
      setError(null);
    } else {
      setError(validation.error);
    }
  };

  // Parameter validation
  const validateParameter = (param, value) => {
    const numValue = parseFloat(value);
    
    switch (param) {
      case 'volumeFraction':
        if (isNaN(numValue) || numValue < 0.1 || numValue > 0.9) {
          return { isValid: false, error: 'Volume fraction must be between 0.1 and 0.9' };
        }
        break;
      case 'penalty':
        if (isNaN(numValue) || numValue < 1.0 || numValue > 10.0) {
          return { isValid: false, error: 'Penalty factor must be between 1.0 and 10.0' };
        }
        break;
      case 'iterations':
        if (isNaN(numValue) || numValue < 10 || numValue > 200) {
          return { isValid: false, error: 'Iterations must be between 10 and 200' };
        }
        break;
      case 'loadMagnitude':
        if (isNaN(numValue) || numValue < 100 || numValue > 10000) {
          return { isValid: false, error: 'Load magnitude must be between 100 and 10000' };
        }
        break;
    }
    
    return { isValid: true };
  };

  // Clear error when user starts new action
  const clearError = () => {
    setError(null);
  };

  // Navigation component
  const Navigation = () => (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>Soft - Topology Optimizer</h1>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'optimization' ? 'active' : ''}`}
            onClick={() => setActiveTab('optimization')}
          >
            Optimization
          </button>
          <button
            className={`nav-tab ${activeTab === 'geometry-viewer' ? 'active' : ''}`}
            onClick={() => setActiveTab('geometry-viewer')}
          >
            �� Geometry Viewer
          </button>
        </div>
      </div>
    </nav>
  );

  // Optimization component
  const OptimizationPage = () => (
    <div className="container">
      <div className="header">
        <h1>Advanced Topology Optimization</h1>
        <p>Professional 3D topology optimization with 7+ advanced algorithms</p>
      </div>

      {/* File Upload */}
      <div className="card">
        <h3 className="card-title">Upload 3D Model</h3>
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          {file ? (
            <div className="file-info">
              <p>📁 {file.name}</p>
              <p className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
            </div>
          ) : (
            <div className="dropzone-content">
              <p>📁 Drag & drop a 3D file here, or click to select</p>
              <p className="file-types">Supported: .3dm, .stl, .obj</p>
            </div>
          )}
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="card">
        <h3 className="card-title">Select Algorithm</h3>
        <div className="algorithm-grid">
          <label className="algorithm-option">
            <input
              type="radio"
              name="algorithm"
              value="standard"
              checked={selectedAlgorithm === 'standard'}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            />
            <div className="algorithm-content">
              <h4>Standard SIMP</h4>
              <p>Classic topology optimization with SIMP method</p>
            </div>
          </label>
          <label className="algorithm-option">
            <input
              type="radio"
              name="algorithm"
              value="beso"
              checked={selectedAlgorithm === 'beso'}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            />
            <div className="algorithm-content">
              <h4>BESO</h4>
              <p>Bi-directional Evolutionary Structural Optimization</p>
            </div>
          </label>
          <label className="algorithm-option">
            <input
              type="radio"
              name="algorithm"
              value="levelset"
              checked={selectedAlgorithm === 'levelset'}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            />
            <div className="algorithm-content">
              <h4>Level Set</h4>
              <p>Level set method for topology optimization</p>
            </div>
          </label>
          <label className="algorithm-option">
            <input
              type="radio"
              name="algorithm"
              value="multiobjective"
              checked={selectedAlgorithm === 'multiobjective'}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            />
            <div className="algorithm-content">
              <h4>Multi-Objective</h4>
              <p>Multi-objective optimization with Pareto fronts</p>
            </div>
          </label>
          <label className="algorithm-option">
            <input
              type="radio"
              name="algorithm"
              value="adaptivemesh"
              checked={selectedAlgorithm === 'adaptivemesh'}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            />
            <div className="algorithm-content">
              <h4>Adaptive Mesh</h4>
              <p>Adaptive mesh refinement optimization</p>
            </div>
          </label>
          <label className="algorithm-option">
            <input
              type="radio"
              name="algorithm"
              value="stressbased"
              checked={selectedAlgorithm === 'stressbased'}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            />
            <div className="algorithm-content">
              <h4>Stress-Based</h4>
              <p>Stress-based topology optimization</p>
            </div>
          </label>
          <label className="algorithm-option">
            <input
              type="radio"
              name="algorithm"
              value="frequencybased"
              checked={selectedAlgorithm === 'frequencybased'}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            />
            <div className="algorithm-content">
              <h4>Frequency-Based</h4>
              <p>Frequency-based topology optimization</p>
            </div>
          </label>
          <label className="algorithm-option">
            <input
              type="radio"
              name="algorithm"
              value="sensitivity"
              checked={selectedAlgorithm === 'sensitivity'}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            />
            <div className="algorithm-content">
              <h4>Advanced Sensitivity</h4>
              <p>Advanced sensitivity analysis optimization</p>
            </div>
          </label>
        </div>
      </div>

      {/* Parameters */}
      <div className="card">
        <h3 className="card-title">Optimization Parameters</h3>
        <div className="parameters-grid">
          <div className="parameter-group">
            <label>Volume Fraction</label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={optimizationParams.volumeFraction}
              onChange={(e) => handleParameterChange('volumeFraction', parseFloat(e.target.value))}
            />
            <span>{optimizationParams.volumeFraction}</span>
          </div>
          <div className="parameter-group">
            <label>Penalty Factor</label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={optimizationParams.penalty}
              onChange={(e) => handleParameterChange('penalty', parseFloat(e.target.value))}
            />
            <span>{optimizationParams.penalty}</span>
          </div>
          <div className="parameter-group">
            <label>Iterations</label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={optimizationParams.iterations}
              onChange={(e) => handleParameterChange('iterations', parseInt(e.target.value))}
            />
            <span>{optimizationParams.iterations}</span>
          </div>
          <div className="parameter-group">
            <label>Load Magnitude</label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={optimizationParams.loadMagnitude}
              onChange={(e) => handleParameterChange('loadMagnitude', parseInt(e.target.value))}
            />
            <span>{optimizationParams.loadMagnitude}</span>
          </div>
        </div>
      </div>

      {/* Advanced Parameters */}
      {selectedAlgorithm !== 'standard' && (
        <div className="card">
          <h3 className="card-title">Advanced Parameters</h3>
          <div className="parameters-grid">
            {selectedAlgorithm === 'beso' && (
              <>
                <div className="parameter-group">
                  <label>Evolution Rate</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.1"
                    step="0.01"
                    value={advancedParams.evolutionRate}
                    onChange={(e) => handleAdvancedParameterChange('evolutionRate', parseFloat(e.target.value))}
                  />
                  <span>{advancedParams.evolutionRate}</span>
                </div>
                <div className="parameter-group">
                  <label>Rejection Ratio</label>
                  <input
                    type="range"
                    min="0.001"
                    max="0.05"
                    step="0.001"
                    value={advancedParams.rejectionRatio}
                    onChange={(e) => handleAdvancedParameterChange('rejectionRatio', parseFloat(e.target.value))}
                  />
                  <span>{advancedParams.rejectionRatio}</span>
                </div>
              </>
            )}
            {selectedAlgorithm === 'levelset' && (
              <div className="parameter-group">
                <label>Time Step</label>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={advancedParams.timeStep}
                  onChange={(e) => handleAdvancedParameterChange('timeStep', parseFloat(e.target.value))}
                />
                <span>{advancedParams.timeStep}</span>
              </div>
            )}
            {selectedAlgorithm === 'stressbased' && (
              <div className="parameter-group">
                <label>Stress Threshold</label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={advancedParams.stressThreshold}
                  onChange={(e) => handleAdvancedParameterChange('stressThreshold', parseFloat(e.target.value))}
                />
                <span>{advancedParams.stressThreshold}</span>
              </div>
            )}
            {selectedAlgorithm === 'frequencybased' && (
              <div className="parameter-group">
                <label>Target Frequency</label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={advancedParams.targetFrequency}
                  onChange={(e) => handleAdvancedParameterChange('targetFrequency', parseFloat(e.target.value))}
                />
                <span>{advancedParams.targetFrequency}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optimize Button */}
      <div className="card">
        <button
          className="button primary"
          onClick={handleOptimize}
          disabled={!file || isProcessing}
        >
                      {isProcessing ? 'Optimizing...' : 'Start Optimization'}
        </button>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="card">
          <h3 className="card-title">Progress</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{Math.round(progress)}% Complete</p>
          {processingStage && (
            <div className="processing-stage">
              <p>{processingStage}</p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="card">
          <h3 className="card-title">Optimization Results</h3>
          <div className="results-grid">
            <div className="result-item">
              <h4>Algorithm</h4>
              <p>{result.algorithm || 'Standard SIMP'}</p>
            </div>
            <div className="result-item">
              <h4>Status</h4>
              <p className="status success">{result.success ? 'Success' : 'Failed'}</p>
            </div>
            <div className="result-item">
              <h4>Message</h4>
              <p>{result.message}</p>
            </div>
            {result.metrics && (
              <div className="result-item">
                <h4>Metrics</h4>
                <ul>
                  {Object.entries(result.metrics).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {typeof value === 'number' ? value.toFixed(2) : value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Download Section */}
          {result.outputFiles && result.outputFiles.length > 0 && (
            <div className="download-section">
              <h4>Download Results</h4>
              <div className="download-buttons">
                {result.outputFiles.map((filename, index) => (
                  <button
                    key={index}
                    className="button secondary"
                    onClick={() => handleDownload(filename)}
                  >
                    Download {filename.split('.').pop().toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="card error">
          <h3 className="card-title">Error</h3>
          <p className="error-message">{error}</p>
          <button className="button secondary" onClick={clearError}>
            Clear Error
          </button>
        </div>
      )}

      {/* Features Grid */}
      <div className="card">
        <h2 className="card-title">Advanced Features</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>7+ Optimization Algorithms</h3>
            <p>BESO, Level Set, Multi-Objective, Adaptive Mesh, Stress-Based, Frequency-Based, and Advanced Sensitivity Analysis</p>
          </div>
          <div className="feature">
            <h3>Real-time Analysis</h3>
            <p>Comprehensive mesh analysis with stress distribution and quality metrics</p>
          </div>
          <div className="feature">
            <h3>Batch Processing</h3>
            <p>Process multiple files simultaneously with queue management</p>
          </div>
          <div className="feature">
            <h3>📁 Multi-Format Export</h3>
            <p>Export optimized models in 3DM, STL, OBJ, PLY, STEP, and IGES formats</p>
          </div>
          <div className="feature">
            <h3>Advanced Visualization</h3>
            <p>3D rendering, stress visualization, and interactive model generation</p>
          </div>
          <div className="feature">
            <h3>⚙️ Parametric Modeling</h3>
            <p>Generative design, lattice structures, and advanced topology optimization</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <Navigation />
      {activeTab === 'optimization' ? <OptimizationPage /> : <GeometryViewerPage />}
    </div>
  );
}

export default App;
