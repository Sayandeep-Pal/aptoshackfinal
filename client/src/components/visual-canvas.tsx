// "use client"

// import type React from "react"
// import { useState, useEffect, useRef, useCallback } from "react"
// import { Card, CardContent } from "../components/ui/card"
// import { Button } from "../components/ui/button"
// import { Badge } from "../components/ui/badge"
// import { Input } from "../components/ui/input"
// import { Label } from "../components/ui/label"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
// import { Textarea } from "../components/ui/textarea"
// import {
//   Trash2,
//   Settings,
//   Plus,
//   Play,
//   Code,
//   Variable,
//   Calculator,
//   ArrowLeft,
//   GitBranch,
//   Database,
//   Activity as FunctionIcon,
//   Hash,
//   Bug,
//   FileText,
//   RotateCcw,
//   Link,
// } from "lucide-react"

// // --- CONSTANTS AND TYPE DEFINITIONS ---

// const iconMap: { [key: string]: React.ComponentType<any> } = {
//   module: Code,
//   struct: Database,
//   resource: Settings,
//   "public-function": FunctionIcon,
//   "entry-function": FunctionIcon,
//   "private-function": FunctionIcon,
//   "let-variable": Variable,
//   mapping: Hash,
//   constant: Variable,
//   "if-statement": GitBranch,
//   "if-else": GitBranch,
//   "while-loop": RotateCcw,
//   calculate: Calculator,
//   compare: Calculator,
//   assign: ArrowLeft,
//   transfer: ArrowLeft,
//   mint: Settings,
//   burn: Settings,
//   assert: Bug,
//   log: FileText,
//   "move-to": Database,
//   "move-from": Database,
//   "borrow-global": Database,
//   "borrow-global-mut": Database,
// }

// const colorMap: { [key: string]: string } = {
//   structure: "bg-blue-500 border-blue-300",
//   function: "bg-green-500 border-green-300",
//   variable: "bg-purple-500 border-purple-300",
//   logic: "bg-yellow-500 border-yellow-300",
//   operation: "bg-orange-500 border-orange-300",
//   blockchain: "bg-indigo-500 border-indigo-300",
//   debug: "bg-red-500 border-red-300",
// }

// interface Block {
//   id: string // Template ID, e.g., "public-function"
//   name: string // Display name, e.g., "Public Function"
//   type: string // Category, e.g., "function"
//   instanceId: string // Unique ID for this specific block instance
//   position: { x: number; y: number }
//   parameters: Record<string, string>
// }

// interface Connection {
//   from: string // instanceId of the source block
//   to: string // instanceId of the destination block
//   // Note: The original 'fromPort'/'toPort' were too simple.
//   // A proper implementation would have named ports (e.g., 'then', 'else' for an if-block).
//   // We will infer this logic in the code generator for now.
// }

// interface VisualCanvasProps {
//   blocks: Block[]
//   setBlocks: (blocks: Block[]) => void
//   connections: Connection[]
//   setConnections: (connections: Connection[]) => void
//   setGeneratedCode: (code: string) => void
// }

// export default function VisualCanvas({
//   blocks,
//   setBlocks,
//   connections,
//   setConnections,
//   setGeneratedCode,
// }: VisualCanvasProps) {
//   const [dragOver, setDragOver] = useState(false)
//   const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
//   const [isConnecting, setIsConnecting] = useState(false)
//   const [connectionStart, setConnectionStart] = useState<{ blockId: string } | null>(null)
//   const [editingBlock, setEditingBlock] = useState<Block | null>(null)
//   const [tempParameters, setTempParameters] = useState<Record<string, string>>({})
//   const [isDragging, setIsDragging] = useState(false)
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const canvasRef = useRef<HTMLDivElement>(null)

//   // --- DRAG AND DROP LOGIC ---

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault()
//     setDragOver(true)
//   }

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault()
//     setDragOver(false)
//   }

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     setDragOver(false)

//     try {
//       const blockData = JSON.parse(e.dataTransfer.getData("application/json"))
//       const rect = canvasRef.current?.getBoundingClientRect()

//       const newBlock: Block = {
//         ...blockData,
//         instanceId: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
//         position: {
//           x: rect ? e.clientX - rect.left - 100 : 100,
//           y: rect ? e.clientY - rect.top - 25 : 100,
//         },
//         parameters: getDefaultParameters(blockData.id),
//       }

//       setBlocks([...blocks, newBlock])
//     } catch (error) {
//       console.error("Error parsing dropped block:", error)
//     }
//   }

//   // --- BLOCK & CONNECTION MANIPULATION ---

//   const removeBlock = (instanceId: string) => {
//     setBlocks(blocks.filter((block) => block.instanceId !== instanceId))
//     // Also remove any connections associated with this block
//     setConnections(connections.filter((conn) => conn.from !== instanceId && conn.to !== instanceId))
//   }

//   const updateBlockParameters = (instanceId: string, parameters: Record<string, string>) => {
//     setBlocks(blocks.map((block) => (block.instanceId === instanceId ? { ...block, parameters } : block)))
//   }

//   const handleConnectionStart = (blockId: string) => {
//     if (isConnecting && connectionStart) {
//       // Complete connection
//       if (connectionStart.blockId !== blockId) {
//         // Prevent self-connections & duplicate connections
//         const connectionExists = connections.some(
//           (c) => c.from === connectionStart.blockId && c.to === blockId,
//         )
//         if (!connectionExists) {
//           const newConnection: Connection = {
//             from: connectionStart.blockId,
//             to: blockId,
//           }
//           setConnections([...connections, newConnection])
//         }
//       }
//       setIsConnecting(false)
//       setConnectionStart(null)
//     } else {
//       // Start connection
//       setIsConnecting(true)
//       setConnectionStart({ blockId })
//     }
//   }

//   const removeConnection = (index: number) => {
//     setConnections(connections.filter((_, i) => i !== index))
//   }

//   // --- BLOCK DRAGGING LOGIC ---

