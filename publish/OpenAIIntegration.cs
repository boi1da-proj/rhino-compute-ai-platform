using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Rhino;
using Rhino.Geometry;
using ComputePlugIn.AI;

namespace ComputePlugIn
{
    /// <summary>
    /// OpenAI Integration for intelligent design optimization and analysis
    /// Leverages GPT-4o for multimodal understanding and o1 for complex reasoning
    /// Now uses the comprehensive OpenAIApiClient
    /// </summary>
    public static class OpenAIIntegration
    {
        private static readonly OpenAIApiClient _apiClient = new OpenAIApiClient();

        /// <summary>
        /// AI-powered design optimization using o1 model for complex reasoning
        /// Perfect for topology optimization parameter tuning
        /// </summary>
        public static async Task<OptimizationResult> OptimizeDesignWithAI(
            string meshId,
            string designGoals,
            Dictionary<string, object> constraints)
        {
            var systemPrompt = @"
                You are an expert structural engineer and computational designer.
                Analyze the given mesh geometry and constraints to provide optimal parameters
                for topology optimization. Consider:
                - Structural efficiency
                - Material usage minimization
                - Manufacturing constraints
                - Load path optimization
                
                Return a JSON object with recommended parameters.
            ";

            var userPrompt = $@"
                Design Goals: {designGoals}
                Constraints: {JsonConvert.SerializeObject(constraints)}
                
                Provide optimal parameters for:
                - Volume fraction (0.1-0.9)
                - Penalty factor (1-5)
                - Filter radius
                - Convergence criteria
                - Load case priorities
            ";

            var response = await _apiClient.CreateChatCompletion(
                userPrompt, 
                systemPrompt, 
                "o1-preview",
                temperature: 1.0,
                maxTokens: 10000,
                responseFormat: "json_object"
            );

            var parameters = JsonConvert.DeserializeObject<Dictionary<string, object>>(
                response.Choices?.FirstOrDefault()?.Message?.Content ?? "{}"
            );

            // Execute topology optimization with AI-recommended parameters
            var topOptResult = await ExecuteTopologyOptimization(meshId, parameters);

            return new OptimizationResult
            {
                RecommendedParameters = parameters,
                OptimizedGeometry = topOptResult,
                AIReasoning = response.Choices?.FirstOrDefault()?.Message?.Content,
                Timestamp = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Visual analysis of rendered views using GPT-4o's vision capabilities
        /// Analyzes structural integrity, aesthetic quality, and design issues
        /// </summary>
        public static async Task<VisualAnalysisResult> AnalyzeRenderedView(
            string imagePath,
            string analysisType = "structural")
        {
            var analysisPrompt = analysisType switch
            {
                "structural" => @"
                    Analyze this structural design rendering for:
                    - Potential stress concentrations (look for sharp corners, sudden transitions)
                    - Load path efficiency
                    - Support adequacy
                    - Material distribution effectiveness
                    - Manufacturing feasibility
                    Identify specific areas of concern with coordinates if visible.",
                
                "aesthetic" => @"
                    Evaluate this architectural design for:
                    - Visual balance and proportion
                    - Material expression
                    - Light and shadow quality
                    - Surface articulation
                    - Overall design coherence",
                
                "panelization" => @"
                    Analyze this panelized surface for:
                    - Panel size uniformity
                    - Edge condition quality
                    - Curvature distribution
                    - Fabrication complexity
                    - Joint/connection feasibility",
                
                _ => "Analyze this design image comprehensively."
            };

            var response = await _apiClient.AnalyzeViewportImage(imagePath, analysisPrompt, 1000);
            
            return new VisualAnalysisResult
            {
                AnalysisType = analysisType,
                Findings = response,
                ImagePath = imagePath,
                Timestamp = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Generate Grasshopper script using AI based on natural language description
        /// </summary>
        public static async Task<string> GenerateGrasshopperScript(string description)
        {
            var systemPrompt = @"
                You are an expert Grasshopper/Rhino developer.
                Generate Python code for Grasshopper components based on the description.
                Use RhinoCommon API and follow these patterns:
                - Import required libraries (Rhino, Rhino.Geometry, etc.)
                - Define clear input/output parameters
                - Include error handling
                - Add helpful comments
                - Follow Grasshopper Python component conventions
            ";

            var userPrompt = $@"
                Generate a Grasshopper Python script for: {description}
                
                Include:
                - Proper input parameter definitions
                - Output parameter definitions
                - Main logic implementation
                - Error handling
            ";

            var response = await CallOpenAI(userPrompt, systemPrompt, "gpt-4o");
            return ExtractCodeFromResponse(response);
        }



        /// <summary>
        /// AI-assisted mesh repair and optimization
        /// </summary>
        public static async Task<MeshRepairResult> RepairMeshWithAI(
            Guid meshId,
            byte[] meshData)
        {
            // Analyze mesh issues
            var meshAnalysis = AnalyzeMeshIssues(meshId);
            
            var systemPrompt = @"
                You are a computational geometry expert.
                Based on the mesh analysis, recommend repair strategies for:
                - Non-manifold edges
                - Degenerate faces
                - Vertex welding tolerances
                - Normal unification
                - Hole filling strategies
            ";

            var userPrompt = $@"
                Mesh Issues Found:
                - Non-manifold edges: {meshAnalysis.NonManifoldEdges}
                - Degenerate faces: {meshAnalysis.DegenerateFaces}
                - Open edges: {meshAnalysis.OpenEdges}
                - Duplicate vertices: {meshAnalysis.DuplicateVertices}
                
                Recommend repair parameters and sequence.
            ";

            var response = await _apiClient.CreateChatCompletion(
                userPrompt, 
                systemPrompt, 
                "o1-mini",
                temperature: 1.0,
                maxTokens: 5000,
                responseFormat: "json_object"
            );
            var repairStrategy = JsonConvert.DeserializeObject<MeshRepairStrategy>(
                response.Choices?.FirstOrDefault()?.Message?.Content ?? "{}"
            );

            // Apply repairs based on AI recommendations
            var repairedMesh = ApplyMeshRepairs(meshId, repairStrategy);

            return new MeshRepairResult
            {
                OriginalMeshId = meshId,
                RepairedMeshId = repairedMesh,
                RepairStrategy = repairStrategy,
                AIRecommendations = response
            };
        }

        /// <summary>
        /// Natural language interface for Rhino.Compute operations
        /// </summary>
        public static async Task<ComputeResult> ProcessNaturalLanguageCommand(
            string command,
            Dictionary<string, object> context)
        {
            var systemPrompt = @"
                You are a Rhino.Compute API assistant.
                Convert natural language commands to API calls.
                Available operations:
                - ViewCapture (left, right, top, axo, oblique)
                - StressAnalysis (basic, extended, visualization)
                - DwgExport (single, multiple, with_layers)
                - Panelization (subdivision, diamond, hexagonal, triangulated)
                - TopologyOptimization
                
                Return a JSON object with:
                {
                    ""operation"": ""operation_name"",
                    ""parameters"": { ... },
                    ""explanation"": ""what this will do""
                }
            ";

            var userPrompt = $@"
                Command: {command}
                Context: {JsonConvert.SerializeObject(context)}
                
                Convert to appropriate Rhino.Compute operation.
            ";

            var response = await _apiClient.CreateChatCompletion(
                userPrompt, 
                systemPrompt, 
                "gpt-4o",
                temperature: 0.3,
                maxTokens: 2000,
                responseFormat: "json_object"
            );
            var apiCall = JsonConvert.DeserializeObject<ApiCall>(
                response.Choices?.FirstOrDefault()?.Message?.Content ?? "{}"
            );

            // Execute the determined operation
            var result = await ExecuteComputeOperation(apiCall);

            return new ComputeResult
            {
                Command = command,
                Operation = apiCall,
                Result = result,
                Timestamp = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Streaming responses for long-running operations
        /// </summary>
        public static async IAsyncEnumerable<string> StreamDesignIterations(
            string baseDesign,
            int iterations)
        {
            var systemPrompt = @"
                Generate design variations based on parametric rules.
                Each iteration should explore different aspects:
                - Geometric transformations
                - Pattern variations
                - Density modifications
                - Structural optimizations
            ";

            for (int i = 0; i < iterations; i++)
            {
                var userPrompt = $"Generate iteration {i + 1} of {iterations} for: {baseDesign}";
                
                var response = await _apiClient.CreateChatCompletion(
                    userPrompt,
                    systemPrompt,
                    "gpt-4o",
                    temperature: 0.7 + (i * 0.1), // Increase creativity with iterations
                    maxTokens: 1000,
                    stream: true
                );

                yield return response.Choices?.FirstOrDefault()?.Message?.Content ?? "";
            }
        }

                // Helper methods
        private static string ExtractCodeFromResponse(string response)
        {
            // Extract code from markdown code blocks
            var lines = response.Split('\n');
            var inCodeBlock = false;
            var code = new List<string>();
            
            foreach (var line in lines)
            {
                if (line.StartsWith("```"))
                {
                    inCodeBlock = !inCodeBlock;
                    continue;
                }
                if (inCodeBlock)
                {
                    code.Add(line);
                }
            }
            
            return string.Join("\n", code);
        }

        // Stub methods for integration
        private static Task<string> ExecuteTopologyOptimization(string meshId, Dictionary<string, object> parameters)
        {
            // Call your existing topology optimization
            return Task.FromResult($"optimized_{meshId}");
        }

        private static MeshAnalysis AnalyzeMeshIssues(Guid meshId)
        {
            // Analyze mesh using Rhino methods
            return new MeshAnalysis();
        }

        private static Guid ApplyMeshRepairs(Guid meshId, MeshRepairStrategy strategy)
        {
            // Apply repairs using RhinoCommon
            return Guid.NewGuid();
        }

        private static Task<object> ExecuteComputeOperation(ApiCall apiCall)
        {
            // Execute the determined operation
            return Task.FromResult<object>(new { success = true });
        }
    }

    // Supporting classes
    public class OptimizationResult
    {
        public Dictionary<string, object> RecommendedParameters { get; set; }
        public string OptimizedGeometry { get; set; }
        public string AIReasoning { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class VisualAnalysisResult
    {
        public string AnalysisType { get; set; }
        public string Findings { get; set; }
        public string ImagePath { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class MeshRepairResult
    {
        public Guid OriginalMeshId { get; set; }
        public Guid RepairedMeshId { get; set; }
        public MeshRepairStrategy RepairStrategy { get; set; }
        public string AIRecommendations { get; set; }
    }

    public class MeshRepairStrategy
    {
        public double WeldingTolerance { get; set; }
        public bool FillHoles { get; set; }
        public bool UnifyNormals { get; set; }
        public bool RemoveDegenerateFaces { get; set; }
    }

    public class MeshAnalysis
    {
        public int NonManifoldEdges { get; set; }
        public int DegenerateFaces { get; set; }
        public int OpenEdges { get; set; }
        public int DuplicateVertices { get; set; }
    }

    public class ComputeResult
    {
        public string Command { get; set; }
        public ApiCall Operation { get; set; }
        public object Result { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class ApiCall
    {
        public string Operation { get; set; }
        public Dictionary<string, object> Parameters { get; set; }
        public string Explanation { get; set; }
    }
}
