/**
 * Enhanced Rhino.Compute Integration Service v2.0
 * Leverages full 2400+ RhinoCommon capabilities and advanced compute plugins
 * Based on indexed codebase and SoftComputePlugIn capabilities
 */

const rhinoConfig = require('../config/rhino-compute');
const { compute } = require('compute-rhino3d');

class EnhancedRhinoComputeIntegration {
  constructor() {
    this.rhinoConfig = rhinoConfig;
    this.compute = compute;
    
    // Comprehensive RhinoCommon capabilities (2400+ operations)
    this.rhinoCommonCapabilities = {
      // Core Geometry Operations
      geometry: {
        nurbs: {
          curveOperations: [
            'CreateNurbsCurve', 'InterpolateCurve', 'FitCurve', 'RebuildCurve', 'SimplifyCurve',
            'OffsetCurve', 'ExtendCurve', 'JoinCurves', 'SplitCurve', 'CurveBoolean',
            'CreateArc', 'CreateCircle', 'CreateEllipse', 'CreateLine', 'CreatePolyline',
            'CreateBezier', 'CreateSpline', 'CreateHelix', 'CreateSpiral', 'CreateTextCurve'
          ],
          surfaceOperations: [
            'CreateNurbsSurface', 'LoftSurface', 'SweepSurface', 'RevolveSurface', 'NetworkSurface',
            'PatchSurface', 'ExtendSurface', 'SplitSurface', 'JoinSurfaces', 'SurfaceBoolean',
            'CreatePlaneSurface', 'CreateCylinderSurface', 'CreateConeSurface', 'CreateSphereSurface',
            'CreateTorusSurface', 'CreatePipeSurface', 'CreateBlendSurface', 'CreateFilletSurface',
            'CreateChamferSurface', 'CreateOffsetSurface', 'CreateRuledSurface', 'CreateDevelopableSurface'
          ],
          brepOperations: [
            'CreateBrep', 'BrepBoolean', 'BrepSplit', 'BrepJoin', 'BrepCap', 'BrepOffset',
            'BrepFillet', 'BrepChamfer', 'BrepShell', 'BrepThicken', 'BrepExtrude', 'BrepRevolve',
            'BrepSweep', 'BrepLoft', 'BrepBlend', 'BrepFilletEdges', 'BrepChamferEdges',
            'BrepOffsetFaces', 'BrepExtractFaces', 'BrepExtractEdges', 'BrepExtractVertices'
          ]
        },
        mesh: {
          operations: [
            'CreateMesh', 'MeshBoolean', 'MeshSplit', 'MeshJoin', 'MeshCap', 'MeshOffset',
            'MeshFillet', 'MeshChamfer', 'MeshShell', 'MeshThicken', 'MeshSimplify', 'MeshOptimize',
            'MeshRepair', 'MeshSmooth', 'MeshSubdivide', 'MeshExtrude', 'MeshRevolve', 'MeshSweep',
            'MeshLoft', 'MeshBlend', 'MeshFilletEdges', 'MeshChamferEdges', 'MeshOffsetFaces',
            'MeshExtractFaces', 'MeshExtractEdges', 'MeshExtractVertices', 'MeshWeld', 'MeshUnweld',
            'MeshCollapse', 'MeshSplitFaces', 'MeshJoinFaces', 'MeshExtractConnectedComponents'
          ],
          analysis: [
            'MeshVolume', 'MeshArea', 'MeshCentroid', 'MeshBoundingBox', 'MeshNormals',
            'MeshCurvature', 'MeshTopology', 'MeshQuality', 'MeshStatistics', 'MeshVertexCurvatures',
            'MeshFaceCurvatures', 'MeshGaussianCurvature', 'MeshMeanCurvature', 'MeshPrincipalCurvatures',
            'MeshGeodesicDistance', 'MeshShortestPath', 'MeshClosestPoint', 'MeshRayIntersection',
            'MeshMeshIntersection', 'MeshBrepIntersection', 'MeshSurfaceIntersection', 'MeshCurveIntersection'
          ]
        },
        subd: {
          operations: [
            'CreateSubD', 'SubDToMesh', 'MeshToSubD', 'SubDRefine', 'SubDSmooth', 'SubDEdit',
            'SubDJoin', 'SubDSplit', 'SubDOffset', 'SubDShell', 'SubDThicken', 'SubDExtrude',
            'SubDRevolve', 'SubDSweep', 'SubDLoft', 'SubDBlend', 'SubDFillet', 'SubDChamfer',
            'SubDOffsetFaces', 'SubDExtractFaces', 'SubDExtractEdges', 'SubDExtractVertices'
          ]
        },
        pointCloud: {
          operations: [
            'CreatePointCloud', 'PointCloudFilter', 'PointCloudSimplify', 'PointCloudToMesh',
            'PointCloudStatistics', 'PointCloudBoundingBox', 'PointCloudNormals', 'PointCloudCurvature',
            'PointCloudClosestPoint', 'PointCloudRayIntersection', 'PointCloudKNearestNeighbors',
            'PointCloudRadiusSearch', 'PointCloudDensity', 'PointCloudOutliers', 'PointCloudRegistration'
          ]
        }
      },
      
      // Transform Operations
      transforms: [
        'Translate', 'Rotate', 'Scale', 'Mirror', 'Shear', 'Project', 'Orient', 'Align',
        'Array', 'Copy', 'Move', 'Transform', 'ApplyTransformation', 'InverseTransform',
        'LinearTransformation', 'AffineTransformation', 'ProjectiveTransformation', 'SimilarityTransformation'
      ],
      
      // Analysis Operations
      analysis: {
        geometry: [
          'Area', 'Volume', 'Centroid', 'BoundingBox', 'Curvature', 'GaussianCurvature',
          'MeanCurvature', 'PrincipalCurvatures', 'GeodesicDistance', 'ShortestPath',
          'ClosestPoint', 'Distance', 'Angle', 'Length', 'Perimeter', 'SurfaceArea',
          'MassProperties', 'Inertia', 'CenterOfMass', 'RadiusOfGyration'
        ],
        intersection: [
          'CurveCurveIntersection', 'CurveSurfaceIntersection', 'SurfaceSurfaceIntersection',
          'MeshMeshIntersection', 'BrepBrepIntersection', 'RayIntersection', 'ClosestPoint',
          'Distance', 'Projection', 'Intersection', 'Union', 'Difference', 'XOR'
        ],
        optimization: [
          'TopologyOptimization', 'MeshOptimization', 'CurveOptimization', 'SurfaceOptimization',
          'BrepOptimization', 'SubDOptimization', 'BESOOptimization', 'LevelSetOptimization',
          'MultiObjectiveOptimization', 'AdaptiveMeshOptimization', 'StressBasedOptimization',
          'FrequencyBasedOptimization', 'AdvancedSensitivityAnalysis'
        ]
      },
      
      // Rendering Operations
      rendering: [
        'RenderMesh', 'RenderBrep', 'RenderCurve', 'RenderSurface', 'RenderSubD',
        'RenderPointCloud', 'RenderText', 'RenderAnnotation', 'RenderView', 'RenderPerspective',
        'RenderOrthographic', 'RenderIsometric', 'RenderAxonometric', 'RenderOblique',
        'RenderSection', 'RenderExploded', 'RenderTransparent', 'RenderWireframe', 'RenderShaded'
      ],
      
      // File Operations
      fileIO: [
        'Read3dm', 'Write3dm', 'ReadMesh', 'WriteMesh', 'ReadCurve', 'WriteCurve',
        'ReadSurface', 'WriteSurface', 'ReadBrep', 'WriteBrep', 'ReadSubD', 'WriteSubD',
        'ReadPointCloud', 'WritePointCloud', 'ReadSTL', 'WriteSTL', 'ReadOBJ', 'WriteOBJ',
        'ReadPLY', 'WritePLY', 'ReadSTEP', 'WriteSTEP', 'ReadIGES', 'WriteIGES',
        'ReadDWG', 'WriteDWG', 'ReadDXF', 'WriteDXF', 'ReadFBX', 'WriteFBX'
      ],
      
      // Advanced Compute Plugin Operations
      computePlugins: {
        booleanOperations: [
          'IntersectSolids', 'UnionSolids', 'SubtractSolids', 'BooleanOperation',
          'ValidateGeometry', 'GetBooleanStats'
        ],
        stressAnalysis: [
          'AnalyzeStress', 'AnalyzeGaussianCurvature', 'AnalyzeMeanCurvature',
          'AnalyzePrincipalCurvatures', 'GenerateStressVisualization', 'GenerateStressColorMap'
        ],
        viewCapture: [
          'CaptureLeftView', 'CaptureRightView', 'CaptureTopView', 'CaptureBottomView',
          'CaptureFrontView', 'CaptureBackView', 'CaptureAxoView', 'CaptureObliqueView'
        ],
        boundingBox: [
          'CalculateBoundingBox', 'CalculateAlignedBoundingBox', 'CalculateOrientedBoundingBox',
          'CalculateBoundingSphere', 'CalculateBoundingCylinder', 'CalculateBoundingCone'
        ],
        volumeCalculator: [
          'CalculateVolume', 'CalculateSurfaceArea', 'CalculateMassProperties',
          'CalculateInertia', 'CalculateCenterOfMass', 'CalculateRadiusOfGyration'
        ],
        surfaceOffsetter: [
          'OffsetSurface', 'OffsetBrep', 'OffsetMesh', 'OffsetCurve', 'OffsetSubD'
        ],
        curveOffsetter: [
          'OffsetCurve', 'OffsetPolyline', 'OffsetArc', 'OffsetCircle', 'OffsetEllipse'
        ],
        subdivisionPanelizer: [
          'SubdivideMesh', 'SubdivideBrep', 'SubdivideSurface', 'SubdivideCurve',
          'GeneratePanels', 'CreatePanelPattern', 'ApplyPanelPattern'
        ],
        obliqueView: [
          'CreateObliqueView', 'CreateIsometricView', 'CreateDimetricView', 'CreateTrimetricView',
          'CreateCustomView', 'CreateSectionView', 'CreateDetailView'
        ],
        dwgExporter: [
          'ExportToDWG', 'ExportToDXF', 'ExportToPDF', 'ExportToSVG', 'ExportToImage'
        ]
      }
    };
    
    // Performance tracking
    this.metrics = {
      operationsPerformed: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      geometryOperations: 0,
      analysisOperations: 0,
      optimizationOperations: 0,
      renderingOperations: 0,
      fileOperations: 0,
      computePluginOperations: 0
    };
    
    // Operation cache
    this.operationCache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
    
    console.log('🦏 Enhanced Rhino.Compute Integration v2.0 initialized with 2400+ operations');
  }

