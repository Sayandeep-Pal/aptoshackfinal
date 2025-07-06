import { useState } from "react"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Separator } from "../components/ui/separator"
import { Code, Save, Upload, Eye, Edit } from "lucide-react" // Import Edit Icon
import ComponentLibrary from "../components/component-library"
import VisualCanvas from "../components/visual-canvas"
import CodePreview from "../components/code-preview"
import TestingSuite from "../components/testing-suite"
import DeploymentPanel from "../components/deployment-panel"
import SecurityAnalyzer from "../components/security-analyzer"
import ManualDeploymentPanel from "../components/manual-deployment-pannel"



interface Block {
  id: string
  name: string
  type: string
  template: string
  instanceId: string
  position: { x: number; y: number }
  connections: { input?: string; outputs: string[] }
  parameters: Record<string, string>
}

interface Connection {
  from: string
  to: string
  fromPort: string
  toPort: string
}

export default function BuilderPage({ ProjectName }: { ProjectName: string }) {
  const [activeTab, setActiveTab] = useState("design")
  const [selectedComponents, setSelectedComponents] = useState([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [generatedCode, setGeneratedCode] = useState("")
  const [projectName, setProjectName] = useState(ProjectName); // State for project name
  const [isEditingProjectName, setIsEditingProjectName] = useState(false); // State for edit mode

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const toggleEditProjectName = () => {
    setIsEditingProjectName(!isEditingProjectName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Zero Move</span>
            </div>
            <Separator orientation="vertical" className="h-6" />

            {/* Editable Project Name */}
            {isEditingProjectName ? (
              <input
                type="text"
                value={projectName}
                onChange={handleProjectNameChange}
                onBlur={toggleEditProjectName} // Stop editing on blur (focus out)
                className="text-sm text-gray-600 font-medium border rounded p-1"
                autoFocus  // Automatically focus the input field when edit mode is enabled
              />
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">{projectName}</span>
                <Button variant="ghost" size="icon" onClick={toggleEditProjectName}>
                  <Edit className="w-4 h-4" /> {/* Edit icon */}
                </Button>
              </div>
            )}

          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => {localStorage.removeItem('projectName_'); window.location.href="/builder"}}>
              <Save className="w-4 h-4 mr-2" />
              New Project
            </Button>
            {/* <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button> */}
            {/* <Button size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Deploy
            </Button> */}
            {/* <WalletSelector /> */}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Component Library */}
        <div className="w-80 border-r bg-white overflow-y-auto">
          <ComponentLibrary />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b px-6 py-2">
              <TabsList>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="deploy">Deploy</TabsTrigger>
                <TabsTrigger value="ManualDeployment">Manual Deployment</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="design" className="h-full m-0">
                <VisualCanvas
                  selectedComponents={selectedComponents}
                  setSelectedComponents={setSelectedComponents}
                  blocks={blocks}
                  setBlocks={setBlocks}
                  connections={connections}
                  setConnections={setConnections}
                  setGeneratedCode={setGeneratedCode}
                  ProjectName={projectName} // Pass project name to VisualCanvas
                  setProjectName={setProjectName}
                />
              </TabsContent>

              <TabsContent value="code" className="h-full m-0">
                <CodePreview code={generatedCode} selectedComponents={selectedComponents} blocks={blocks} />
              </TabsContent>

              <TabsContent value="deploy" className="h-full m-0">
                <DeploymentPanel
                  selectedComponents={selectedComponents}
                  generatedCode={generatedCode}
                  blocks={blocks}
                />
              </TabsContent>

              <TabsContent value="ManualDeployment" className="h-full m-0">
                <ManualDeploymentPanel blocks={blocks} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}