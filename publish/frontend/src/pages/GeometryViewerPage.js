import React, { useState } from 'react';
import GeometryViewer from '../components/GeometryViewer';
import './GeometryViewerPage.css';

const GeometryViewerPage = () => {
  const [geometry, setGeometry] = useState(null);
  const [rendererType, setRendererType] = useState('threejs');
  const [processorType, setProcessorType] = useState('mesh');
  const [options, setOptions] = useState({
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    meshColor: '#888888',
    showEdges: true,
    showVertices: false,
    wireframe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample geometry types
  const sampleGeometryTypes = ['cube', 'sphere', 'cylinder', 'cone', 'torus'];

  // Create sample geometry
  const createSampleGeometry = async (type) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/geometry-viewer/sample-geometry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: type,
          options: {
            size: 1.0,
            radius: 1.0,
            height: 2.0,
            segments: 16
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create sample geometry');
      }

      const result = await response.json();
      setGeometry(result.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render geometry
  const renderGeometry = async () => {
    if (!geometry) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/geometry-viewer/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          geometry: geometry,
          rendererType: rendererType,
          options: options
        })
      });

      if (!response.ok) {
        throw new Error('Failed to render geometry');
      }

      const result = await response.json();
      console.log('Render result:', result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Process geometry
  const processGeometry = async () => {
    if (!geometry) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/geometry-viewer/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          geometry: geometry,
          processorType: processorType,
          options: {}
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process geometry');
      }

      const result = await response.json();
      console.log('Process result:', result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Take screenshot
  const takeScreenshot = async () => {
    if (!geometry) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/geometry-viewer/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          geometry: geometry,
          options: {
            format: 'png',
            resolution: { width: 1920, height: 1080 },
            quality: 0.9
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to take screenshot');
      }

      const result = await response.json();
      
      // Download screenshot
      if (result.data && result.data.data && result.data.data.base64) {
        const link = document.createElement('a');
        link.href = result.data.data.base64;
        link.download = result.data.filename;
        link.click();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="geometry-viewer-page">
      <div className="geometry-viewer-header">
        <h1>🎨 Geometry Viewer</h1>
        <p>3D Geometry Visualization</p>
      </div>

      <div className="geometry-viewer-controls">
        <div className="control-section">
          <h3>Sample Geometry</h3>
          <div className="sample-geometry-buttons">
            {sampleGeometryTypes.map(type => (
              <button
                key={type}
                onClick={() => createSampleGeometry(type)}
                disabled={loading}
                className="sample-geometry-btn"
              >
                Create {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="control-section">
          <h3>Renderer Settings</h3>
          <div className="renderer-controls">
            <label>
              Renderer Type:
              <select
                value={rendererType}
                onChange={(e) => setRendererType(e.target.value)}
                disabled={loading}
              >
                <option value="threejs">Three.js</option>
                <option value="webgl">WebGL</option>
                <option value="canvas2d">Canvas 2D</option>
              </select>
            </label>

            <label>
              Processor Type:
              <select
                value={processorType}
                onChange={(e) => setProcessorType(e.target.value)}
                disabled={loading}
              >
                <option value="mesh">Mesh</option>
                <option value="brep">Brep</option>
                <option value="curve">Curve</option>
                <option value="surface">Surface</option>
                <option value="pointcloud">Point Cloud</option>
              </select>
            </label>
          </div>
        </div>

        <div className="control-section">
          <h3>Display Options</h3>
          <div className="display-controls">
            <label>
              <input
                type="checkbox"
                checked={options.showEdges}
                onChange={(e) => setOptions({...options, showEdges: e.target.checked})}
                disabled={loading}
              />
              Show Edges
            </label>

            <label>
              <input
                type="checkbox"
                checked={options.showVertices}
                onChange={(e) => setOptions({...options, showVertices: e.target.checked})}
                disabled={loading}
              />
              Show Vertices
            </label>

            <label>
              <input
                type="checkbox"
                checked={options.wireframe}
                onChange={(e) => setOptions({...options, wireframe: e.target.checked})}
                disabled={loading}
              />
              Wireframe Mode
            </label>
          </div>
        </div>

        <div className="control-section">
          <h3>Actions</h3>
          <div className="action-buttons">
            <button
              onClick={renderGeometry}
              disabled={!geometry || loading}
              className="action-btn primary"
            >
              🎨 Render Geometry
            </button>

            <button
              onClick={processGeometry}
              disabled={!geometry || loading}
              className="action-btn secondary"
            >
              🔧 Process Geometry
            </button>

            <button
              onClick={takeScreenshot}
              disabled={!geometry || loading}
              className="action-btn tertiary"
            >
              📸 Take Screenshot
            </button>
          </div>
        </div>
      </div>

      <div className="geometry-viewer-display">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Processing...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>❌ Error: {error}</p>
          </div>
        )}

        {geometry && (
          <div className="geometry-info">
            <h3>Geometry Information</h3>
            <p><strong>Type:</strong> {geometry.geometryType}</p>
            <p><strong>Vertices:</strong> {geometry.statistics.vertexCount}</p>
            <p><strong>Faces:</strong> {geometry.statistics.faceCount}</p>
            <p><strong>Surface Area:</strong> {geometry.statistics.surfaceArea.toFixed(4)}</p>
            <p><strong>Volume:</strong> {geometry.statistics.volume.toFixed(4)}</p>
          </div>
        )}

        <div className="geometry-viewer-container">
          {geometry ? (
            <GeometryViewer geometry={geometry} options={options} />
          ) : (
            <div className="no-geometry">
              <p>No geometry loaded. Create a sample geometry to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeometryViewerPage;
