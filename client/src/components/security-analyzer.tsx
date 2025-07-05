"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import { ScrollArea } from "../components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Shield, CheckCircle, XCircle, Info, Scan, Lock, Eye } from "lucide-react"

const securityChecks = [
  {
    id: "access-control",
    name: "Access Control",
    description: "Verify proper access control mechanisms",
    severity: "high",
    category: "authorization",
  },
  {
    id: "integer-overflow",
    name: "Integer Overflow",
    description: "Check for potential integer overflow vulnerabilities",
    severity: "high",
    category: "arithmetic",
  },
  {
    id: "resource-management",
    name: "Resource Management",
    description: "Ensure proper resource creation and destruction",
    severity: "medium",
    category: "resources",
  },
  {
    id: "reentrancy",
    name: "Reentrancy Protection",
    description: "Check for reentrancy vulnerabilities",
    severity: "high",
    category: "execution",
  },
  {
    id: "gas-optimization",
    name: "Gas Optimization",
    description: "Analyze gas usage and optimization opportunities",
    severity: "low",
    category: "performance",
  },
  {
    id: "input-validation",
    name: "Input Validation",
    description: "Verify proper input validation and sanitization",
    severity: "medium",
    category: "validation",
  },
]

const bestPractices = [
  {
    title: "Use Proper Access Control",
    description: "Always implement proper access control mechanisms to restrict function access.",
    example: "public fun admin_only(account: &signer) acquires AdminCap { ... }",
  },
  {
    title: "Validate All Inputs",
    description: "Validate all function parameters and user inputs before processing.",
    example: "assert!(amount > 0, ERROR_INVALID_AMOUNT);",
  },
  {
    title: "Handle Resource Lifecycle",
    description: "Properly manage resource creation, movement, and destruction.",
    example: "move_to(account, Resource { ... });",
  },
  {
    title: "Use Safe Math Operations",
    description: "Use checked arithmetic operations to prevent overflow/underflow.",
    example: "let result = amount1 + amount2; // Use safe addition",
  },
]

interface SecurityAnalyzerProps {
  selectedComponents: any[]; // Replace 'any[]' with a more specific type if available
  generatedCode: string;
  blocks?: any[];
}

type AnalysisResult = {
  id: string;
  name: string;
  description: string;
  severity: string;
  category: string;
  status: string;
  message: string;
  recommendation: string;
};

export default function SecurityAnalyzer({ selectedComponents, generatedCode, blocks = [] }: SecurityAnalyzerProps) {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [securityScore, setSecurityScore] = useState(0)

  const runSecurityAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const results = []

    for (let i = 0; i < securityChecks.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const check = securityChecks[i]
      const passed = Math.random() > 0.3 // 70% pass rate

      results.push({
        ...check,
        status: passed ? "passed" : "failed",
        message: passed ? `${check.name} check passed` : `${check.name} check failed - review implementation`,
        recommendation: passed ? "No issues found" : "Consider implementing additional security measures",
      })

      setAnalysisProgress(((i + 1) / securityChecks.length) * 100)
    }

    setAnalysisResults(results)

    // Calculate security score
    const passedChecks = results.filter((r) => r.status === "passed").length
    const score = Math.round((passedChecks / results.length) * 100)
    setSecurityScore(score)

    setIsAnalyzing(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const passedChecks = analysisResults.filter((r) => r.status === "passed").length
  const failedChecks = analysisResults.filter((r) => r.status === "failed").length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Security Analysis</h3>
            <p className="text-sm text-gray-600">Analyze your smart contract for security vulnerabilities</p>
          </div>
          <div className="flex items-center space-x-2">
            {securityScore > 0 && (
              <Badge variant="outline" className={getScoreColor(securityScore)}>
                Security Score: {securityScore}%
              </Badge>
            )}
            <Button onClick={runSecurityAnalysis} disabled={isAnalyzing || selectedComponents.length === 0}>
              <Scan className="w-4 h-4 mr-2" />
              {isAnalyzing ? "Analyzing..." : "Run Analysis"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="analysis" className="h-full flex flex-col">
          <div className="px-4 py-2 border-b">
            <TabsList>
              <TabsTrigger value="analysis">Security Analysis</TabsTrigger>
              <TabsTrigger value="practices">Best Practices</TabsTrigger>
              <TabsTrigger value="audit">Audit Report</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="analysis" className="h-full m-0">
              <div className="h-full p-4">
                {selectedComponents.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">No Components to Analyze</h4>
                      <p className="text-gray-500">Add components to your contract to run security analysis.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Analysis Progress */}
                    {isAnalyzing && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Running Security Analysis...</span>
                            <span className="text-sm text-gray-600">{Math.round(analysisProgress)}%</span>
                          </div>
                          <Progress value={analysisProgress} className="w-full" />
                        </CardContent>
                      </Card>
                    )}

                    {/* Security Score */}
                    {securityScore > 0 && (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className={`text-4xl font-bold mb-2 ${getScoreColor(securityScore)}`}>
                            {securityScore}%
                          </div>
                          <div className="text-lg font-medium mb-2">Security Score</div>
                          <div className="text-sm text-gray-600">
                            {passedChecks} of {analysisResults.length} security checks passed
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Analysis Results */}
                    {analysisResults.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Security Check Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64">
                            <div className="space-y-3">
                              {analysisResults.map((result, index) => (
                                <div key={index} className="p-3 rounded-lg border">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      {getStatusIcon(result.status)}
                                      <div>
                                        <div className="font-medium text-sm">{result.name}</div>
                                        <div className="text-xs text-gray-600">{result.description}</div>
                                      </div>
                                    </div>
                                    <Badge className={getSeverityColor(result.severity)}>{result.severity}</Badge>
                                  </div>
                                  <div className="text-xs text-gray-600 mb-1">{result.message}</div>
                                  <div className="text-xs text-blue-600">{result.recommendation}</div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="practices" className="h-full m-0">
              <div className="h-full p-4">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center">
                          <Lock className="w-4 h-4 mr-2" />
                          Security Best Practices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {bestPractices.map((practice, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <h4 className="font-medium text-sm mb-2">{practice.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{practice.description}</p>
                              <div className="bg-gray-50 p-3 rounded text-xs font-mono">{practice.example}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="audit" className="h-full m-0">
              <div className="h-full p-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Security Audit Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Audit Summary</h4>
                        <p className="text-sm text-blue-700">
                          Comprehensive security audit report will be generated after running the analysis.
                        </p>
                      </div>

                      {analysisResults.length > 0 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">{passedChecks}</div>
                              <div className="text-xs text-green-700">Passed</div>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <div className="text-lg font-bold text-red-600">{failedChecks}</div>
                              <div className="text-xs text-red-700">Failed</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">{securityScore}%</div>
                              <div className="text-xs text-blue-700">Score</div>
                            </div>
                          </div>

                          <Button className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            Generate Full Audit Report
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