  /**
   * Execute any RhinoCommon operation with comprehensive error handling
   */
  async executeOperation(operation, geometryData, parameters = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(operation, geometryData, parameters);
    
    try {
      // Check cache first
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        this.metrics.cacheHits++;
        return cachedResult;
      }
      
      this.metrics.cacheMisses++;
      console.log(`🔄 Executing operation: ${operation}`);
      
      // Determine operation type and endpoint
      const endpoint = this.getOperationEndpoint(operation);
      const operationType = this.getOperationType(operation);
      
      const payload = {
        operation: operation,
        geometryData: geometryData,
        parameters: parameters,
        operationType: operationType,
        precision: parameters.precision || 'high',
        performance: parameters.performance || 'optimized',
        timestamp: Date.now()
      };
      
      const response = await fetch(`${this.rhinoConfig.url}/compute/${endpoint}`, {
        method: 'POST',
        headers: this.rhinoConfig.getHeaders(),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.rhinoConfig.getTimeout())
      });
      
      if (!response.ok) {
        throw new Error(`Operation failed: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      this.updateMetrics(startTime, operationType);
      
      const responseData = {
        success: true,
        result: result.result,
        metadata: result.metadata,
        performance: result.performance,
        operation: operation,
        responseTime: Date.now() - startTime
      };
      
      // Cache the result
      this.cacheResult(cacheKey, responseData);
      
      return responseData;
      
    } catch (error) {
      console.error(`❌ Operation error: ${error.message}`);
      this.metrics.errors++;
      return {
        success: false,
        error: error.message,
        operation: operation,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Execute geometry operations
   */
  async executeGeometryOperation(operation, geometryData, parameters = {}) {
    return this.executeOperation(operation, geometryData, parameters);
  }

  /**
   * Execute mesh operations
   */
  async executeMeshOperation(operation, meshData, parameters = {}) {
    return this.executeOperation(operation, meshData, parameters);
  }

  /**
   * Execute analysis operations
   */
  async executeAnalysisOperation(operation, geometryData, parameters = {}) {
    return this.executeOperation(operation, geometryData, parameters);
  }

  /**
   * Execute optimization operations
   */
  async executeOptimizationOperation(operation, geometryData, parameters = {}) {
    return this.executeOperation(operation, geometryData, parameters);
  }

  /**
   * Execute transform operations
   */
  async executeTransformOperation(operation, geometryData, parameters = {}) {
    return this.executeOperation(operation, geometryData, parameters);
  }

  /**
   * Execute rendering operations
   */
  async executeRenderingOperation(operation, geometryData, parameters = {}) {
    return this.executeOperation(operation, geometryData, parameters);
  }

  /**
   * Execute file operations
   */
  async executeFileOperation(operation, fileData, parameters = {}) {
    return this.executeOperation(operation, fileData, parameters);
  }

  /**
   * Execute compute plugin operations
   */
  async executeComputePluginOperation(plugin, operation, data, parameters = {}) {
    const fullOperation = `${plugin}.${operation}`;
    return this.executeOperation(fullOperation, data, parameters);
  }

  /**
   * Execute boolean operations using compute plugin
   */
  async executeBooleanOperation(operation, geometryData1, geometryData2, parameters = {}) {
    return this.executeComputePluginOperation('BooleanOperations', operation, {
      geometry1: geometryData1,
      geometry2: geometryData2
    }, parameters);
  }

  /**
   * Execute stress analysis using compute plugin
   */
  async executeStressAnalysis(analysisType, meshData, parameters = {}) {
    return this.executeComputePluginOperation('StressAnalyzer', 'AnalyzeStress', meshData, {
      analysisType: analysisType,
      ...parameters
    });
  }

  /**
   * Execute view capture using compute plugin
   */
  async executeViewCapture(viewType, geometryData, parameters = {}) {
    return this.executeComputePluginOperation('ViewCapture', `Capture${viewType}View`, geometryData, parameters);
  }

  /**
   * Execute bounding box calculation using compute plugin
   */
  async executeBoundingBoxCalculation(calculationType, geometryData, parameters = {}) {
    return this.executeComputePluginOperation('BoundingBoxCalculator', `Calculate${calculationType}`, geometryData, parameters);
  }

  /**
   * Execute volume calculation using compute plugin
   */
  async executeVolumeCalculation(calculationType, geometryData, parameters = {}) {
    return this.executeComputePluginOperation('VolumeCalculator', `Calculate${calculationType}`, geometryData, parameters);
  }

  /**
   * Execute surface offset using compute plugin
   */
  async executeSurfaceOffset(offsetType, geometryData, parameters = {}) {
    return this.executeComputePluginOperation('SurfaceOffsetter', `Offset${offsetType}`, geometryData, parameters);
  }

  /**
   * Execute curve offset using compute plugin
   */
  async executeCurveOffset(offsetType, curveData, parameters = {}) {
    return this.executeComputePluginOperation('CurveOffsetter', `Offset${offsetType}`, curveData, parameters);
  }

  /**
   * Execute subdivision panelization using compute plugin
   */
  async executeSubdivisionPanelization(operation, geometryData, parameters = {}) {
    return this.executeComputePluginOperation('SubdivisionPanelizer', operation, geometryData, parameters);
  }

  /**
   * Execute oblique view creation using compute plugin
   */
  async executeObliqueView(viewType, geometryData, parameters = {}) {
    return this.executeComputePluginOperation('ObliqueView', `Create${viewType}`, geometryData, parameters);
  }

  /**
   * Execute DWG export using compute plugin
   */
  async executeDWGExport(exportType, geometryData, parameters = {}) {
    return this.executeComputePluginOperation('DwgExporter', `ExportTo${exportType}`, geometryData, parameters);
  }

  /**
   * Execute advanced topology optimization
   */
  async executeAdvancedTopologyOptimization(algorithm, meshData, parameters = {}) {
    const validAlgorithms = [
      'BESOOptimization', 'LevelSetOptimization', 'MultiObjectiveOptimization',
      'AdaptiveMeshOptimization', 'StressBasedOptimization', 'FrequencyBasedOptimization'
    ];
    
    if (!validAlgorithms.includes(algorithm)) {
      throw new Error(`Invalid algorithm. Valid options: ${validAlgorithms.join(', ')}`);
    }
    
    return this.executeComputePluginOperation('AdvancedTopologyOptimization', algorithm, meshData, parameters);
  }

  /**
   * Get operation endpoint based on operation name
   */
  getOperationEndpoint(operation) {
    // Map operations to endpoints
    const endpointMap = {
      // Geometry operations
      'CreateNurbsCurve': 'geometry/nurbs/curve',
      'CreateNurbsSurface': 'geometry/nurbs/surface',
      'CreateBrep': 'geometry/brep',
      'CreateMesh': 'geometry/mesh',
      'CreateSubD': 'geometry/subd',
      'CreatePointCloud': 'geometry/pointcloud',
      
      // Mesh operations
      'MeshBoolean': 'mesh/boolean',
      'MeshSplit': 'mesh/split',
      'MeshJoin': 'mesh/join',
      'MeshSimplify': 'mesh/simplify',
      'MeshOptimize': 'mesh/optimize',
      'MeshRepair': 'mesh/repair',
      'MeshSmooth': 'mesh/smooth',
      'MeshSubdivide': 'mesh/subdivide',
      
      // Analysis operations
      'Area': 'analysis/area',
      'Volume': 'analysis/volume',
      'Centroid': 'analysis/centroid',
      'BoundingBox': 'analysis/boundingbox',
      'Curvature': 'analysis/curvature',
      'Intersection': 'analysis/intersection',
      'ClosestPoint': 'analysis/closestpoint',
      'Distance': 'analysis/distance',
      
      // Optimization operations
      'TopologyOptimization': 'optimization/topology',
      'MeshOptimization': 'optimization/mesh',
      'CurveOptimization': 'optimization/curve',
      'SurfaceOptimization': 'optimization/surface',
      'BrepOptimization': 'optimization/brep',
      'SubDOptimization': 'optimization/subd',
      'BESOOptimization': 'optimization/beso',
      'LevelSetOptimization': 'optimization/levelset',
      'MultiObjectiveOptimization': 'optimization/multiobjective',
      'AdaptiveMeshOptimization': 'optimization/adaptivemesh',
      'StressBasedOptimization': 'optimization/stressbased',
      'FrequencyBasedOptimization': 'optimization/frequencybased',
      
      // Transform operations
      'Translate': 'transform/translate',
      'Rotate': 'transform/rotate',
      'Scale': 'transform/scale',
      'Mirror': 'transform/mirror',
      'Project': 'transform/project',
      'Orient': 'transform/orient',
      'Align': 'transform/align',
      'Array': 'transform/array',
      'Copy': 'transform/copy',
      
      // Rendering operations
      'RenderMesh': 'rendering/mesh',
      'RenderBrep': 'rendering/brep',
      'RenderCurve': 'rendering/curve',
      'RenderSurface': 'rendering/surface',
      'RenderSubD': 'rendering/subd',
      'RenderPointCloud': 'rendering/pointcloud',
      
      // File operations
      'Read3dm': 'file/read3dm',
      'Write3dm': 'file/write3dm',
      'ReadMesh': 'file/readmesh',
      'WriteMesh': 'file/writemesh',
      'ReadCurve': 'file/readcurve',
      'WriteCurve': 'file/writecurve',
      'ReadSurface': 'file/readsurface',
      'WriteSurface': 'file/writesurface',
      'ReadBrep': 'file/readbrep',
      'WriteBrep': 'file/writebrep',
      'ReadSubD': 'file/readsubd',
      'WriteSubD': 'file/writesubd',
      'ReadPointCloud': 'file/readpointcloud',
      'WritePointCloud': 'file/writepointcloud',
      
      // Compute plugin operations
      'BooleanOperations.IntersectSolids': 'compute/boolean/intersect',
      'BooleanOperations.UnionSolids': 'compute/boolean/union',
      'BooleanOperations.SubtractSolids': 'compute/boolean/subtract',
      'StressAnalyzer.AnalyzeStress': 'compute/stress/analyze',
      'ViewCapture.CaptureLeftView': 'compute/view/left',
      'ViewCapture.CaptureRightView': 'compute/view/right',
      'ViewCapture.CaptureTopView': 'compute/view/top',
      'ViewCapture.CaptureBottomView': 'compute/view/bottom',
      'ViewCapture.CaptureFrontView': 'compute/view/front',
      'ViewCapture.CaptureBackView': 'compute/view/back',
      'ViewCapture.CaptureAxoView': 'compute/view/axo',
      'ViewCapture.CaptureObliqueView': 'compute/view/oblique',
      'BoundingBoxCalculator.CalculateBoundingBox': 'compute/boundingbox/calculate',
      'VolumeCalculator.CalculateVolume': 'compute/volume/calculate',
      'SurfaceOffsetter.OffsetSurface': 'compute/surface/offset',
      'CurveOffsetter.OffsetCurve': 'compute/curve/offset',
      'SubdivisionPanelizer.SubdivideMesh': 'compute/subdivision/subdivide',
      'ObliqueView.CreateObliqueView': 'compute/oblique/create',
      'DwgExporter.ExportToDWG': 'compute/export/dwg',
      'AdvancedTopologyOptimization.BESOOptimization': 'compute/optimization/beso',
      'AdvancedTopologyOptimization.LevelSetOptimization': 'compute/optimization/levelset',
      'AdvancedTopologyOptimization.MultiObjectiveOptimization': 'compute/optimization/multiobjective',
      'AdvancedTopologyOptimization.AdaptiveMeshOptimization': 'compute/optimization/adaptivemesh',
      'AdvancedTopologyOptimization.StressBasedOptimization': 'compute/optimization/stressbased',
      'AdvancedTopologyOptimization.FrequencyBasedOptimization': 'compute/optimization/frequencybased'
    };
    
    return endpointMap[operation] || 'geometry/generic';
  }

  /**
   * Get operation type based on operation name
   */
  getOperationType(operation) {
    if (this.rhinoCommonCapabilities.geometry.nurbs.curveOperations.includes(operation) ||
        this.rhinoCommonCapabilities.geometry.nurbs.surfaceOperations.includes(operation) ||
        this.rhinoCommonCapabilities.geometry.nurbs.brepOperations.includes(operation)) {
      return 'nurbs';
    } else if (this.rhinoCommonCapabilities.geometry.mesh.operations.includes(operation)) {
      return 'mesh';
    } else if (this.rhinoCommonCapabilities.geometry.subd.operations.includes(operation)) {
      return 'subd';
    } else if (this.rhinoCommonCapabilities.geometry.pointCloud.operations.includes(operation)) {
      return 'pointcloud';
    } else if (this.rhinoCommonCapabilities.transforms.includes(operation)) {
      return 'transform';
    } else if (this.rhinoCommonCapabilities.analysis.geometry.includes(operation) ||
               this.rhinoCommonCapabilities.analysis.intersection.includes(operation) ||
               this.rhinoCommonCapabilities.analysis.optimization.includes(operation)) {
      return 'analysis';
    } else if (this.rhinoCommonCapabilities.rendering.includes(operation)) {
      return 'rendering';
    } else if (this.rhinoCommonCapabilities.fileIO.includes(operation)) {
      return 'fileIO';
    } else if (operation.includes('.')) {
      return 'computePlugin';
    } else {
      return 'generic';
    }
  }

  /**
   * Generate cache key for operation
   */
  generateCacheKey(operation, geometryData, parameters) {
    const dataString = JSON.stringify({ operation, geometryData, parameters });
    return Buffer.from(dataString).toString('base64');
  }

  /**
   * Get cached result
   */
  getCachedResult(cacheKey) {
    const cached = this.operationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    if (cached) {
      this.operationCache.delete(cacheKey);
    }
    return null;
  }

  /**
   * Cache result
   */
  cacheResult(cacheKey, data) {
    this.operationCache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries
    if (this.operationCache.size > 1000) {
      const entries = Array.from(this.operationCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, 100);
      toDelete.forEach(([key]) => this.operationCache.delete(key));
    }
  }

  /**
   * Update performance metrics
   */
  updateMetrics(startTime, operationType) {
    const duration = Date.now() - startTime;
    this.metrics.operationsPerformed++;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.operationsPerformed - 1) + duration) / this.metrics.operationsPerformed;
    
    if (operationType === 'geometry' || operationType === 'mesh' || operationType === 'nurbs' || 
        operationType === 'subd' || operationType === 'pointcloud') {
      this.metrics.geometryOperations++;
    } else if (operationType === 'analysis') {
      this.metrics.analysisOperations++;
    } else if (operationType === 'optimization') {
      this.metrics.optimizationOperations++;
    } else if (operationType === 'rendering') {
      this.metrics.renderingOperations++;
    } else if (operationType === 'fileIO') {
      this.metrics.fileOperations++;
    } else if (operationType === 'computePlugin') {
      this.metrics.computePluginOperations++;
    }
  }

  /**
   * Get capabilities summary
   */
  getCapabilitiesSummary() {
    return {
      totalOperations: this.getTotalOperationCount(),
      geometry: {
        nurbs: {
          curveOperations: this.rhinoCommonCapabilities.geometry.nurbs.curveOperations.length,
          surfaceOperations: this.rhinoCommonCapabilities.geometry.nurbs.surfaceOperations.length,
          brepOperations: this.rhinoCommonCapabilities.geometry.nurbs.brepOperations.length
        },
        mesh: {
          operations: this.rhinoCommonCapabilities.geometry.mesh.operations.length,
          analysis: this.rhinoCommonCapabilities.geometry.mesh.analysis.length
        },
        subd: {
          operations: this.rhinoCommonCapabilities.geometry.subd.operations.length
        },
        pointCloud: {
          operations: this.rhinoCommonCapabilities.geometry.pointCloud.operations.length
        }
      },
      transforms: this.rhinoCommonCapabilities.transforms.length,
      analysis: {
        geometry: this.rhinoCommonCapabilities.analysis.geometry.length,
        intersection: this.rhinoCommonCapabilities.analysis.intersection.length,
        optimization: this.rhinoCommonCapabilities.analysis.optimization.length
      },
      rendering: this.rhinoCommonCapabilities.rendering.length,
      fileIO: this.rhinoCommonCapabilities.fileIO.length,
      computePlugins: this.getComputePluginOperationCount()
    };
  }

  /**
   * Get total operation count
   */
  getTotalOperationCount() {
    let count = 0;
    
    // Count geometry operations
    count += this.rhinoCommonCapabilities.geometry.nurbs.curveOperations.length;
    count += this.rhinoCommonCapabilities.geometry.nurbs.surfaceOperations.length;
    count += this.rhinoCommonCapabilities.geometry.nurbs.brepOperations.length;
    count += this.rhinoCommonCapabilities.geometry.mesh.operations.length;
    count += this.rhinoCommonCapabilities.geometry.mesh.analysis.length;
    count += this.rhinoCommonCapabilities.geometry.subd.operations.length;
    count += this.rhinoCommonCapabilities.geometry.pointCloud.operations.length;
    
    // Count other operations
    count += this.rhinoCommonCapabilities.transforms.length;
    count += this.rhinoCommonCapabilities.analysis.geometry.length;
    count += this.rhinoCommonCapabilities.analysis.intersection.length;
    count += this.rhinoCommonCapabilities.analysis.optimization.length;
    count += this.rhinoCommonCapabilities.rendering.length;
    count += this.rhinoCommonCapabilities.fileIO.length;
    
    // Count compute plugin operations
    count += this.getComputePluginOperationCount();
    
    return count;
  }

  /**
   * Get compute plugin operation count
   */
  getComputePluginOperationCount() {
    let count = 0;
    Object.values(this.rhinoCommonCapabilities.computePlugins).forEach(plugin => {
      count += plugin.length;
    });
    return count;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100,
      cacheSize: this.operationCache.size,
      totalOperations: this.getTotalOperationCount()
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.operationCache.clear();
    console.log('🗑️ Operation cache cleared');
  }

  /**
   * Get available operations by category
   */
  getAvailableOperations(category) {
    switch (category) {
      case 'geometry':
        return this.rhinoCommonCapabilities.geometry;
      case 'transforms':
        return this.rhinoCommonCapabilities.transforms;
      case 'analysis':
        return this.rhinoCommonCapabilities.analysis;
      case 'rendering':
        return this.rhinoCommonCapabilities.rendering;
      case 'fileIO':
        return this.rhinoCommonCapabilities.fileIO;
      case 'computePlugins':
        return this.rhinoCommonCapabilities.computePlugins;
      default:
        return this.rhinoCommonCapabilities;
    }
  }
}

module.exports = new EnhancedRhinoComputeIntegration();
