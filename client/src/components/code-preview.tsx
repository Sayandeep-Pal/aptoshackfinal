"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { Copy, Download, Eye, Code } from "lucide-react"
import { ScrollArea } from "../components/ui/scroll-area"

interface CodePreviewProps {
  code: string;
  selectedComponents: any[]; // Replace 'any' with a more specific type if available
  blocks?: any[]; // Replace 'any' with a more specific type if available
}

export default function CodePreview({ code, selectedComponents, blocks = [] }: CodePreviewProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "smart_contract.move"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateTestCode = () => {
    return `#[test_only]
module MyContract::SmartContractTests {
    use MyContract::SmartContract;
    use std::signer;
    use aptos_framework::account;

    #[test(account = @0x1)]
    public fun test_contract_initialization(account: signer) {
        // Test contract initialization
        SmartContract::initialize(&account);
        
        // Add your test assertions here
        assert!(true, 0);
    }

    #[test]
    public fun test_contract_functions() {
        // Test individual contract functions
        assert!(true, 0);
    }
}`
  }

  const generateDeployScript = () => {
    return `script {
    use MyContract::SmartContract;
    
    fun main(account: signer) {
        SmartContract::initialize(&account);
    }
}`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Generated Move Code</h3>
            <p className="text-sm text-gray-600">Auto-generated from your visual contract design</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {selectedComponents.length} component{selectedComponents.length !== 1 ? "s" : ""}
            </Badge>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCode}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Code Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="contract" className="h-full flex flex-col">
          <div className="px-4 py-2 border-b">
            <TabsList>
              <TabsTrigger value="contract">Contract Code</TabsTrigger>
              {/* <TabsTrigger value="tests">Test Code</TabsTrigger>
              <TabsTrigger value="deploy">Deploy Script</TabsTrigger> */}
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="contract" className="h-full m-0">
              <div className="h-full p-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      SmartContract.move
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full pb-4">
                    <ScrollArea className="h-full">
                      <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        <code className="language-move">
                          {code || "// No code generated yet. Add components to generate Move code."}
                        </code>
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tests" className="h-full m-0">
              <div className="h-full p-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      SmartContractTests.move
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full pb-4">
                    <ScrollArea className="h-full">
                      <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        <code className="language-move">{generateTestCode()}</code>
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="deploy" className="h-full m-0">
              <div className="h-full p-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      deploy.move
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full pb-4">
                    <ScrollArea className="h-full">
                      <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        <code className="language-move">{generateDeployScript()}</code>
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Code Statistics */}
      <div className="p-4 border-t bg-gray-50">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold">{code.split("\n").length}</div>
            <div className="text-xs text-gray-600">Lines of Code</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{selectedComponents.length}</div>
            <div className="text-xs text-gray-600">Components</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{(code.match(/public fun/g) || []).length}</div>
            <div className="text-xs text-gray-600">Public Functions</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{(code.match(/struct/g) || []).length}</div>
            <div className="text-xs text-gray-600">Structs</div>
          </div>
        </div>
      </div>
    </div>
  )
}
