"use client"

import type React from "react"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import {
  Code,
  Variable,
  Calculator,
  ArrowLeft,
  GitBranch,
  Database,
  Settings,
  Bug,
  FileText,
  Search,
  Activity as FunctionIcon,
  Hash,
  RotateCcw,
} from "lucide-react"
import { useState } from "react"

const blockCategories = [
  {
    name: "Structure",
    color: "bg-blue-500",
    blocks: [
      {
        id: "module",
        name: "Module",
        description: "Define a Move module",
        icon: Code,
        type: "structure",
        template: "module {{name}}::{{module_name}} { ... }",
      },
      {
        id: "struct",
        name: "Struct",
        description: "Define a data structure",
        icon: Database,
        type: "structure",
        template: "struct {{name}} has key { ... }",
      },
      {
        id: "resource",
        name: "Resource",
        description: "Define a resource type",
        icon: Settings,
        type: "structure",
        template: "struct {{name}} has key, store { ... }",
      },
    ],
  },
  {
    name: "Functions",
    color: "bg-green-500",
    blocks: [
      {
        id: "public-function",
        name: "Public Function",
        description: "Create a public function",
        icon: FunctionIcon,
        type: "function",
        template: "public fun {{name}}({{params}}) { ... }",
      },
      {
        id: "entry-function",
        name: "Entry Function",
        description: "Create an entry function",
        icon: FunctionIcon,
        type: "function",
        template: "public entry fun {{name}}({{params}}) { ... }",
      },
      {
        id: "private-function",
        name: "Private Function",
        description: "Create a private function",
        icon: FunctionIcon,
        type: "function",
        template: "fun {{name}}({{params}}) { ... }",
      },
    ],
  },
  {
    name: "Variables",
    color: "bg-purple-500",
    blocks: [
      {
        id: "let-variable",
        name: "Let Variable",
        description: "Declare a variable",
        icon: Variable,
        type: "variable",
        template: "let {{name}} = {{value}};",
      },
      {
        id: "assign",
        name: "Assign",
        description: "Variable assignment",
        icon: ArrowLeft,
        type: "operation",
        template: "{{variable}} = {{value}};",
      },
      {
        id: "constant",
        name: "Constant",
        description: "Define a constant",
        icon: Variable,
        type: "variable",
        template: "const {{name}}: {{type}} = {{value}};",
      },
    ],
  },
  {
    name: "Logic",
    color: "bg-yellow-500",
    blocks: [
      {
        id: "if-else",
        name: "If-Else",
        description: "Conditional with alternative",
        icon: GitBranch,
        type: "logic",
        template: "if ({{condition}}) { ... } else { ... }",
      },
      {
        id: "while-loop",
        name: "While Loop",
        description: "Loop with condition",
        icon: RotateCcw,
        type: "logic",
        template: "while ({{condition}}) { ... }",
      },
    ],
  },
  {
    name: "Operations",
    color: "bg-orange-500",
    blocks: [
      {
        id: "calculate",
        name: "Calculate",
        description: "Mathematical operation",
        icon: Calculator,
        type: "operation",
        template: "{{left}} {{operator}} {{right}}",
      },
      {
        id: "compare",
        name: "Compare",
        description: "Comparison operation",
        icon: Calculator,
        type: "operation",
        template: "{{left}} {{operator}} {{right}}",
      },
    ],
  },
  {
    name: "Blockchain",
    color: "bg-indigo-500",
    blocks: [
      {
        id: "transfer",
        name: "Transfer",
        description: "Transfer tokens",
        icon: ArrowLeft,
        type: "blockchain",
        template: "coin::transfer<T>(from, to, amount)",
      },
      {
        id: "mint",
        name: "Mint",
        description: "Mint new tokens",
        icon: Settings,
        type: "blockchain",
        template: "coin::mint<T>(amount)",
      },
      {
        id: "burn",
        name: "Burn",
        description: "Burn tokens",
        icon: Settings,
        type: "blockchain",
        template: "coin::burn<T>(amount)",
      },
      // --- NEWLY IMPLEMENTED BLOCKS ---
      {
        id: "move-to",
        name: "Move To",
        description: "Store a resource under an account",
        icon: Database,
        type: "blockchain",
        template: "account::move_to<T>(&signer, resource)",
      },
      {
        id: "move-from",
        name: "Move From",
        description: "Retrieve a resource from an account",
        icon: Database,
        type: "blockchain",
        template: "account::move_from<T>(address)",
      },
      {
        id: "borrow-global",
        name: "Borrow Global",
        description: "Get a read-only reference to a resource",
        icon: Database,
        type: "blockchain",
        template: "account::borrow_global<T>(address)",
      },
      {
        id: "borrow-global-mut",
        name: "Borrow Global (Mutable)",
        description: "Get a mutable reference to a resource",
        icon: Database,
        type: "blockchain",
        template: "account::borrow_global_mut<T>(address)",
      },
    ],
  },
  {
    name: "Debugging",
    color: "bg-red-500",
    blocks: [
      {
        id: "assert",
        name: "Assert",
        description: "Assert a condition is true",
        icon: Bug,
        type: "debug",
        template: "assert!({{condition}}, {{error_code}});",
      },
      {
        id: "log",
        name: "Log",
        description: "Print a value for debugging",
        icon: FileText,
        type: "debug",
        template: "debug::print(&{{value}});",
      },
    ],
  },
]

export default function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCategories = blockCategories
    .map((category) => ({
      ...category,
      blocks: category.blocks.filter(
        (block) =>
          block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.blocks.length > 0)

  const handleDragStart = (e: React.DragEvent, block: any) => {
    // Pass the full block definition, including its type
    e.dataTransfer.setData("application/json", JSON.stringify(block))
  }

  return (
    <div className="p-4 h-full flex flex-col bg-gray-50 border-r">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <Code className="w-5 h-5 mr-2" />
          Toolbox
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 -mr-4 pr-4">
        <div className="space-y-4">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category.name}>
                <div className={`text-xs font-semibold text-white px-2 py-1 rounded-t-md ${category.color} sticky top-0 z-10`}>
                  {category.name}
                </div>
                <div className="space-y-1 pt-2">
                  {category.blocks.map((block) => {
                    const IconComponent = block.icon
                    return (
                      <div
                        key={block.id}
                        className="cursor-grab hover:shadow-md hover:bg-gray-100 active:cursor-grabbing transition-all bg-white border rounded p-2 flex items-center space-x-3"
                        draggable
                        onDragStart={(e) => handleDragStart(e, block)}
                      >
                        <div className={`w-7 h-7 ${category.color} rounded-md flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{block.name}</div>
                          <div className="text-xs text-gray-500 truncate">{block.description}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
                <p>No blocks found.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Drag blocks to the canvas and connect them to build your smart contract logic.
        </p>
      </div>
    </div>
  )
}