//   const handleBlockMouseDown = (e: React.MouseEvent, blockId: string) => {
//     // Only drag if the mousedown is on the card itself, not on buttons or connection points
//     if ((e.target as HTMLElement).closest(".drag-handle")) {
//       const block = blocks.find((b) => b.instanceId === blockId)
//       if (block) {
//         setIsDragging(true)
//         setSelectedBlock(blockId)
//         const rect = canvasRef.current?.getBoundingClientRect()
//         if (rect) {
//           setDragOffset({
//             x: e.clientX - rect.left - block.position.x,
//             y: e.clientY - rect.top - block.position.y,
//           })
//         }
//       }
//     }
//   }

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (isDragging && selectedBlock) {
//       const rect = canvasRef.current?.getBoundingClientRect()
//       if (rect) {
//         const newX = e.clientX - rect.left - dragOffset.x
//         const newY = e.clientY - rect.top - dragOffset.y

//         setBlocks(
//           blocks.map((block) =>
//             block.instanceId === selectedBlock
//               ? { ...block, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
//               : block,
//           ),
//         )
//       }
//     }
//   }

//   const handleMouseUp = () => {
//     setIsDragging(false)
//     // No need to deselect block on mouse up, keep it selected
//   }

//   // --- CODE GENERATION (CORRECTED IMPLEMENTATION) ---

//   const generateMoveCode = useCallback(() => {
//     if (blocks.length === 0) {
//       setGeneratedCode("// Drag blocks from the toolbox to start building your contract.")
//       return
//     }

//     const blocksMap = new Map(blocks.map((b) => [b.instanceId, b]))
//     const connectionsFromMap = new Map<string, string[]>()
//     const connectionsToMap = new Map<string, string[]>()

//     connections.forEach((conn) => {
//       if (!connectionsFromMap.has(conn.from)) connectionsFromMap.set(conn.from, [])
//       connectionsFromMap.get(conn.from)!.push(conn.to)

//       if (!connectionsToMap.has(conn.to)) connectionsToMap.set(conn.to, [])
//       connectionsToMap.get(conn.to)!.push(conn.from)
//     })

//     const generateCodeForBlock = (block: Block): string => {
//       const p = block.parameters
//       switch (block.id) {
//         case "let-variable":
//           return `let ${p.name || "my_var"}: ${p.type || "u64"} = ${p.value || "0"};`
//         case "assign":
//           return `${p.variable || "my_var"} = ${p.value || "10"};`
//         case "calculate":
//           return `// Calculate: ${p.left || "a"} ${p.operator || "+"} ${p.right || "b"}`
//         case "compare":
//           return `// Compare: ${p.left || "a"} ${p.operator || "=="} ${p.right || "b"}`
//         case "assert":
//           return `assert!(${p.condition || "true"}, ${p.error_code || "0"});`
//         case "log":
//           return `// Log: ${p.message || "Debug message"}`
//         case "transfer":
//           return `// Transfer ${p.amount || "amount"} to ${p.to || "recipient"}`
//         case "mint":
//           return `// Mint ${p.amount || "amount"} to ${p.recipient || "account"}`
//         case "burn":
//           return `// Burn ${p.amount || "amount"}`

//         case "move-to": return `account::move_to<${p.resource_type || "MyResource"}>(&${p.signer || "account"}, ${p.resource_variable || "my_resource"});`
//         case "move-from": return `let ${p.assign_to || "resource_instance"} = account::move_from<${p.resource_type || "MyResource"}>(${p.address || "0x1"});`
//         case "borrow-global": return `let ${p.assign_to || "resource_ref"} = account::borrow_global<${p.resource_type || "MyResource"}>(${p.address || "0x1"});`
//         case "borrow-global-mut": return `let ${p.assign_to || "resource_mut_ref"} = account::borrow_global_mut<${p.resource_type || "MyResource"}>(${p.address || "0x1"});`
//         default:
//           return `// Unsupported block in this context: ${block.name}`
//       }
//     }

//     const generateCodeChain = (
//       startBlockId: string,
//       indent: string,
//       visited: Set<string>,
//     ): string => {
//       let code = ""
//       let currentId = startBlockId

//       while (currentId && !visited.has(currentId)) {
//         visited.add(currentId)
//         const block = blocksMap.get(currentId)
//         if (!block) break

//         const outgoingConnections = connectionsFromMap.get(currentId) || []

//         if (block.id === "if-else") {
//           code += `${indent}if (${block.parameters.condition || "true"}) {\n`
//           if (outgoingConnections[0]) {
//             code += generateCodeChain(outgoingConnections[0], indent + "    ", visited)
//           }
//           code += `${indent}} else {\n`
//           if (outgoingConnections[1]) {
//             code += generateCodeChain(outgoingConnections[1], indent + "    ", visited)
//           }
//           code += `${indent}}\n`
//           // After an if-else, the flow merges. This model doesn't support merge points,
//           // so we stop generating this chain here.
//           return code
//         } else if (block.id === "while-loop") {
//           code += `${indent}while (${block.parameters.condition || "true"}) {\n`
//           if (outgoingConnections[0]) {
//             code += generateCodeChain(outgoingConnections[0], indent + "    ", visited)
//           }
//           code += `${indent}}\n`
//           // The model doesn't support a separate "after loop" connection, so we stop the chain.
//           return code
//         } else {
//           code += `${indent}${generateCodeForBlock(block)}\n`
//           currentId = outgoingConnections[0] // Follow the first (and likely only) connection
//         }
//       }
//       return code
//     }


//     // Find the module block if present
//     const moduleBlock = blocks.find((b) => b.id === "module")
//     const moduleName = moduleBlock?.parameters.name?.trim() || "MyContract"
//     const moduleFile = moduleBlock?.parameters.module_name?.trim() || "SmartContract"

//     let code = `module ${moduleName}::${moduleFile} {\n`
//     code += `    use std::signer;\n\n`
//     code += `    use aptos_framework::account;\n\n` // Added for move/borrow functions

//     const processedBlockIds = new Set<string>()

//     // 1. Generate all top-level structures first
//     blocks.forEach((block) => {
//       if (block.type === "structure") {
//         switch (block.id) {
//           case "struct":
//             code += `    struct ${block.parameters.name || "MyStruct"} has key {\n`
//             code += `        ${(block.parameters.fields || "value: u64").replace(/\n/g, "\n        ")}\n`
//             code += `    }\n\n`
//             break
//           case "resource":
//             code += `    struct ${block.parameters.name || "MyResource"} has key, store {\n`
//             code += `        ${(block.parameters.fields || "data: vector<u8>").replace(/\n/g, "\n        ")}\n`
//             code += `    }\n\n`
//             break
//         }
//         processedBlockIds.add(block.instanceId)
//       }
//     })

//     // 2. Generate functions and their connected logic
//     const functionBlocks = blocks.filter((b) => b.type === "function")
//     functionBlocks.forEach((funcBlock) => {
//       const p = funcBlock.parameters
//       const params = funcBlock.id === "entry-function" ? `account: &signer${p.params ? `, ${p.params}` : ""}` : p.params || ""
//       const returnType = p.return_type ? ` -> ${p.return_type}` : ""
//       const visibility = funcBlock.id.includes("public") || funcBlock.id.includes("entry") ? "public " : ""
//       const entry = funcBlock.id.includes("entry") ? "entry " : ""
      
//       code += `    ${visibility}${entry}fun ${p.name || "my_function"}(${params})${returnType} {\n`
//       processedBlockIds.add(funcBlock.instanceId)
      
//       const visitedInFunc = new Set<string>([funcBlock.instanceId])
//       const startConnection = (connectionsFromMap.get(funcBlock.instanceId) || [])[0]
//       if (startConnection) {
//         code += generateCodeChain(startConnection, "        ", visitedInFunc)
//       }
      
//       // Mark all visited blocks as processed
//       visitedInFunc.forEach(id => processedBlockIds.add(id))
//       code += `    }\n\n`
//     })
    
//     // 3. Handle any orphaned logic blocks by putting them in a default init function
//     const orphanedBlocks = blocks.filter(b => !processedBlockIds.has(b.instanceId) && (b.type !== 'structure' && b.type !== 'function'))
//     if (orphanedBlocks.length > 0) {
//         code += `    public entry fun initialize(account: &signer) {\n`
//         const visitedOrphaned = new Set<string>();
//         orphanedBlocks.forEach(block => {
//             // Start a chain from any block that has no incoming execution connections
//             if(!connectionsToMap.has(block.instanceId)){
//                 code += generateCodeChain(block.instanceId, "        ", visitedOrphaned)
//             }
//         })
//         code += `    }\n\n`
//     }


//     code += `}`
//     setGeneratedCode(code)
//   }, [blocks, connections, setGeneratedCode])

//   useEffect(() => {
//     generateMoveCode()
//   }, [generateMoveCode])


//   // --- DIALOG & EDITOR LOGIC ---

//   const runBlocks = () => {
//     console.log("Simulating contract execution...")
//     console.log("This is where a VM or interpreter would run the generated code.")
//     console.log("Current State:", { blocks, connections })
//   }

//   const openEditDialog = (block: Block) => {
//     setEditingBlock(block)
//     setTempParameters({ ...block.parameters })
//     setIsDialogOpen(true)
//   }

//   const saveChanges = () => {
//     if (editingBlock) {
//       updateBlockParameters(editingBlock.instanceId, tempParameters)
//     }
//     closeEditDialog()
//   }

//   const closeEditDialog = () => {
//     setIsDialogOpen(false)
//     setEditingBlock(null)
//     setTempParameters({})
//   }

//   const handleTempParameterChange = (key: string, value: string) => {
//     setTempParameters((prev) => ({ ...prev, [key]: value }))
//   }

//   // --- RENDER LOGIC ---

//   const renderParameterEditor = (block: Block) => {
//     if (!block) return null
//     // This function is quite large and well-written in the original code.
//     // I'm including it here without significant changes as it was already correct.
//     const params = tempParameters;
//     switch (block.id) {
//         case "module":
//           return (
//             <div className="space-y-4">
//               <div><Label htmlFor="name">Module Name</Label><Input id="name" value={params.name || ""} onChange={e => handleTempParameterChange("name", e.target.value)} placeholder="MyContract" /></div>
//               <div><Label htmlFor="module_name">File Name</Label><Input id="module_name" value={params.module_name || ""} onChange={e => handleTempParameterChange("module_name", e.target.value)} placeholder="SmartContract" /></div>
//             </div>
//           )
//         case "public-function":
//         case "entry-function":
//         case "private-function":
//           return (
//             <div className="space-y-4">
//               <div><Label htmlFor="name">Function Name</Label><Input id="name" value={params.name || ""} onChange={(e) => handleTempParameterChange("name", e.target.value)} placeholder="my_function"/></div>
//               <div><Label htmlFor="params">Parameters</Label><Input id="params" value={params.params || ""} onChange={(e) => handleTempParameterChange("params", e.target.value)} placeholder="param1: u64, param2: address"/></div>
//               <div><Label htmlFor="return_type">Return Type</Label><Input id="return_type" value={params.return_type || ""} onChange={(e) => handleTempParameterChange("return_type", e.target.value)} placeholder="u64"/></div>
//             </div>
//           )
//         case "struct":
//         case "resource":
//           return (
//             <div className="space-y-4">
//               <div><Label htmlFor="name">Struct Name</Label><Input id="name" value={params.name || ""} onChange={(e) => handleTempParameterChange("name", e.target.value)} placeholder="MyStruct"/></div>
//               <div><Label htmlFor="fields">Fields (one per line)</Label><Textarea id="fields" value={params.fields || ""} onChange={(e) => handleTempParameterChange("fields", e.target.value)} placeholder="field1: u64,
// field2: address" rows={3}/></div>
//             </div>
//           )
//         case "let-variable":
//           return (
//             <div className="space-y-4">
//                 <div><Label htmlFor="name">Variable Name</Label><Input id="name" value={params.name || ""} onChange={e => handleTempParameterChange("name", e.target.value)} placeholder="my_var" /></div>
//                 <div>
//                     <Label htmlFor="type">Type</Label>
//                     <Select value={params.type || "u64"} onValueChange={value => handleTempParameterChange("type", value)}>
//                         <SelectTrigger><SelectValue /></SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="u64">u64</SelectItem>
//                           <SelectItem value="u128">u128</SelectItem>
//                           <SelectItem value="address">address</SelectItem>
//                           <SelectItem value="bool">bool</SelectItem>
//                           <SelectItem value="vector&lt;u8&gt;">vector&lt;u8&gt;</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>
//                 <div><Label htmlFor="value">Initial Value</Label><Input id="value" value={params.value || ""} onChange={e => handleTempParameterChange("value", e.target.value)} placeholder="0" /></div>
//             </div>
//           )
//         // ... other cases from the original code are fine and can be pasted here ...
//         case "if-else":
//         case "while-loop":
//             return (
//                 <div className="space-y-4">
//                     <div><Label htmlFor="condition">Condition</Label><Input id="condition" value={params.condition || ""} onChange={(e) => handleTempParameterChange("condition", e.target.value)} placeholder={block.id === 'while-loop' ? "counter < 10" : "true"}/></div>
//                 </div>
//             )
//         // Add all other cases for completeness
//         default:
//           return (
//             <div>
//               {Object.entries(params).map(([key, value]) => (
//                 <div key={key} className="mb-4">
//                   <Label htmlFor={key} className="capitalize">{key.replace(/_/g, " ")}</Label>
//                   <Input id={key} value={value} onChange={e => handleTempParameterChange(key, e.target.value)} />
//                 </div>
//               ))}
//               {Object.keys(params).length === 0 && <p className="text-sm text-gray-500">No editable parameters for this block.</p>}
//             </div>
//           )
//     }
//   }
  
//   // Default parameters function (from original, mostly correct)
//   const getDefaultParameters = (blockId: string): Record<string, string> => {

    
//       switch (blockId) {
//         // Function Blocks

//         case "module":
//         return { name: "MyContract", module_name: "SmartContract" }

//         case "public-function":
//         case "entry-function":
//         case "private-function":
//           return { name: "my_function", params: "", return_type: "" }

//         // Structure Blocks
//         case "struct":
//           return { name: "MyStruct", fields: "value: u64" }
//         case "resource":
//           return { name: "MyResource", fields: "data: vector<u8>" }
        
//         // Variable & State Blocks
//         case "let-variable":
//           return { name: "my_var", type: "u64", value: "0" }
//         case "assign":
//           return { variable: "my_var", value: "10" }
//         case "mapping":
//           return { name: "my_mapping", key_type: "address", value_type: "u64" }
//         case "constant":
//           return { name: "MY_CONSTANT", type: "u64", value: "100" }

//         // Logic & Control Flow Blocks
//         case "if-statement":
//         case "if-else":
//           return { condition: "true" }
//         case "while-loop":
//           return { condition: "counter < 10" }

//         // Operation Blocks
//         case "calculate":
//           return { left: "a", operator: "+", right: "b" }
//         case "compare":
//           return { left: "a", operator: "==", right: "b" }

//         // Blockchain & Resource Management Blocks
//         case "transfer":
//           return { from: "sender", to: "recipient", amount: "100" }
//         case "mint":
//           return { amount: "1000", recipient: "account" }
//         case "burn":
//           return { amount: "100" }
//         case "move-to":
//           return { signer: "account", resource_variable: "my_resource", resource_type: "MyResource" }
//         case "move-from":
//           return { assign_to: "my_resource_instance", resource_type: "MyResource", address: "0x1" }
//         case "borrow-global":
//           return { assign_to: "resource_ref", resource_type: "MyResource", address: "0x1" }
//         case "borrow-global-mut":
//           return { assign_to: "resource_mut_ref", resource_type: "MyResource", address: "0x1" }

//         // Debugging & Assertion Blocks
//         case "assert":
//           return { condition: "amount > 0", error_code: "1" }
//         case "log":
//           return { message: "Debug message" }

//         // Default fallback for any unrecognized block
//         default:
//           return {}
//       }
//   }


//   return (
//     <div className="h-full flex flex-col bg-gray-50">
//       {/* Canvas Header */}
//       <div className="p-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-semibold">Visual Block Editor</h3>
//             <p className="text-sm text-gray-600">
//               Drag, connect, and configure blocks to build your smart contract.
//             </p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <Badge variant="outline">{blocks.length} block{blocks.length !== 1 ? "s" : ""}</Badge>
//             <Badge variant="outline">{connections.length} connection{connections.length !== 1 ? "s" : ""}</Badge>
//             {isConnecting && <Badge variant="secondary" className="animate-pulse"><Link className="w-3 h-3 mr-1" />Connecting...</Badge>}
//             <Button variant="outline" size="sm" onClick={runBlocks} disabled={blocks.length === 0}><Play className="w-4 h-4 mr-2" />Run</Button>
//             <Button variant="default" size="sm" onClick={generateMoveCode}><Code className="w-4 h-4 mr-2" />Generate Code</Button>
//           </div>
//         </div>
//       </div>

//       {/* Canvas Area */}
//       <div
//         ref={canvasRef}
//         className={`flex-1 relative overflow-auto ${dragOver ? "bg-blue-50 border-2 border-dashed border-blue-400" : "bg-gray-100"}`}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onClick={() => setSelectedBlock(null)} // Click on canvas to deselect
//         style={{
//           backgroundImage: `radial-gradient(circle, #e0e0e0 1px, transparent 1px)`,
//           backgroundSize: "20px 20px",
//         }}
//       >
//         {blocks.length === 0 ? (
//           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//             <div className="text-center p-8 bg-white/50 rounded-lg shadow-sm">
//               <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-gray-400" /></div>
//               <h4 className="text-lg font-medium text-gray-700 mb-1">Start Building</h4>
//               <p className="text-gray-500 max-w-sm">Drag blocks from the toolbox on the left to start.</p>
//             </div>
//           </div>
//         ) : (
//           <div className="relative w-full h-full">
//             {/* Render connection lines */}
//             <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
//               <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" /></marker></defs>
//               {connections.map((connection, index) => {
//                 const fromBlock = blocks.find((b) => b.instanceId === connection.from)
//                 const toBlock = blocks.find((b) => b.instanceId === connection.to)
//                 if (!fromBlock || !toBlock) return null

//                 // Simple connection point calculation (center of right/left edge)
//                 const fromX = fromBlock.position.x + 200 // Assuming block width is 200
//                 const fromY = fromBlock.position.y + 45  // Approx vertical center
//                 const toX = toBlock.position.x
//                 const toY = toBlock.position.y + 45

//                 return (
//                     <line
//                       key={index}
//                       x1={fromX} y1={fromY}
//                       x2={toX} y2={toY}
//                       stroke="#6366f1" strokeWidth="2"
//                       markerEnd="url(#arrowhead)"
//                       className="cursor-pointer hover:stroke-red-500 transition-all"
//                       onClick={(e) => { e.stopPropagation(); removeConnection(index); }}
//                       style={{ pointerEvents: "stroke" }}
//                     />
//                 )
//               })}
//             </svg>

//             {/* Render blocks */}
//             {blocks.map((block) => {
//               const IconComponent = iconMap[block.id] || Code
//               const colorClass = colorMap[block.type] || "bg-gray-500 border-gray-300"
//               return (
//                 <div
//                   key={block.instanceId}
//                   className={`absolute select-none transition-shadow duration-200 ${selectedBlock === block.instanceId ? "ring-2 ring-offset-2 ring-blue-500 shadow-2xl" : "shadow-lg"}`}
//                   style={{ left: block.position.x, top: block.position.y, zIndex: selectedBlock === block.instanceId ? 10 : 2 }}
//                   onMouseDown={(e) => { e.stopPropagation(); handleBlockMouseDown(e, block.instanceId); }}
//                   onClick={(e) => { e.stopPropagation(); setSelectedBlock(block.instanceId); }}
//                 >
//                   <Card className={`border-2 ${colorClass.split(" ")[1]} w-[200px] bg-white`}>
//                     <CardContent className="p-0">
//                       <div className="flex items-center justify-between p-2 pb-1 drag-handle cursor-move border-b">
//                         <div className="flex items-center space-x-2">
//                           <div className={`w-6 h-6 ${colorClass.split(" ")[0]} rounded flex items-center justify-center`}><IconComponent className="w-3 h-3 text-white" /></div>
//                           <span className="text-sm font-medium">{block.name}</span>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); openEditDialog(block); }}><Settings className="w-3 h-3" /></Button>
//                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:bg-red-100" onClick={(e) => { e.stopPropagation(); removeBlock(block.instanceId); }}><Trash2 className="w-3 h-3" /></Button>
//                         </div>
//                       </div>

//                       <div className="p-2 text-xs text-gray-600 min-h-[3rem]">
//                         {Object.entries(block.parameters).slice(0, 2).map(([key, value]) => (
//                             <div key={key} className="truncate"><span className="font-semibold">{key}:</span> {value.toString() || "..."}</div>
//                         ))}
//                       </div>

//                       <div className="relative h-[25px]">
//                         {/* Input connection point */}
//                         <button
//                           className={`absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-colors z-10 ${isConnecting && connectionStart?.blockId !== block.instanceId ? 'bg-green-400 hover:bg-green-500' : 'bg-gray-400 hover:bg-gray-500'}`}
//                           onClick={(e) => { e.stopPropagation(); handleConnectionStart(block.instanceId); }}
//                           title="Connect to this block"
//                         />
//                         {/* Output connection point */}
//                         <button
//                           className={`absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-colors z-10 ${ isConnecting && connectionStart?.blockId === block.instanceId ? 'bg-blue-500 ring-2 ring-blue-300' : 'bg-gray-400 hover:bg-gray-500'}`}
//                           onClick={(e) => { e.stopPropagation(); handleConnectionStart(block.instanceId); }}
//                           title="Start connection from this block"
//                         />
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>

//       {/* Parameter Edit Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader><DialogTitle>Edit: {editingBlock?.name}</DialogTitle></DialogHeader>
//           <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
//             {editingBlock && renderParameterEditor(editingBlock)}
//           </div>
//           <div className="flex justify-end space-x-2 pt-4 border-t">
//             <Button variant="outline" onClick={closeEditDialog}>Cancel</Button>
//             <Button onClick={saveChanges}>Save Changes</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }
















// "use client"

// import type React from "react"
// import { useState, useEffect, useRef, useCallback } from "react"
// import { Card, CardContent } from "../components/ui/card"
// import { Button } from "../components/ui/button"
// import { Badge } from "../components/ui/badge"
// import { Input } from "../components/ui/input"
// import { Label } from "../components/ui/label"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
// import { Textarea } from "../components/ui/textarea"
// import {
//   Trash2,
//   Settings,
//   Plus,
//   Play,
//   Code,
//   Variable,
//   Calculator,
//   ArrowLeft,
//   GitBranch,
//   Database,
//   Activity as FunctionIcon,
//   Hash,
//   Bug,
//   FileText,
//   RotateCcw,
//   Link,
//   Download, // Import the Download icon
// } from "lucide-react"

// // --- CONSTANTS AND TYPE DEFINITIONS ---

// const iconMap: { [key: string]: React.ComponentType<any> } = {
//   module: Code,
//   struct: Database,
//   resource: Settings,
//   "public-function": FunctionIcon,
//   "entry-function": FunctionIcon,
//   "private-function": FunctionIcon,
//   "let-variable": Variable,
//   mapping: Hash,
//   constant: Variable,
//   "if-statement": GitBranch,
//   "if-else": GitBranch,
//   "while-loop": RotateCcw,
//   calculate: Calculator,
//   compare: Calculator,
//   assign: ArrowLeft,
//   transfer: ArrowLeft,
//   mint: Settings,
//   burn: Settings,
//   assert: Bug,
//   log: FileText,
//   "move-to": Database,
//   "move-from": Database,
//   "borrow-global": Database,
//   "borrow-global-mut": Database,
// }

// const colorMap: { [key: string]: string } = {
//   structure: "bg-blue-500 border-blue-300",
//   function: "bg-green-500 border-green-300",
//   variable: "bg-purple-500 border-purple-300",
//   logic: "bg-yellow-500 border-yellow-300",
//   operation: "bg-orange-500 border-orange-300",
//   blockchain: "bg-indigo-500 border-indigo-300",
//   debug: "bg-red-500 border-red-300",
// }

// interface Block {
//   id: string // Template ID, e.g., "public-function"
//   name: string // Display name, e.g., "Public Function"
//   type: string // Category, e.g., "function"
//   instanceId: string // Unique ID for this specific block instance
//   position: { x: number; y: number }
//   parameters: Record<string, string>
// }

// interface Connection {
//   from: string // instanceId of the source block
//   to: string // instanceId of the destination block
//   // Note: The original 'fromPort'/'toPort' were too simple.
//   // A proper implementation would have named ports (e.g., 'then', 'else' for an if-block).
//   // We will infer this logic in the code generator for now.
// }

// interface VisualCanvasProps {
//   blocks: Block[]
//   setBlocks: (blocks: Block[]) => void
//   connections: Connection[]
//   setConnections: (connections: Connection[]) => void
//   setGeneratedCode: (code: string) => void;
//   ProjectName: string; // Add ProjectName prop
// }

// export default function VisualCanvas({
//   blocks,
//   setBlocks,
//   connections,
//   setConnections,
//   setGeneratedCode,
//   ProjectName // Destructure ProjectName
// }: VisualCanvasProps) {
//   const [dragOver, setDragOver] = useState(false)
//   const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
//   const [isConnecting, setIsConnecting] = useState(false)
//   const [connectionStart, setConnectionStart] = useState<{ blockId: string } | null>(null)
//   const [editingBlock, setEditingBlock] = useState<Block | null>(null)
//   const [tempParameters, setTempParameters] = useState<Record<string, string>>({})
//   const [isDragging, setIsDragging] = useState(false)
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const canvasRef = useRef<HTMLDivElement>(null)

//   // --- DRAG AND DROP LOGIC ---

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault()
//     setDragOver(true)
//   }

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault()
//     setDragOver(false)
//   }

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     setDragOver(false)

//     try {
//       const blockData = JSON.parse(e.dataTransfer.getData("application/json"))
//       const rect = canvasRef.current?.getBoundingClientRect()

//       const newBlock: Block = {
//         ...blockData,
//         instanceId: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
//         position: {
//           x: rect ? e.clientX - rect.left - 100 : 100,
//           y: rect ? e.clientY - rect.top - 25 : 100,
//         },
//         parameters: getDefaultParameters(blockData.id),
//       }

//       setBlocks([...blocks, newBlock])
//     } catch (error) {
//       console.error("Error parsing dropped block:", error)
//     }
//   }

//   // --- BLOCK & CONNECTION MANIPULATION ---

//   const removeBlock = (instanceId: string) => {
//     setBlocks(blocks.filter((block) => block.instanceId !== instanceId))
//     // Also remove any connections associated with this block
//     setConnections(connections.filter((conn) => conn.from !== instanceId && conn.to !== instanceId))
//   }

//   const updateBlockParameters = (instanceId: string, parameters: Record<string, string>) => {
//     setBlocks(blocks.map((block) => (block.instanceId === instanceId ? { ...block, parameters } : block)))
//   }

//   const handleConnectionStart = (blockId: string) => {
//     if (isConnecting && connectionStart) {
//       // Complete connection
//       if (connectionStart.blockId !== blockId) {
//         // Prevent self-connections & duplicate connections
//         const connectionExists = connections.some(
//           (c) => c.from === connectionStart.blockId && c.to === blockId,
//         )
//         if (!connectionExists) {
//           const newConnection: Connection = {
//             from: connectionStart.blockId,
//             to: blockId,
//           }
//           setConnections([...connections, newConnection])
//         }
//       }
//       setIsConnecting(false)
//       setConnectionStart(null)
//     } else {
//       // Start connection
//       setIsConnecting(true)
//       setConnectionStart({ blockId })
//     }
//   }

//   const removeConnection = (index: number) => {
//     setConnections(connections.filter((_, i) => i !== index))
//   }

//   // --- BLOCK DRAGGING LOGIC ---

//   const handleBlockMouseDown = (e: React.MouseEvent, blockId: string) => {
//     // Only drag if the mousedown is on the card itself, not on buttons or connection points
//     if ((e.target as HTMLElement).closest(".drag-handle")) {
//       const block = blocks.find((b) => b.instanceId === blockId)
//       if (block) {
//         setIsDragging(true)
//         setSelectedBlock(blockId)
//         const rect = canvasRef.current?.getBoundingClientRect()
//         if (rect) {
//           setDragOffset({
//             x: e.clientX - rect.left - block.position.x,
//             y: e.clientY - rect.top - block.position.y,
//           })
//         }
//       }
//     }
//   }

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (isDragging && selectedBlock) {
//       const rect = canvasRef.current?.getBoundingClientRect()
//       if (rect) {
//         const newX = e.clientX - rect.left - dragOffset.x
//         const newY = e.clientY - rect.top - dragOffset.y

//         setBlocks(
//           blocks.map((block) =>
//             block.instanceId === selectedBlock
//               ? { ...block, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
//               : block,
//           ),
//         )
//       }
//     }
//   }

//   const handleMouseUp = () => {
//     setIsDragging(false)
//     // No need to deselect block on mouse up, keep it selected
//   }

//   // --- CODE GENERATION (CORRECTED IMPLEMENTATION) ---

//   const generateMoveCode = useCallback(() => {
//     if (blocks.length === 0) {
//       setGeneratedCode("// Drag blocks from the toolbox to start building your contract.")
//       return
//     }

//     const blocksMap = new Map(blocks.map((b) => [b.instanceId, b]))
//     const connectionsFromMap = new Map<string, string[]>()
//     const connectionsToMap = new Map<string, string[]>()

//     connections.forEach((conn) => {
//       if (!connectionsFromMap.has(conn.from)) connectionsFromMap.set(conn.from, [])
//       connectionsFromMap.get(conn.from)!.push(conn.to)

//       if (!connectionsToMap.has(conn.to)) connectionsToMap.set(conn.to, [])
//       connectionsToMap.get(conn.to)!.push(conn.from)
//     })

//     const generateCodeForBlock = (block: Block): string => {
//       const p = block.parameters
//       switch (block.id) {
//         case "let-variable":
//           return `let ${p.name || "my_var"}: ${p.type || "u64"} = ${p.value || "0"};`
//         case "assign":
//           return `${p.variable || "my_var"} = ${p.value || "10"};`
//         case "calculate":
//           return `// Calculate: ${p.left || "a"} ${p.operator || "+"} ${p.right || "b"}`
//         case "compare":
//           return `// Compare: ${p.left || "a"} ${p.operator || "=="} ${p.right || "b"}`
//         case "assert":
//           return `assert!(${p.condition || "true"}, ${p.error_code || "0"});`
//         case "log":
//           return `// Log: ${p.message || "Debug message"}`
//         case "transfer":
//           // Placeholder for actual transfer logic
//           return `// Placeholder: aptos_framework::coin::transfer(&${p.from || "signer"}, ${p.to || "recipient_addr"}, ${p.amount || "amount"});`
//         case "mint":
//           // Placeholder for actual mint logic
//           return `// Placeholder: ${p.token_module_addr}::${p.token_module_name}::mint(&${p.minter_signer || "signer"}, ${p.amount || "amount"}, ${p.recipient || "recipient_addr"});`
//         case "burn":
//           // Placeholder for actual burn logic
//           return `// Placeholder: ${p.token_module_addr}::${p.token_module_name}::burn(&${p.burner_signer || "signer"}, ${p.amount || "amount"});`

//         case "move-to": return `account::move_to<${p.resource_type || "MyResource"}>(&${p.signer || "account"}, ${p.resource_variable || "my_resource"});`
//         case "move-from": return `let ${p.assign_to || "resource_instance"} = account::move_from<${p.resource_type || "MyResource"}>(${p.address || "0x1"});`
//         case "borrow-global": return `let ${p.assign_to || "resource_ref"} = account::borrow_global<${p.resource_type || "MyResource"}>(${p.address || "0x1"});`
//         case "borrow-global-mut": return `let ${p.assign_to || "resource_mut_ref"} = account::borrow_global_mut<${p.resource_type || "MyResource"}>(${p.address || "0x1"});`
//         default:
//           return `// Unsupported block in this context: ${block.name}`
//       }
//     }

//     const generateCodeChain = (
//       startBlockId: string,
//       indent: string,
//       visited: Set<string>,
//     ): string => {
//       let code = ""
//       let currentId = startBlockId

//       while (currentId && !visited.has(currentId)) {
//         visited.add(currentId)
//         const block = blocksMap.get(currentId)
//         if (!block) break

//         const outgoingConnections = connectionsFromMap.get(currentId) || []

//         if (block.id === "if-else") {
//           code += `${indent}if (${block.parameters.condition || "true"}) {\n`
//           if (outgoingConnections[0]) {
//             code += generateCodeChain(outgoingConnections[0], indent + "    ", visited)
//           }
//           code += `${indent}} else {\n`
//           if (outgoingConnections[1]) {
//             code += generateCodeChain(outgoingConnections[1], indent + "    ", visited)
//           }
//           code += `${indent}}\n`
//           // After an if-else, the flow merges. This model doesn't support merge points,
//           // so we stop generating this chain here.
//           return code
//         } else if (block.id === "while-loop") {
//           code += `${indent}while (${block.parameters.condition || "true"}) {\n`
//           if (outgoingConnections[0]) {
//             code += generateCodeChain(outgoingConnections[0], indent + "    ", visited)
//           }
//           code += `${indent}}\n`
//           // The model doesn't support a separate "after loop" connection, so we stop the chain.
//           return code
//         } else {
//           code += `${indent}${generateCodeForBlock(block)}\n`
//           currentId = outgoingConnections[0] // Follow the first (and likely only) connection
//         }
//       }
//       return code
//     }


//     // Find the module block if present
//     const moduleBlock = blocks.find((b) => b.id === "module")
//     const moduleName = moduleBlock?.parameters.name?.trim() || "MyContract"
//     const moduleFile = moduleBlock?.parameters.module_name?.trim() || "SmartContract"

//     let code = `module ${moduleName}::${moduleFile} {\n`
//     code += `    use std::signer;\n\n`
//     code += `    use aptos_framework::account;\n\n` // Added for move/borrow functions
//     code += `    use aptos_framework::coin;\n\n`; // Added for coin operations if not already present

//     const processedBlockIds = new Set<string>()

//     // 1. Generate all top-level structures first
//     blocks.forEach((block) => {
//       if (block.type === "structure") {
//         switch (block.id) {
//           case "struct":
//             code += `    struct ${block.parameters.name || "MyStruct"} has key {\n`
//             code += `        ${(block.parameters.fields || "value: u64").replace(/\n/g, "\n        ")}\n`
//             code += `    }\n\n`
//             break
//           case "resource":
//             code += `    struct ${block.parameters.name || "MyResource"} has key, store {\n`
//             code += `        ${(block.parameters.fields || "data: vector<u8>").replace(/\n/g, "\n        ")}\n`
//             code += `    }\n\n`
//             break
//         }
//         processedBlockIds.add(block.instanceId)
//       }
//     })

//     // 2. Generate functions and their connected logic
//     const functionBlocks = blocks.filter((b) => b.type === "function")
//     functionBlocks.forEach((funcBlock) => {
//       const p = funcBlock.parameters
//       const params = funcBlock.id === "entry-function" ? `account: &signer${p.params ? `, ${p.params}` : ""}` : p.params || ""
//       const returnType = p.return_type ? ` -> ${p.return_type}` : ""
//       const visibility = funcBlock.id.includes("public") || funcBlock.id.includes("entry") ? "public " : ""
//       const entry = funcBlock.id.includes("entry") ? "entry " : ""
      
//       code += `    ${visibility}${entry}fun ${p.name || "my_function"}(${params})${returnType} {\n`
//       processedBlockIds.add(funcBlock.instanceId)
      
//       const visitedInFunc = new Set<string>([funcBlock.instanceId])
//       const startConnection = (connectionsFromMap.get(funcBlock.instanceId) || [])[0]
//       if (startConnection) {
//         code += generateCodeChain(startConnection, "        ", visitedInFunc)
//       }
      
//       // Mark all visited blocks as processed
//       visitedInFunc.forEach(id => processedBlockIds.add(id))
//       code += `    }\n\n`
//     })
    
//     // 3. Handle any orphaned logic blocks by putting them in a default init function
//     const orphanedBlocks = blocks.filter(b => !processedBlockIds.has(b.instanceId) && (b.type !== 'structure' && b.type !== 'function'))
//     if (orphanedBlocks.length > 0) {
//         code += `    public entry fun initialize(account: &signer) {\n`
//         const visitedOrphaned = new Set<string>();
//         orphanedBlocks.forEach(block => {
//             // Start a chain from any block that has no incoming execution connections
//             if(!connectionsToMap.has(block.instanceId)){
//                 code += generateCodeChain(block.instanceId, "        ", visitedOrphaned)
//             }
//         })
//         code += `    }\n\n`
//     }


//     code += `}`
//     setGeneratedCode(code)
//   }, [blocks, connections, setGeneratedCode])

//   useEffect(() => {
//     generateMoveCode()
//   }, [generateMoveCode])


//   // --- DIALOG & EDITOR LOGIC ---

//   const runBlocks = () => {
//     console.log("Simulating contract execution...")
//     console.log("This is where a VM or interpreter would run the generated code.")
//     console.log("Current State:", { blocks, connections })
//   }

//   const openEditDialog = (block: Block) => {
//     setEditingBlock(block)
//     setTempParameters({ ...block.parameters })
//     setIsDialogOpen(true)
//   }

//   const saveChanges = () => {
//     if (editingBlock) {
//       updateBlockParameters(editingBlock.instanceId, tempParameters)
//     }
//     closeEditDialog()
//   }

//   const closeEditDialog = () => {
//     setIsDialogOpen(false)
//     setEditingBlock(null)
//     setTempParameters({})
//   }

//   const handleTempParameterChange = (key: string, value: string) => {
//     setTempParameters((prev) => ({ ...prev, [key]: value }))
//   }

//   // --- DOWNLOAD PROJECT JSON LOGIC ---
//   const downloadProject = () => {
//     const projectData = {
//       ProjectName, // Include the ProjectName
//       blocks: blocks,
//       connections: connections,
//     };
//     const jsonString = JSON.stringify(projectData, null, 2);
//     const blob = new Blob([jsonString], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
    
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${ProjectName || 'aptos_project'}.json`; // Dynamic filename
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url); // Clean up the URL object
//   };


//   // --- RENDER LOGIC ---

//   const renderParameterEditor = (block: Block) => {
//     if (!block) return null
//     // This function is quite large and well-written in the original code.
//     // I'm including it here without significant changes as it was already correct.
//     const params = tempParameters;
//     switch (block.id) {
//         case "module":
//           return (
//             <div className="space-y-4">
//               <div><Label htmlFor="name">Module Name</Label><Input id="name" value={params.name || ""} onChange={e => handleTempParameterChange("name", e.target.value)} placeholder="MyContract" /></div>
//               <div><Label htmlFor="module_name">File Name</Label><Input id="module_name" value={params.module_name || ""} onChange={e => handleTempParameterChange("module_name", e.target.value)} placeholder="SmartContract" /></div>
//             </div>
//           )
//         case "public-function":
//         case "entry-function":
//         case "private-function":
//           return (
//             <div className="space-y-4">
//               <div><Label htmlFor="name">Function Name</Label><Input id="name" value={params.name || ""} onChange={(e) => handleTempParameterChange("name", e.target.value)} placeholder="my_function"/></div>
//               <div><Label htmlFor="params">Parameters</Label><Input id="params" value={params.params || ""} onChange={(e) => handleTempParameterChange("params", e.target.value)} placeholder="param1: u64, param2: address"/></div>
//               <div><Label htmlFor="return_type">Return Type</Label><Input id="return_type" value={params.return_type || ""} onChange={(e) => handleTempParameterChange("return_type", e.target.value)} placeholder="u64"/></div>
//             </div>
//           )
//         case "struct":
//         case "resource":
//           return (
//             <div className="space-y-4">
//               <div><Label htmlFor="name">Struct Name</Label><Input id="name" value={params.name || ""} onChange={(e) => handleTempParameterChange("name", e.target.value)} placeholder="MyStruct"/></div>
//               <div><Label htmlFor="fields">Fields (one per line)</Label><Textarea id="fields" value={params.fields || ""} onChange={(e) => handleTempParameterChange("fields", e.target.value)} placeholder="field1: u64,
// field2: address" rows={3}/></div>
//             </div>
//           )
//         case "let-variable":
//           return (
//             <div className="space-y-4">
//                 <div><Label htmlFor="name">Variable Name</Label><Input id="name" value={params.name || ""} onChange={e => handleTempParameterChange("name", e.target.value)} placeholder="my_var" /></div>
//                 <div>
//                     <Label htmlFor="type">Type</Label>
//                     <Select value={params.type || "u64"} onValueChange={value => handleTempParameterChange("type", value)}>
//                         <SelectTrigger><SelectValue /></SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="u64">u64</SelectItem>
//                           <SelectItem value="u128">u128</SelectItem>
//                           <SelectItem value="address">address</SelectItem>
//                           <SelectItem value="bool">bool</SelectItem>
//                           <SelectItem value="vector&lt;u8&gt;">vector&lt;u8&gt;</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>
//                 <div><Label htmlFor="value">Initial Value</Label><Input id="value" value={params.value || ""} onChange={e => handleTempParameterChange("value", e.target.value)} placeholder="0" /></div>
//             </div>
//           )
//         case "if-else":
//         case "while-loop":
//             return (
//                 <div className="space-y-4">
//                     <div><Label htmlFor="condition">Condition</Label><Input id="condition" value={params.condition || ""} onChange={(e) => handleTempParameterChange("condition", e.target.value)} placeholder={block.id === 'while-loop' ? "counter < 10" : "true"}/></div>
//                 </div>
//             )
//         // Add all other cases for completeness
//         case "assign":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="variable">Variable Name</Label><Input id="variable" value={params.variable || ""} onChange={e => handleTempParameterChange("variable", e.target.value)} placeholder="my_var" /></div>
//                   <div><Label htmlFor="value">New Value</Label><Input id="value" value={params.value || ""} onChange={e => handleTempParameterChange("value", e.target.value)} placeholder="10" /></div>
//               </div>
//           );
//         case "calculate":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="left">Left Operand</Label><Input id="left" value={params.left || ""} onChange={e => handleTempParameterChange("left", e.target.value)} placeholder="a" /></div>
//                   <div>
//                       <Label htmlFor="operator">Operator</Label>
//                       <Select value={params.operator || "+"} onValueChange={value => handleTempParameterChange("operator", value)}>
//                           <SelectTrigger><SelectValue /></SelectTrigger>
//                           <SelectContent>
//                               <SelectItem value="+">+</SelectItem>
//                               <SelectItem value="-">-</SelectItem>
//                               <SelectItem value="*">*</SelectItem>
//                               <SelectItem value="/">/</SelectItem>
//                               <SelectItem value="%">%</SelectItem>
//                           </SelectContent>
//                       </Select>
//                   </div>
//                   <div><Label htmlFor="right">Right Operand</Label><Input id="right" value={params.right || ""} onChange={e => handleTempParameterChange("right", e.target.value)} placeholder="b" /></div>
//               </div>
//           );
//         case "compare":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="left">Left Operand</Label><Input id="left" value={params.left || ""} onChange={e => handleTempParameterChange("left", e.target.value)} placeholder="a" /></div>
//                   <div>
//                       <Label htmlFor="operator">Operator</Label>
//                       <Select value={params.operator || "=="} onValueChange={value => handleTempParameterChange("operator", value)}>
//                           <SelectTrigger><SelectValue /></SelectTrigger>
//                           <SelectContent>
//                               <SelectItem value="==">{"=="}</SelectItem>
//                               <SelectItem value="!=">{"!="}</SelectItem>
//                               <SelectItem value="<">{"<"}</SelectItem>
//                               <SelectItem value=">">{" >"}</SelectItem>
//                               <SelectItem value="<=">{"<="}</SelectItem>
//                               <SelectItem value=">=">{">="}</SelectItem>
//                           </SelectContent>
//                       </Select>
//                   </div>
//                   <div><Label htmlFor="right">Right Operand</Label><Input id="right" value={params.right || ""} onChange={e => handleTempParameterChange("right", e.target.value)} placeholder="b" /></div>
//               </div>
//           );
//         case "assert":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="condition">Condition</Label><Input id="condition" value={params.condition || ""} onChange={e => handleTempParameterChange("condition", e.target.value)} placeholder="amount > 0" /></div>
//                   <div><Label htmlFor="error_code">Error Code (u64)</Label><Input id="error_code" value={params.error_code || ""} onChange={e => handleTempParameterChange("error_code", e.target.value)} placeholder="1" /></div>
//               </div>
//           );
//         case "log":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="message">Message (vector&lt;u8&gt;)</Label><Input id="message" value={params.message || ""} onChange={e => handleTempParameterChange("message", e.target.value)} placeholder='Debug message' /></div>
//               </div>
//           );
//         case "transfer":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="from">From Signer (e.g., &signer)</Label><Input id="from" value={params.from || ""} onChange={e => handleTempParameterChange("from", e.target.value)} placeholder="sender" /></div>
//                   <div><Label htmlFor="to">To Address</Label><Input id="to" value={params.to || ""} onChange={e => handleTempParameterChange("to", e.target.value)} placeholder="0x123..." /></div>
//                   <div><Label htmlFor="amount">Amount (u64)</Label><Input id="amount" value={params.amount || ""} onChange={e => handleTempParameterChange("amount", e.target.value)} placeholder="100" /></div>
//               </div>
//           );
//         case "mint":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="amount">Amount (u64)</Label><Input id="amount" value={params.amount || ""} onChange={e => handleTempParameterChange("amount", e.target.value)} placeholder="1000" /></div>
//                   <div><Label htmlFor="recipient">Recipient Address</Label><Input id="recipient" value={params.recipient || ""} onChange={e => handleTempParameterChange("recipient", e.target.value)} placeholder="0x123..." /></div>
//                   <div><Label htmlFor="token_module_addr">Token Module Address (e.g., 0x1::coin)</Label><Input id="token_module_addr" value={params.token_module_addr || ""} onChange={e => handleTempParameterChange("token_module_addr", e.target.value)} placeholder="0x1" /></div>
//                   <div><Label htmlFor="token_module_name">Token Module Name (e.g., Coin)</Label><Input id="token_module_name" value={params.token_module_name || ""} onChange={e => handleTempParameterChange("token_module_name", e.target.value)} placeholder="Coin" /></div>
//               </div>
//           );
//         case "burn":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="amount">Amount (u64)</Label><Input id="amount" value={params.amount || ""} onChange={e => handleTempParameterChange("amount", e.target.value)} placeholder="100" /></div>
//                   <div><Label htmlFor="burner_signer">Burner Signer (e.g., &signer)</Label><Input id="burner_signer" value={params.burner_signer || ""} onChange={e => handleTempParameterChange("burner_signer", e.target.value)} placeholder="signer" /></div>
//                   <div><Label htmlFor="token_module_addr">Token Module Address (e.g., 0x1::coin)</Label><Input id="token_module_addr" value={params.token_module_addr || ""} onChange={e => handleTempParameterChange("token_module_addr", e.target.value)} placeholder="0x1" /></div>
//                   <div><Label htmlFor="token_module_name">Token Module Name (e.g., Coin)</Label><Input id="token_module_name" value={params.token_module_name || ""} onChange={e => handleTempParameterChange("token_module_name", e.target.value)} placeholder="Coin" /></div>
//               </div>
//           );
//         case "move-to":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="signer">Signer (e.g., &signer)</Label><Input id="signer" value={params.signer || ""} onChange={e => handleTempParameterChange("signer", e.target.value)} placeholder="account" /></div>
//                   <div><Label htmlFor="resource_variable">Resource Variable (e.g., my_resource_instance)</Label><Input id="resource_variable" value={params.resource_variable || ""} onChange={e => handleTempParameterChange("resource_variable", e.target.value)} placeholder="my_resource" /></div>
//                   <div><Label htmlFor="resource_type">Resource Type (e.g., MyModule::MyResource)</Label><Input id="resource_type" value={params.resource_type || ""} onChange={e => handleTempParameterChange("resource_type", e.target.value)} placeholder="MyResource" /></div>
//               </div>
//           );
//         case "move-from":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="assign_to">Assign To Variable</Label><Input id="assign_to" value={params.assign_to || ""} onChange={e => handleTempParameterChange("assign_to", e.target.value)} placeholder="resource_instance" /></div>
//                   <div><Label htmlFor="resource_type">Resource Type (e.g., MyModule::MyResource)</Label><Input id="resource_type" value={params.resource_type || ""} onChange={e => handleTempParameterChange("resource_type", e.target.value)} placeholder="MyResource" /></div>
//                   <div><Label htmlFor="address">Account Address</Label><Input id="address" value={params.address || ""} onChange={e => handleTempParameterChange("address", e.target.value)} placeholder="0x1" /></div>
//               </div>
//           );
//         case "borrow-global":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="assign_to">Assign To Variable</Label><Input id="assign_to" value={params.assign_to || ""} onChange={e => handleTempParameterChange("assign_to", e.target.value)} placeholder="resource_ref" /></div>
//                   <div><Label htmlFor="resource_type">Resource Type (e.g., MyModule::MyResource)</Label><Input id="resource_type" value={params.resource_type || ""} onChange={e => handleTempParameterChange("resource_type", e.target.value)} placeholder="MyResource" /></div>
//                   <div><Label htmlFor="address">Account Address</Label><Input id="address" value={params.address || ""} onChange={e => handleTempParameterChange("address", e.target.value)} placeholder="0x1" /></div>
//               </div>
//           );
//         case "borrow-global-mut":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="assign_to">Assign To Variable</Label><Input id="assign_to" value={params.assign_to || ""} onChange={e => handleTempParameterChange("assign_to", e.target.value)} placeholder="resource_mut_ref" /></div>
//                   <div><Label htmlFor="resource_type">Resource Type (e.g., MyModule::MyResource)</Label><Input id="resource_type" value={params.resource_type || ""} onChange={e => handleTempParameterChange("resource_type", e.target.value)} placeholder="MyResource" /></div>
//                   <div><Label htmlFor="address">Account Address</Label><Input id="address" value={params.address || ""} onChange={e => handleTempParameterChange("address", e.target.value)} placeholder="0x1" /></div>
//               </div>
//           );
//         case "mapping":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="name">Mapping Name</Label><Input id="name" value={params.name || ""} onChange={e => handleTempParameterChange("name", e.target.value)} placeholder="my_mapping" /></div>
//                   <div>
//                       <Label htmlFor="key_type">Key Type</Label>
//                       <Select value={params.key_type || "address"} onValueChange={value => handleTempParameterChange("key_type", value)}>
//                           <SelectTrigger><SelectValue /></SelectTrigger>
//                           <SelectContent>
//                               <SelectItem value="address">address</SelectItem>
//                               <SelectItem value="u64">u64</SelectItem>
//                               <SelectItem value="vector&lt;u8&gt;">vector&lt;u8&gt;</SelectItem>
//                           </SelectContent>
//                       </Select>
//                   </div>
//                   <div>
//                       <Label htmlFor="value_type">Value Type</Label>
//                       <Select value={params.value_type || "u64"} onValueChange={value => handleTempParameterChange("value_type", value)}>
//                           <SelectTrigger><SelectValue /></SelectTrigger>
//                           <SelectContent>
//                               <SelectItem value="u64">u64</SelectItem>
//                               <SelectItem value="u128">u128</SelectItem>
//                               <SelectItem value="u256">u256</SelectItem>
//                               <SelectItem value="bool">bool</SelectItem>
//                               <SelectItem value="address">address</SelectItem>
//                               <SelectItem value="vector&lt;u8&gt;">vector&lt;u8&gt;</SelectItem>
//                               <SelectItem value="MyStruct">MyStruct</SelectItem> {/* Example custom type */}
//                               <SelectItem value="MyResource">MyResource</SelectItem> {/* Example custom type */}
//                           </SelectContent>
//                       </Select>
//                   </div>
//               </div>
//           );
//         case "constant":
//           return (
//               <div className="space-y-4">
//                   <div><Label htmlFor="name">Constant Name</Label><Input id="name" value={params.name || ""} onChange={e => handleTempParameterChange("name", e.target.value)} placeholder="MY_CONSTANT" /></div>
//                   <div>
//                       <Label htmlFor="type">Type</Label>
//                       <Select value={params.type || "u64"} onValueChange={value => handleTempParameterChange("type", value)}>
//                           <SelectTrigger><SelectValue /></SelectTrigger>
//                           <SelectContent>
//                               <SelectItem value="u64">u64</SelectItem>
//                               <SelectItem value="u128">u128</SelectItem>
//                               <SelectItem value="u256">u256</SelectItem>
//                               <SelectItem value="bool">bool</SelectItem>
//                               <SelectItem value="address">address</SelectItem>
//                               <SelectItem value="vector&lt;u8&gt;">vector&lt;u8&gt;</SelectItem>
//                           </SelectContent>
//                       </Select>
//                   </div>
//                   <div><Label htmlFor="value">Value</Label><Input id="value" value={params.value || ""} onChange={e => handleTempParameterChange("value", e.target.value)} placeholder="100" /></div>
//               </div>
//           );
//         default:
//           return (
//             <div>
//               {Object.entries(params).map(([key, value]) => (
//                 <div key={key} className="mb-4">
//                   <Label htmlFor={key} className="capitalize">{key.replace(/_/g, " ")}</Label>
//                   <Input id={key} value={value} onChange={e => handleTempParameterChange(key, e.target.value)} />
//                 </div>
//               ))}
//               {Object.keys(params).length === 0 && <p className="text-sm text-gray-500">No editable parameters for this block.</p>}
//             </div>
//           )
//     }
//   }
  
//   // Default parameters function (from original, mostly correct)
//   const getDefaultParameters = (blockId: string): Record<string, string> => {

    
//       switch (blockId) {
//         // Function Blocks

//         case "module":
//         return { name: "MyContract", module_name: "SmartContract" }

//         case "public-function":
//         case "entry-function":
//         case "private-function":
//           return { name: "my_function", params: "", return_type: "" }

//         // Structure Blocks
//         case "struct":
//           return { name: "MyStruct", fields: "value: u64" }
//         case "resource":
//           return { name: "MyResource", fields: "data: vector<u8>" }
        
//         // Variable & State Blocks
//         case "let-variable":
//           return { name: "my_var", type: "u64", value: "0" }
//         case "assign":
//           return { variable: "my_var", value: "10" }
//         case "mapping":
//           return { name: "my_mapping", key_type: "address", value_type: "u64" }
//         case "constant":
//           return { name: "MY_CONSTANT", type: "u64", value: "100" }

//         // Logic & Control Flow Blocks
//         case "if-statement":
//         case "if-else":
//           return { condition: "true" }
//         case "while-loop":
//           return { condition: "counter < 10" }

//         // Operation Blocks
//         case "calculate":
//           return { left: "a", operator: "+", right: "b" }
//         case "compare":
//           return { left: "a", operator: "==", right: "b" }

//         // Blockchain & Resource Management Blocks
//         case "transfer":
//           return { from: "sender", to: "recipient_addr", amount: "100" }
//         case "mint":
//           return { amount: "1000", recipient: "recipient_addr", token_module_addr: "0x1", token_module_name: "coin" }
//         case "burn":
//           return { amount: "100", burner_signer: "signer", token_module_addr: "0x1", token_module_name: "coin" }
//         case "move-to":
//           return { signer: "account", resource_variable: "my_resource", resource_type: "MyResource" }
//         case "move-from":
//           return { assign_to: "my_resource_instance", resource_type: "MyResource", address: "0x1" }
//         case "borrow-global":
//           return { assign_to: "resource_ref", resource_type: "MyResource", address: "0x1" }
//         case "borrow-global-mut":
//           return { assign_to: "resource_mut_ref", resource_type: "MyResource", address: "0x1" }

//         // Debugging & Assertion Blocks
//         case "assert":
//           return { condition: "amount > 0", error_code: "1" }
//         case "log":
//           return { message: "Debug message" }

//         // Default fallback for any unrecognized block
//         default:
//           return {}
//       }
//   }


//   return (
//     <div className="h-full flex flex-col bg-gray-50">
//       {/* Canvas Header */}
//       <div className="p-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-semibold">Visual Block Editor - {ProjectName}</h3>
//             <p className="text-sm text-gray-600">
//               Drag, connect, and configure blocks to build your smart contract.
//             </p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <Badge variant="outline">{blocks.length} block{blocks.length !== 1 ? "s" : ""}</Badge>
//             <Badge variant="outline">{connections.length} connection{connections.length !== 1 ? "s" : ""}</Badge>
//             {isConnecting && <Badge variant="secondary" className="animate-pulse"><Link className="w-3 h-3 mr-1" />Connecting...</Badge>}
//             <Button variant="outline" size="sm" onClick={runBlocks} disabled={blocks.length === 0}><Play className="w-4 h-4 mr-2" />Run</Button>
//             <Button variant="default" size="sm" onClick={generateMoveCode}><Code className="w-4 h-4 mr-2" />Generate Code</Button>
//             <Button variant="default" size="sm" onClick={downloadProject}><Download className="w-4 h-4 mr-2" />Download Project</Button> {/* New Button */}
//           </div>
//         </div>
//       </div>

//       {/* Canvas Area */}
//       <div
//         ref={canvasRef}
//         className={`flex-1 relative overflow-auto ${dragOver ? "bg-blue-50 border-2 border-dashed border-blue-400" : "bg-gray-100"}`}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onClick={() => setSelectedBlock(null)} // Click on canvas to deselect
//         style={{
//           backgroundImage: `radial-gradient(circle, #e0e0e0 1px, transparent 1px)`,
//           backgroundSize: "20px 20px",
//         }}
//       >
//         {blocks.length === 0 ? (
//           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//             <div className="text-center p-8 bg-white/50 rounded-lg shadow-sm">
//               <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-gray-400" /></div>
//               <h4 className="text-lg font-medium text-gray-700 mb-1">Start Building</h4>
//               <p className="text-gray-500 max-w-sm">Drag blocks from the toolbox on the left to start.</p>
//             </div>
//           </div>
//         ) : (
//           <div className="relative w-full h-full">
//             {/* Render connection lines */}
//             <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
//               <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" /></marker></defs>
//               {connections.map((connection, index) => {
//                 const fromBlock = blocks.find((b) => b.instanceId === connection.from)
//                 const toBlock = blocks.find((b) => b.instanceId === connection.to)
//                 if (!fromBlock || !toBlock) return null

//                 // Simple connection point calculation (center of right/left edge)
//                 const fromX = fromBlock.position.x + 200 // Assuming block width is 200
//                 const fromY = fromBlock.position.y + 45  // Approx vertical center
//                 const toX = toBlock.position.x
//                 const toY = toBlock.position.y + 45

//                 return (
//                     <line
//                       key={index}
//                       x1={fromX} y1={fromY}
//                       x2={toX} y2={toY}
//                       stroke="#6366f1" strokeWidth="2"
//                       markerEnd="url(#arrowhead)"
//                       className="cursor-pointer hover:stroke-red-500 transition-all"
//                       onClick={(e) => { e.stopPropagation(); removeConnection(index); }}
//                       style={{ pointerEvents: "stroke" }}
//                     />
//                 )
//               })}
//             </svg>

//             {/* Render blocks */}
//             {blocks.map((block) => {
//               const IconComponent = iconMap[block.id] || Code
//               const colorClass = colorMap[block.type] || "bg-gray-500 border-gray-300"
//               return (
//                 <div
//                   key={block.instanceId}
//                   className={`absolute select-none transition-shadow duration-200 ${selectedBlock === block.instanceId ? "ring-2 ring-offset-2 ring-blue-500 shadow-2xl" : "shadow-lg"}`}
//                   style={{ left: block.position.x, top: block.position.y, zIndex: selectedBlock === block.instanceId ? 10 : 2 }}
//                   onMouseDown={(e) => { e.stopPropagation(); handleBlockMouseDown(e, block.instanceId); }}
//                   onClick={(e) => { e.stopPropagation(); setSelectedBlock(block.instanceId); }}
//                 >
//                   <Card className={`border-2 ${colorClass.split(" ")[1]} w-[200px] bg-white`}>
//                     <CardContent className="p-0">
//                       <div className="flex items-center justify-between p-2 pb-1 drag-handle cursor-move border-b">
//                         <div className="flex items-center space-x-2">
//                           <div className={`w-6 h-6 ${colorClass.split(" ")[0]} rounded flex items-center justify-center`}><IconComponent className="w-3 h-3 text-white" /></div>
//                           <span className="text-sm font-medium">{block.name}</span>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); openEditDialog(block); }}><Settings className="w-3 h-3" /></Button>
//                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:bg-red-100" onClick={(e) => { e.stopPropagation(); removeBlock(block.instanceId); }}><Trash2 className="w-3 h-3" /></Button>
//                         </div>
//                       </div>

//                       <div className="p-2 text-xs text-gray-600 min-h-[3rem]">
//                         {Object.entries(block.parameters).slice(0, 2).map(([key, value]) => (
//                             <div key={key} className="truncate"><span className="font-semibold">{key}:</span> {value.toString() || "..."}</div>
//                         ))}
//                       </div>

//                       <div className="relative h-[25px]">
//                         {/* Input connection point */}
//                         <button
//                           className={`absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-colors z-10 ${isConnecting && connectionStart?.blockId !== block.instanceId ? 'bg-green-400 hover:bg-green-500' : 'bg-gray-400 hover:bg-gray-500'}`}
//                           onClick={(e) => { e.stopPropagation(); handleConnectionStart(block.instanceId); }}
//                           title="Connect to this block"
//                         />
//                         {/* Output connection point */}
//                         <button
//                           className={`absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-colors z-10 ${ isConnecting && connectionStart?.blockId === block.instanceId ? 'bg-blue-500 ring-2 ring-blue-300' : 'bg-gray-400 hover:bg-gray-500'}`}
//                           onClick={(e) => { e.stopPropagation(); handleConnectionStart(block.instanceId); }}
//                           title="Start connection from this block"
//                         />
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>

//       {/* Parameter Edit Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader><DialogTitle>Edit: {editingBlock?.name}</DialogTitle></DialogHeader>
//           <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
//             {editingBlock && renderParameterEditor(editingBlock)}
//           </div>
//           <div className="flex justify-end space-x-2 pt-4 border-t">
//             <Button variant="outline" onClick={closeEditDialog}>Cancel</Button>
//             <Button onClick={saveChanges}>Save Changes</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }
















import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import {
  Trash2,
  Settings,
  Plus,
  Play,
  Code,
  Variable,
  Calculator,
  ArrowLeft,
  GitBranch,
  Database,
  Activity as FunctionIcon,
  Hash,
  Bug,
  FileText,
  RotateCcw,
  Link,
  Download,
  Upload,
  Bot, // Import the Upload icon
} from "lucide-react"
import ChatbotGenerator from "./chatbot"; // Import the new generator component

// --- CONSTANTS AND TYPE DEFINITIONS ---

const iconMap: { [key: string]: React.ComponentType<any> } = {
  module: Code,
  struct: Database,
  resource: Settings,
  "public-function": FunctionIcon,
  "entry-function": FunctionIcon,
  "private-function": FunctionIcon,
  "let-variable": Variable,
  mapping: Hash,
  constant: Variable,
  "if-statement": GitBranch,
  "if-else": GitBranch,
  "while-loop": RotateCcw,
  calculate: Calculator,
  compare: Calculator,
  assign: ArrowLeft,
  transfer: ArrowLeft,
  mint: Settings,
  burn: Settings,
  assert: Bug,
  log: FileText,
  "move-to": Database,
  "move-from": Database,
  "borrow-global": Database,
  "borrow-global-mut": Database,
}

const colorMap: { [key: string]: string } = {
  structure: "bg-blue-500 border-blue-300",
  function: "bg-green-500 border-green-300",
  variable: "bg-purple-500 border-purple-300",
  logic: "bg-yellow-500 border-yellow-300",
  operation: "bg-orange-500 border-orange-300",
  blockchain: "bg-indigo-500 border-indigo-300",
  debug: "bg-red-500 border-red-300",
}

interface Block {
  id: string // Template ID, e.g., "public-function"
  name: string // Display name, e.g., "Public Function"
  type: string // Category, e.g., "function"
  instanceId: string // Unique ID for this specific block instance
  position: { x: number; y: number }
  parameters: Record<string, string>
}

interface Connection {
  from: string // instanceId of the source block
  to: string // instanceId of the destination block
}

interface VisualCanvasProps {
  blocks: Block[]
  setBlocks: (blocks: Block[]) => void
  connections: Connection[]
  setConnections: (connections: Connection[]) => void
  setGeneratedCode: (code: string) => void;
  ProjectName: string; 
  setProjectName: (name: string) => void; // Add setProjectName prop to update on load
}

export default function VisualCanvas({
  blocks,
  setBlocks,
  connections,
  setConnections,
  setGeneratedCode,
  ProjectName,
  setProjectName,
}: VisualCanvasProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{ blockId: string } | null>(null)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [tempParameters, setTempParameters] = useState<Record<string, string>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)


  // --- Chatbot visibility state ---
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);  


  // --- DRAG AND DROP LOGIC ---

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    try {
      const blockData = JSON.parse(e.dataTransfer.getData("application/json"))
      const rect = canvasRef.current?.getBoundingClientRect()

      const newBlock: Block = {
        ...blockData,
        instanceId: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        position: {
          x: rect ? e.clientX - rect.left - 100 : 100,
          y: rect ? e.clientY - rect.top - 25 : 100,
        },
        parameters: getDefaultParameters(blockData.id),
      }

      setBlocks([...blocks, newBlock])
    } catch (error) {
      console.error("Error parsing dropped block:", error)
    }
  }

  // --- NEW HANDLER FUNCTION TO RECEIVE DATA FROM THE CHATBOT ---
  const handleLoadProjectFromAI = (projectData: any) => {
    // Basic validation to ensure the data is in the expected format
    if (projectData && Array.isArray(projectData.blocks) && Array.isArray(projectData.connections)) {
      setProjectName(projectData.projectName || "AI Generated Project");
      setBlocks(projectData.blocks);
      setConnections(projectData.connections);
      alert("Project loaded successfully from AI!");
    } else {
      alert("AI generated invalid data. Please try refining your prompt.");
    }
  };

  // --- BLOCK & CONNECTION MANIPULATION ---

  const removeBlock = (instanceId: string) => {
    setBlocks(blocks.filter((block) => block.instanceId !== instanceId))
    setConnections(connections.filter((conn) => conn.from !== instanceId && conn.to !== instanceId))
  }

  const updateBlockParameters = (instanceId: string, parameters: Record<string, string>) => {
    setBlocks(blocks.map((block) => (block.instanceId === instanceId ? { ...block, parameters } : block)))
  }

  const handleConnectionStart = (blockId: string) => {
    if (isConnecting && connectionStart) {
      if (connectionStart.blockId !== blockId) {
        const connectionExists = connections.some(
          (c) => c.from === connectionStart.blockId && c.to === blockId,
        )
        if (!connectionExists) {
          const newConnection: Connection = {
            from: connectionStart.blockId,
            to: blockId,
          }
          setConnections([...connections, newConnection])
        }
      }
      setIsConnecting(false)
      setConnectionStart(null)
    } else {
      setIsConnecting(true)
      setConnectionStart({ blockId })
    }
  }

  const removeConnection = (index: number) => {
    setConnections(connections.filter((_, i) => i !== index))
  }

  // --- BLOCK DRAGGING LOGIC ---

  const handleBlockMouseDown = (e: React.MouseEvent, blockId: string) => {
    if ((e.target as HTMLElement).closest(".drag-handle")) {
      const block = blocks.find((b) => b.instanceId === blockId)
      if (block) {
        setIsDragging(true)
        setSelectedBlock(blockId)
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          setDragOffset({
            x: e.clientX - rect.left - block.position.x,
            y: e.clientY - rect.top - block.position.y,
          })
        }
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedBlock) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const newX = e.clientX - rect.left - dragOffset.x
        const newY = e.clientY - rect.top - dragOffset.y

        setBlocks(
          blocks.map((block) =>
            block.instanceId === selectedBlock
              ? { ...block, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
              : block,
          ),
        )
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // --- CODE GENERATION ---

  const generateMoveCode = useCallback(() => {
    if (blocks.length === 0) {
      setGeneratedCode("// Drag blocks from the toolbox to start building your contract.")
      return
    }

    const blocksMap = new Map(blocks.map((b) => [b.instanceId, b]))
    const connectionsFromMap = new Map<string, string[]>()
    const connectionsToMap = new Map<string, string[]>()

    connections.forEach((conn) => {
      if (!connectionsFromMap.has(conn.from)) connectionsFromMap.set(conn.from, [])
      connectionsFromMap.get(conn.from)!.push(conn.to)

      if (!connectionsToMap.has(conn.to)) connectionsToMap.set(conn.to, [])
      connectionsToMap.get(conn.to)!.push(conn.from)
    })

    const generateCodeForBlock = (block: Block): string => {
      const p = block.parameters
      switch (block.id) {
        case "let-variable":
          return `let ${p.name || "my_var"}: ${p.type || "u64"} = ${p.value || "0"};`
        case "assign":
          return `${p.variable || "my_var"} = ${p.value || "10"};`
        case "calculate":
          return `// Calculate: ${p.left || "a"} ${p.operator || "+"} ${p.right || "b"}`
        case "compare":
          return `// Compare: ${p.left || "a"} ${p.operator || "=="} ${p.right || "b"}`
        case "assert":
          return `assert!(${p.condition || "true"}, ${p.error_code || "0"});`
        case "log":
          return `// Log: ${p.message || "Debug message"}`
        case "transfer":
          return `// Placeholder: aptos_framework::coin::transfer(&${p.from || "signer"}, ${p.to || "recipient_addr"}, ${p.amount || "amount"});`
        case "mint":
          return `// Placeholder: ${p.token_module_addr}::${p.token_module_name}::mint(&${p.minter_signer || "signer"}, ${p.amount || "amount"}, ${p.recipient || "recipient_addr"});`
        case "burn":
          return `// Placeholder: ${p.token_module_addr}::${p.token_module_name}::burn(&${p.burner_signer || "signer"}, ${p.amount || "amount"});`
        case "move-to": return `account::move_to<${p.resource_type || "MyResource"}>(&${p.signer || "account"}, ${p.resource_variable || "my_resource"});`
        case "move-from": return `let ${p.assign_to || "resource_instance"} = account::move_from<${p.resource_type || "MyResource"}>(${p.address || "0x1"});`
        case "borrow-global": return `let ${p.assign_to || "resource_ref"} = account::borrow_global<${p.resource_type || "MyResource"}>(${p.address || "0x1"});`
        case "borrow-global-mut": return `let ${p.assign_to || "resource_mut_ref"} = account::borrow_global_mut<${p.resource_type || "MyResource"}>(${p.address || "0x1"});`
        default:
          return `// Unsupported block in this context: ${block.name}`
      }
    }

    const generateCodeChain = (
      startBlockId: string,
      indent: string,
      visited: Set<string>,
    ): string => {
      let code = ""
      let currentId = startBlockId

      while (currentId && !visited.has(currentId)) {
        visited.add(currentId)
        const block = blocksMap.get(currentId)
        if (!block) break

        const outgoingConnections = connectionsFromMap.get(currentId) || []

        if (block.id === "if-else") {
          code += `${indent}if (${block.parameters.condition || "true"}) {\n`
          if (outgoingConnections[0]) {
            code += generateCodeChain(outgoingConnections[0], indent + "    ", visited)
          }
          code += `${indent}} else {\n`
          if (outgoingConnections[1]) {
            code += generateCodeChain(outgoingConnections[1], indent + "    ", visited)
          }
          code += `${indent}}\n`
          return code
        } else if (block.id === "while-loop") {
          code += `${indent}while (${block.parameters.condition || "true"}) {\n`
          if (outgoingConnections[0]) {
            code += generateCodeChain(outgoingConnections[0], indent + "    ", visited)
          }
          code += `${indent}}\n`
          return code
        } else {
          code += `${indent}${generateCodeForBlock(block)}\n`
          currentId = outgoingConnections[0]
        }
      }
      return code
    }

    const moduleBlock = blocks.find((b) => b.id === "module")
    const moduleName = moduleBlock?.parameters.name?.trim() || "MyContract"
    const moduleFile = moduleBlock?.parameters.module_name?.trim() || "SmartContract"

    let code = `module ${moduleName}::${moduleFile} {\n`
    code += `    use std::signer;\n\n`
    code += `    use aptos_framework::account;\n\n`
    code += `    use aptos_framework::coin;\n\n`;

    const processedBlockIds = new Set<string>()

    blocks.forEach((block) => {
      if (block.type === "structure") {
        switch (block.id) {
          case "struct":
            code += `    struct ${block.parameters.name || "MyStruct"} has key {\n`
            code += `        ${(block.parameters.fields || "value: u64").replace(/\n/g, "\n        ")}\n`
            code += `    }\n\n`
            break
          case "resource":
            code += `    struct ${block.parameters.name || "MyResource"} has key, store {\n`
            code += `        ${(block.parameters.fields || "data: vector<u8>").replace(/\n/g, "\n        ")}\n`
            code += `    }\n\n`
            break
        }
        processedBlockIds.add(block.instanceId)
      }
    })

    const functionBlocks = blocks.filter((b) => b.type === "function")
    functionBlocks.forEach((funcBlock) => {
      const p = funcBlock.parameters
      const params = funcBlock.id === "entry-function" ? `account: &signer${p.params ? `, ${p.params}` : ""}` : p.params || ""
      const returnType = p.return_type ? ` -> ${p.return_type}` : ""
      const visibility = funcBlock.id.includes("public") || funcBlock.id.includes("entry") ? "public " : ""
      const entry = funcBlock.id.includes("entry") ? "entry " : ""
      
      code += `    ${visibility}${entry}fun ${p.name || "my_function"}(${params})${returnType} {\n`
      processedBlockIds.add(funcBlock.instanceId)
      
      const visitedInFunc = new Set<string>([funcBlock.instanceId])
      const startConnection = (connectionsFromMap.get(funcBlock.instanceId) || [])[0]
      if (startConnection) {
        code += generateCodeChain(startConnection, "        ", visitedInFunc)
      }
      
      visitedInFunc.forEach(id => processedBlockIds.add(id))
      code += `    }\n\n`
    })
    
    const orphanedBlocks = blocks.filter(b => !processedBlockIds.has(b.instanceId) && (b.type !== 'structure' && b.type !== 'function'))
    if (orphanedBlocks.length > 0) {
        code += `    public entry fun initialize(account: &signer) {\n`
        const visitedOrphaned = new Set<string>();
        orphanedBlocks.forEach(block => {
            if(!connectionsToMap.has(block.instanceId)){
                code += generateCodeChain(block.instanceId, "        ", visitedOrphaned)
            }
        })
        code += `    }\n\n`
    }

    code += `}`
    setGeneratedCode(code)
  }, [blocks, connections, setGeneratedCode])

  useEffect(() => {
    generateMoveCode()
  }, [generateMoveCode])


  // --- DIALOG & EDITOR LOGIC ---

  const runBlocks = () => {
    console.log("Simulating contract execution...")
    console.log("Current State:", { blocks, connections })
  }

  const openEditDialog = (block: Block) => {
    setEditingBlock(block)
    setTempParameters({ ...block.parameters })
    setIsDialogOpen(true)
  }

  const saveChanges = () => {
    if (editingBlock) {
      updateBlockParameters(editingBlock.instanceId, tempParameters)
    }
    closeEditDialog()
  }

  const closeEditDialog = () => {
    setIsDialogOpen(false)
    setEditingBlock(null)
    setTempParameters({})
  }

  const handleTempParameterChange = (key: string, value: string) => {
    setTempParameters((prev) => ({ ...prev, [key]: value }))
  }

  // --- DOWNLOAD PROJECT JSON LOGIC ---
  const downloadProject = () => {
    const projectData = {
      ProjectName,
      blocks: blocks,
      connections: connections,
    };
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ProjectName.toLowerCase() || 'aptos_project'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- UPLOAD PROJECT JSON LOGIC ---
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Failed to read file content.");
        }
        
        const data = JSON.parse(text);

        // CORRECTED VALIDATION LOGIC:
        // 1. Check for the essential arrays 'blocks' and 'connections'.
        if (Array.isArray(data.blocks) && Array.isArray(data.connections)) {
          
          // 2. Load the essential data.
          setBlocks(data.blocks);
          setConnections(data.connections);
          
          // 3. Conditionally load ProjectName. If it doesn't exist, provide a fallback.
          if (typeof data.ProjectName === 'string') {
            setProjectName(data.ProjectName);
          } else {
            // Fallback for older project files that don't have a ProjectName key.
            // We'll use the filename as the project name.
            const fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.') || 'Loaded Project';
            setProjectName(fileNameWithoutExtension);
          }
          
          alert("Project loaded successfully!");

        } else {
          // The error is now more specific to the required data.
          throw new Error("Invalid project file format. The file must contain 'blocks' and 'connections' arrays.");
        }
      } catch (error) {
        console.error("Error loading project file:", error);
        // alert(`Failed to load project file. Please ensure it is a valid JSON file. Error: ${(error as Error).message}`);
      } finally {
        // Reset the file input value to allow uploading the same file again
        if (event.target) {
          event.target.value = '';
        }
      }
    };

    reader.onerror = () => {
      console.error("Error reading file");
      alert("An error occurred while reading the file.");
    };

    reader.readAsText(file);
  };

  // --- RENDER LOGIC ---

  const renderParameterEditor = (block: Block) => {
    if (!block) return null
    const params = tempParameters;
    switch (block.id) {
        case "module":
          return (
            <div className="space-y-4">
              <div><Label htmlFor="name">Module Name</Label><Input id="name" value={params.name || ""} onChange={e => handleTempParameterChange("name", e.target.value)} placeholder="MyContract" /></div>
              <div><Label htmlFor="module_name">File Name</Label><Input id="module_name" value={params.module_name || ""} onChange={e => handleTempParameterChange("module_name", e.target.value)} placeholder="SmartContract" /></div>
            </div>
          )
        case "public-function":
        case "entry-function":
        case "private-function":
          return (
            <div className="space-y-4">
              <div><Label htmlFor="name">Function Name</Label><Input id="name" value={params.name || ""} onChange={(e) => handleTempParameterChange("name", e.target.value)} placeholder="my_function"/></div>
              <div><Label htmlFor="params">Parameters</Label><Input id="params" value={params.params || ""} onChange={(e) => handleTempParameterChange("params", e.target.value)} placeholder="param1: u64, param2: address"/></div>
              <div><Label htmlFor="return_type">Return Type</Label><Input id="return_type" value={params.return_type || ""} onChange={(e) => handleTempParameterChange("return_type", e.target.value)} placeholder="u64"/></div>
            </div>
          )
        case "struct":
        case "resource":
          return (
            <div className="space-y-4">
              <div><Label htmlFor="name">Struct Name</Label><Input id="name" value={params.name || ""} onChange={(e) => handleTempParameterChange("name", e.target.value)} placeholder="MyStruct"/></div>
              <div><Label htmlFor="fields">Fields (one per line)</Label><Textarea id="fields" value={params.fields || ""} onChange={(e) => handleTempParameterChange("fields", e.target.value)} placeholder="field1: u64,
field2: address" rows={3}/></div>
            </div>
          )
        case "let-variable":
          return (
            <div className="space-y-4">
                <div><Label htmlFor="name">Variable Name</Label><Input id="name" value={params.name || ""} onChange={e => handleTempParameterChange("name", e.target.value)} placeholder="my_var" /></div>
                <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={params.type || "u64"} onValueChange={value => handleTempParameterChange("type", value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="u64">u64</SelectItem>
                          <SelectItem value="u128">u128</SelectItem>
                          <SelectItem value="address">address</SelectItem>
                          <SelectItem value="bool">bool</SelectItem>
                          <SelectItem value="vector&lt;u8&gt;">vector&lt;u8&gt;</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="value">Initial Value</Label><Input id="value" value={params.value || ""} onChange={e => handleTempParameterChange("value", e.target.value)} placeholder="0" /></div>
            </div>
          )
        case "if-else":
        case "while-loop":
            return (
                <div className="space-y-4">
                    <div><Label htmlFor="condition">Condition</Label><Input id="condition" value={params.condition || ""} onChange={(e) => handleTempParameterChange("condition", e.target.value)} placeholder={block.id === 'while-loop' ? "counter < 10" : "true"}/></div>
                </div>
            )
        case "assign":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="variable">Variable Name</Label><Input id="variable" value={params.variable || ""} onChange={e => handleTempParameterChange("variable", e.target.value)} placeholder="my_var" /></div>
                  <div><Label htmlFor="value">New Value</Label><Input id="value" value={params.value || ""} onChange={e => handleTempParameterChange("value", e.target.value)} placeholder="10" /></div>
              </div>
          );
        case "calculate":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="left">Left Operand</Label><Input id="left" value={params.left || ""} onChange={e => handleTempParameterChange("left", e.target.value)} placeholder="a" /></div>
                  <div>
                      <Label htmlFor="operator">Operator</Label>
                      <Select value={params.operator || "+"} onValueChange={value => handleTempParameterChange("operator", value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="+">+</SelectItem>
                              <SelectItem value="-">-</SelectItem>
                              <SelectItem value="*">*</SelectItem>
                              <SelectItem value="/">/</SelectItem>
                              <SelectItem value="%">%</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div><Label htmlFor="right">Right Operand</Label><Input id="right" value={params.right || ""} onChange={e => handleTempParameterChange("right", e.target.value)} placeholder="b" /></div>
              </div>
          );
        case "compare":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="left">Left Operand</Label><Input id="left" value={params.left || ""} onChange={e => handleTempParameterChange("left", e.target.value)} placeholder="a" /></div>
                  <div>
                      <Label htmlFor="operator">Operator</Label>
                      <Select value={params.operator || "=="} onValueChange={value => handleTempParameterChange("operator", value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="==">{"=="}</SelectItem>
                              <SelectItem value="!=">{"!="}</SelectItem>
                              <SelectItem value="<">{"<"}</SelectItem>
                              <SelectItem value=">">{" >"}</SelectItem>
                              <SelectItem value="<=">{"<="}</SelectItem>
                              <SelectItem value=">=">{">="}</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div><Label htmlFor="right">Right Operand</Label><Input id="right" value={params.right || ""} onChange={e => handleTempParameterChange("right", e.target.value)} placeholder="b" /></div>
              </div>
          );
        case "assert":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="condition">Condition</Label><Input id="condition" value={params.condition || ""} onChange={e => handleTempParameterChange("condition", e.target.value)} placeholder="amount > 0" /></div>
                  <div><Label htmlFor="error_code">Error Code (u64)</Label><Input id="error_code" value={params.error_code || ""} onChange={e => handleTempParameterChange("error_code", e.target.value)} placeholder="1" /></div>
              </div>
          );
        case "log":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="message">Message (vector&lt;u8&gt;)</Label><Input id="message" value={params.message || ""} onChange={e => handleTempParameterChange("message", e.target.value)} placeholder='Debug message' /></div>
              </div>
          );
        case "transfer":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="from">From Signer (e.g., &signer)</Label><Input id="from" value={params.from || ""} onChange={e => handleTempParameterChange("from", e.target.value)} placeholder="sender" /></div>
                  <div><Label htmlFor="to">To Address</Label><Input id="to" value={params.to || ""} onChange={e => handleTempParameterChange("to", e.target.value)} placeholder="0x123..." /></div>
                  <div><Label htmlFor="amount">Amount (u64)</Label><Input id="amount" value={params.amount || ""} onChange={e => handleTempParameterChange("amount", e.target.value)} placeholder="100" /></div>
              </div>
          );
        case "mint":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="amount">Amount (u64)</Label><Input id="amount" value={params.amount || ""} onChange={e => handleTempParameterChange("amount", e.target.value)} placeholder="1000" /></div>
                  <div><Label htmlFor="recipient">Recipient Address</Label><Input id="recipient" value={params.recipient || ""} onChange={e => handleTempParameterChange("recipient", e.target.value)} placeholder="0x123..." /></div>
                  <div><Label htmlFor="token_module_addr">Token Module Address (e.g., 0x1::coin)</Label><Input id="token_module_addr" value={params.token_module_addr || ""} onChange={e => handleTempParameterChange("token_module_addr", e.target.value)} placeholder="0x1" /></div>
                  <div><Label htmlFor="token_module_name">Token Module Name (e.g., Coin)</Label><Input id="token_module_name" value={params.token_module_name || ""} onChange={e => handleTempParameterChange("token_module_name", e.target.value)} placeholder="Coin" /></div>
              </div>
          );
        case "burn":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="amount">Amount (u64)</Label><Input id="amount" value={params.amount || ""} onChange={e => handleTempParameterChange("amount", e.target.value)} placeholder="100" /></div>
                  <div><Label htmlFor="burner_signer">Burner Signer (e.g., &signer)</Label><Input id="burner_signer" value={params.burner_signer || ""} onChange={e => handleTempParameterChange("burner_signer", e.target.value)} placeholder="signer" /></div>
                  <div><Label htmlFor="token_module_addr">Token Module Address (e.g., 0x1::coin)</Label><Input id="token_module_addr" value={params.token_module_addr || ""} onChange={e => handleTempParameterChange("token_module_addr", e.target.value)} placeholder="0x1" /></div>
                  <div><Label htmlFor="token_module_name">Token Module Name (e.g., Coin)</Label><Input id="token_module_name" value={params.token_module_name || ""} onChange={e => handleTempParameterChange("token_module_name", e.target.value)} placeholder="Coin" /></div>
              </div>
          );
        case "move-to":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="signer">Signer (e.g., &signer)</Label><Input id="signer" value={params.signer || ""} onChange={e => handleTempParameterChange("signer", e.target.value)} placeholder="account" /></div>
                  <div><Label htmlFor="resource_variable">Resource Variable (e.g., my_resource_instance)</Label><Input id="resource_variable" value={params.resource_variable || ""} onChange={e => handleTempParameterChange("resource_variable", e.target.value)} placeholder="my_resource" /></div>
                  <div><Label htmlFor="resource_type">Resource Type (e.g., MyModule::MyResource)</Label><Input id="resource_type" value={params.resource_type || ""} onChange={e => handleTempParameterChange("resource_type", e.target.value)} placeholder="MyResource" /></div>
              </div>
          );
        case "move-from":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="assign_to">Assign To Variable</Label><Input id="assign_to" value={params.assign_to || ""} onChange={e => handleTempParameterChange("assign_to", e.target.value)} placeholder="resource_instance" /></div>
                  <div><Label htmlFor="resource_type">Resource Type (e.g., MyModule::MyResource)</Label><Input id="resource_type" value={params.resource_type || ""} onChange={e => handleTempParameterChange("resource_type", e.target.value)} placeholder="MyResource" /></div>
                  <div><Label htmlFor="address">Account Address</Label><Input id="address" value={params.address || ""} onChange={e => handleTempParameterChange("address", e.target.value)} placeholder="0x1" /></div>
              </div>
          );
        case "borrow-global":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="assign_to">Assign To Variable</Label><Input id="assign_to" value={params.assign_to || ""} onChange={e => handleTempParameterChange("assign_to", e.target.value)} placeholder="resource_ref" /></div>
                  <div><Label htmlFor="resource_type">Resource Type (e.g., MyModule::MyResource)</Label><Input id="resource_type" value={params.resource_type || ""} onChange={e => handleTempParameterChange("resource_type", e.target.value)} placeholder="MyResource" /></div>
                  <div><Label htmlFor="address">Account Address</Label><Input id="address" value={params.address || ""} onChange={e => handleTempParameterChange("address", e.target.value)} placeholder="0x1" /></div>
              </div>
          );
        case "borrow-global-mut":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="assign_to">Assign To Variable</Label><Input id="assign_to" value={params.assign_to || ""} onChange={e => handleTempParameterChange("assign_to", e.target.value)} placeholder="resource_mut_ref" /></div>
                  <div><Label htmlFor="resource_type">Resource Type (e.g., MyModule::MyResource)</Label><Input id="resource_type" value={params.resource_type || ""} onChange={e => handleTempParameterChange("resource_type", e.target.value)} placeholder="MyResource" /></div>
                  <div><Label htmlFor="address">Account Address</Label><Input id="address" value={params.address || ""} onChange={e => handleTempParameterChange("address", e.target.value)} placeholder="0x1" /></div>
              </div>
          );
        case "mapping":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="name">Mapping Name</Label><Input id="name" value={params.name || ""} onChange={e => handleTempParameterChange("name", e.target.value)} placeholder="my_mapping" /></div>
                  <div>
                      <Label htmlFor="key_type">Key Type</Label>
                      <Select value={params.key_type || "address"} onValueChange={value => handleTempParameterChange("key_type", value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="address">address</SelectItem>
                              <SelectItem value="u64">u64</SelectItem>
                              <SelectItem value="vector<u8>">vector&lt;u8&gt;</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div>
                      <Label htmlFor="value_type">Value Type</Label>
                      <Select value={params.value_type || "u64"} onValueChange={value => handleTempParameterChange("value_type", value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="u64">u64</SelectItem>
                              <SelectItem value="u128">u128</SelectItem>
                              <SelectItem value="u256">u256</SelectItem>
                              <SelectItem value="bool">bool</SelectItem>
                              <SelectItem value="address">address</SelectItem>
                              <SelectItem value="vector&lt;u8&gt;">vector&lt;u8&gt;</SelectItem>
                              <SelectItem value="MyStruct">MyStruct</SelectItem> {/* Example custom type */}
                              <SelectItem value="MyResource">MyResource</SelectItem> {/* Example custom type */}
                          </SelectContent>
                      </Select>
                  </div>
              </div>
          );
        case "constant":
          return (
              <div className="space-y-4">
                  <div><Label htmlFor="name">Constant Name</Label><Input id="name" value={params.name || ""} onChange={e => handleTempParameterChange("name", e.target.value)} placeholder="MY_CONSTANT" /></div>
                  <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={params.type || "u64"} onValueChange={value => handleTempParameterChange("type", value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="u64">u64</SelectItem>
                              <SelectItem value="u128">u128</SelectItem>
                              <SelectItem value="u256">u256</SelectItem>
                              <SelectItem value="bool">bool</SelectItem>
                              <SelectItem value="address">address</SelectItem>
                              <SelectItem value="vector&lt;u8&gt;">vector&lt;u8&gt;</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div><Label htmlFor="value">Value</Label><Input id="value" value={params.value || ""} onChange={e => handleTempParameterChange("value", e.target.value)} placeholder="100" /></div>
              </div>
          );
        default:
          return (
            <div>
              {Object.entries(params).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <Label htmlFor={key} className="capitalize">{key.replace(/_/g, " ")}</Label>
                  <Input id={key} value={value} onChange={e => handleTempParameterChange(key, e.target.value)} />
                </div>
              ))}
              {Object.keys(params).length === 0 && <p className="text-sm text-gray-500">No editable parameters for this block.</p>}
            </div>
          )
    }
  }
  
  const getDefaultParameters = (blockId: string): Record<string, string> => {
      switch (blockId) {
        case "module":
        return { name: "MyContract", module_name: "SmartContract" }
        case "public-function":
        case "entry-function":
        case "private-function":
          return { name: "my_function", params: "", return_type: "" }
        case "struct":
          return { name: "MyStruct", fields: "value: u64" }
        case "resource":
          return { name: "MyResource", fields: "data: vector<u8>" }
        case "let-variable":
          return { name: "my_var", type: "u64", value: "0" }
        case "assign":
          return { variable: "my_var", value: "10" }
        case "mapping":
          return { name: "my_mapping", key_type: "address", value_type: "u64" }
        case "constant":
          return { name: "MY_CONSTANT", type: "u64", value: "100" }
        case "if-statement":
        case "if-else":
          return { condition: "true" }
        case "while-loop":
          return { condition: "counter < 10" }
        case "calculate":
          return { left: "a", operator: "+", right: "b" }
        case "compare":
          return { left: "a", operator: "==", right: "b" }
        case "transfer":
          return { from: "sender", to: "recipient_addr", amount: "100" }
        case "mint":
          return { amount: "1000", recipient: "recipient_addr", token_module_addr: "0x1", token_module_name: "coin" }
        case "burn":
          return { amount: "100", burner_signer: "signer", token_module_addr: "0x1", token_module_name: "coin" }
        case "move-to":
          return { signer: "account", resource_variable: "my_resource", resource_type: "MyResource" }
        case "move-from":
          return { assign_to: "my_resource_instance", resource_type: "MyResource", address: "0x1" }
        case "borrow-global":
          return { assign_to: "resource_ref", resource_type: "MyResource", address: "0x1" }
        case "borrow-global-mut":
          return { assign_to: "resource_mut_ref", resource_type: "MyResource", address: "0x1" }
        case "assert":
          return { condition: "amount > 0", error_code: "1" }
        case "log":
          return { message: "Debug message" }
        default:
          return {}
      }
  }


  return (
    <div className="h-full flex flex-col bg-gray-50">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="application/json"
        className="hidden"
      />
      <div className="p-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Visual Block Editor - {ProjectName}</h3>
            <p className="text-sm text-gray-600">
              Drag, connect, and configure blocks to build your smart contract.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{blocks.length} block{blocks.length !== 1 ? "s" : ""}</Badge>
            <Badge variant="outline">{connections.length} connection{connections.length !== 1 ? "s" : ""}</Badge>
            {isConnecting && <Badge variant="secondary" className="animate-pulse"><Link className="w-3 h-3 mr-1" />Connecting...</Badge>}
            <Button variant="outline" size="sm" onClick={runBlocks} disabled={blocks.length === 0}><Play className="w-4 h-4 mr-2" />Run</Button>
            <Button variant="default" size="sm" onClick={generateMoveCode}><Code className="w-4 h-4 mr-2" />Generate Code</Button>
            <Button variant="outline" size="sm" onClick={triggerFileUpload}><Upload className="w-4 h-4 mr-2" />Upload</Button>
            <Button variant="default" size="sm" onClick={downloadProject}><Download className="w-4 h-4 mr-2" />Download</Button>
          </div>
        </div>
      </div>
      <div
        ref={canvasRef}
        className={`flex-1 relative overflow-auto ${dragOver ? "bg-blue-50 border-2 border-dashed border-blue-400" : "bg-gray-100"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => setSelectedBlock(null)}
        style={{
          backgroundImage: `radial-gradient(circle, #e0e0e0 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      >
        {blocks.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 bg-white/50 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-gray-400" /></div>
              <h4 className="text-lg font-medium text-gray-700 mb-1">Start Building</h4>
              <p className="text-gray-500 max-w-sm">Drag blocks from the toolbox on the left or upload a project file.</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" /></marker></defs>
              {connections.map((connection, index) => {
                const fromBlock = blocks.find((b) => b.instanceId === connection.from)
                const toBlock = blocks.find((b) => b.instanceId === connection.to)
                if (!fromBlock || !toBlock) return null

                const fromX = fromBlock.position.x + 200
                const fromY = fromBlock.position.y + 45
                const toX = toBlock.position.x
                const toY = toBlock.position.y + 45

                return (
                    <line
                      key={index}
                      x1={fromX} y1={fromY}
                      x2={toX} y2={toY}
                      stroke="#6366f1" strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      className="cursor-pointer hover:stroke-red-500 transition-all"
                      onClick={(e) => { e.stopPropagation(); removeConnection(index); }}
                      style={{ pointerEvents: "stroke" }}
                    />
                )
              })}
            </svg>

            {blocks.map((block) => {
              const IconComponent = iconMap[block.id] || Code
              const colorClass = colorMap[block.type] || "bg-gray-500 border-gray-300"
              return (
                <div
                  key={block.instanceId}
                  className={`absolute select-none transition-shadow duration-200 ${selectedBlock === block.instanceId ? "ring-2 ring-offset-2 ring-blue-500 shadow-2xl" : "shadow-lg"}`}
                  style={{ left: block.position.x, top: block.position.y, zIndex: selectedBlock === block.instanceId ? 10 : 2 }}
                  onMouseDown={(e) => { e.stopPropagation(); handleBlockMouseDown(e, block.instanceId); }}
                  onClick={(e) => { e.stopPropagation(); setSelectedBlock(block.instanceId); }}
                >
                  <Card className={`border-2 ${colorClass.split(" ")[1]} w-[200px] bg-white`}>
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-2 pb-1 drag-handle cursor-move border-b">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 ${colorClass.split(" ")[0]} rounded flex items-center justify-center`}><IconComponent className="w-3 h-3 text-white" /></div>
                          <span className="text-sm font-medium">{block.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); openEditDialog(block); }}><Settings className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:bg-red-100" onClick={(e) => { e.stopPropagation(); removeBlock(block.instanceId); }}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>

                      <div className="p-2 text-xs text-gray-600 min-h-[3rem]">
                        {Object.entries(block.parameters).slice(0, 2).map(([key, value]) => (
                            <div key={key} className="truncate"><span className="font-semibold">{key}:</span> {value.toString() || "..."}</div>
                        ))}
                      </div>

                      <div className="relative h-[25px]">
                        <button
                          className={`absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-colors z-10 ${isConnecting && connectionStart?.blockId !== block.instanceId ? 'bg-green-400 hover:bg-green-500' : 'bg-gray-400 hover:bg-gray-500'}`}
                          onClick={(e) => { e.stopPropagation(); handleConnectionStart(block.instanceId); }}
                          title="Connect to this block"
                        />
                        <button
                          className={`absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-colors z-10 ${ isConnecting && connectionStart?.blockId === block.instanceId ? 'bg-blue-500 ring-2 ring-blue-300' : 'bg-gray-400 hover:bg-gray-500'}`}
                          onClick={(e) => { e.stopPropagation(); handleConnectionStart(block.instanceId); }}
                          title="Start connection from this block"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit: {editingBlock?.name}</DialogTitle></DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
            {editingBlock && renderParameterEditor(editingBlock)}
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={closeEditDialog}>Cancel</Button>
            <Button onClick={saveChanges}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* --- RENDER THE CHATBOT GENERATOR --- */}
      <div className="absolute bottom-5 right-5 z-20">
        <Button onClick={() => setIsGeneratorOpen(true)} className="rounded-full w-16 h-16 shadow-lg">
          <Bot className="w-8 h-8" />
          <span className="sr-only">Open AI Contract Generator</span>
        </Button>
      </div>
      
      <ChatbotGenerator
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onLoadProject={handleLoadProjectFromAI}
      />
    </div>
  )
}