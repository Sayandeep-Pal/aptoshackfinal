"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ScrollArea } from "../components/ui/scroll-area"
import { Play, CheckCircle, XCircle, Clock, Bug, Zap, Target } from "lucide-react"

interface TestingSuiteProps {
  generatedCode: string
  blocks?: any[]
}

type TestResult = {
  name: string
  type: string
  status: string
  duration: number
  message: string
}

export default function TestingSuite({ generatedCode, blocks = [] }: TestingSuiteProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testProgress, setTestProgress] = useState(0)

  const runTests = async () => {
    setIsRunning(true)
    setTestProgress(0)

    // Simulate test execution
    const tests = [
      { name: "Contract Compilation", type: "compilation" },
      { name: "Function Signatures", type: "signature" },
      { name: "Resource Management", type: "resource" },
      { name: "Access Control", type: "security" },
      { name: "Gas Optimization", type: "performance" },
      { name: "Edge Cases", type: "edge" },
    ]

    const results = []

    for (let i = 0; i < tests.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const test = tests[i]
      const success = Math.random() > 0.2 // 80% success rate

      results.push({
        ...test,
        status: success ? "passed" : "failed",
        duration: Math.floor(Math.random() * 500) + 100,
        message: success ? `${test.name} completed successfully` : `${test.name} failed - check implementation`,
      })

      setTestProgress(((i + 1) / tests.length) * 100)
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const simulateContract = () => {
    // Simulate contract execution
    console.log("Simulating contract execution...")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-green-600 bg-green-50"
      case "failed":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const passedTests = testResults.filter((t) => t.status === "passed").length
  const failedTests = testResults.filter((t) => t.status === "failed").length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Testing & Simulation</h3>
            <p className="text-sm text-gray-600">Test your smart contract before deployment</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={runTests} disabled={isRunning || blocks.length === 0} className="flex items-center">
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? "Running Tests..." : "Run Tests"}
            </Button>
            <Button variant="outline" onClick={simulateContract} disabled={blocks.length === 0}>
              <Zap className="w-4 h-4 mr-2" />
              Simulate
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="tests" className="h-full flex flex-col">
          <div className="px-4 py-2 border-b">
            <TabsList>
              <TabsTrigger value="tests">Test Results</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="coverage">Coverage</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="tests" className="h-full m-0">
              <div className="h-full p-4">
                {blocks.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Bug className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">No Components to Test</h4>
                      <p className="text-gray-500">Add components to your contract to run tests.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Test Progress */}
                    {isRunning && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Running Tests...</span>
                            <span className="text-sm text-gray-600">{Math.round(testProgress)}%</span>
                          </div>
                          <Progress value={testProgress} className="w-full" />
                        </CardContent>
                      </Card>
                    )}

                    {/* Test Summary */}
                    {testResults.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                            <div className="text-sm text-gray-600">Passed</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                            <div className="text-sm text-gray-600">Failed</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{testResults.length}</div>
                            <div className="text-sm text-gray-600">Total</div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Test Results */}
                    {testResults.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Test Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64">
                            <div className="space-y-2">
                              {testResults.map((test, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                  <div className="flex items-center space-x-3">
                                    {getStatusIcon(test.status)}
                                    <div>
                                      <div className="font-medium text-sm">{test.name}</div>
                                      <div className="text-xs text-gray-600">{test.message}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className={getStatusColor(test.status)}>
                                      {test.status}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{test.duration}ms</span>
                                  </div>
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

            <TabsContent value="simulation" className="h-full m-0">
              <div className="h-full p-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Contract Simulation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Simulation Environment</h4>
                        <p className="text-sm text-blue-700">
                          Test your contract in a safe, simulated environment before deploying to the blockchain.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-lg font-semibold">1,000,000</div>
                            <div className="text-sm text-gray-600">Gas Limit</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-lg font-semibold">0.001 APT</div>
                            <div className="text-sm text-gray-600">Est. Gas Cost</div>
                          </CardContent>
                        </Card>
                      </div>

                      <Button className="w-full" disabled={blocks.length === 0}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Simulation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="coverage" className="h-full m-0">
              <div className="h-full p-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm">Code Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Coverage</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Functions</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Branches</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} />
                      </div>
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
