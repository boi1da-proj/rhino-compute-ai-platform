const rhinoConfig = require('../config/rhino-compute');

class OptimizationController {
  async testConnection(req, res) {
    try {
      const status = await rhinoConfig.getServiceStatus();
      if (!status.ok) {
        return res.status(503).json({ success: false, message: status.error || 'Rhino.Compute unavailable' });
      }
      return res.json({ success: true, version: status.version, url: rhinoConfig.url });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getCapabilities(req, res) {
    // Minimal capability set for UI
    res.json({
      success: true,
      data: {
        algorithms: ['standard', 'beso', 'levelset', 'multiobjective', 'adaptivemesh', 'stressbased', 'frequencybased', 'sensitivity'],
        maxFileSizeMB: 50,
        formats: ['3dm', 'stl', 'obj']
      }
    });
  }

  async getPerformanceMetrics(req, res) {
    res.json({
      success: true,
      data: {
        uptimeMs: process.uptime() * 1000,
        rhinoUrl: rhinoConfig.url
      }
    });
  }

  async executeTopOpt(req, res) {
    try {
      // In a real implementation, forward to Rhino.Compute Hops/endpoint
      const params = JSON.parse(req.body?.params || '{}');
      return res.json({
        success: true,
        requestId: `req_${Date.now()}`,
        processingTime: 1234,
        data: {
          message: 'Topology optimization submitted (stub)',
          params
        }
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async executeHops(req, res) {
    try {
      const params = JSON.parse(req.body?.params || '{}');
      return res.json({
        success: true,
        requestId: `hops_${Date.now()}`,
        processingTime: 789,
        data: {
          message: 'Hops execution submitted (stub)',
          params
        }
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new OptimizationController();