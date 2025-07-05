// import React, { useState, useRef } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { Button } from "./ui/button";
// import { Textarea } from "./ui/textarea"; // Using Textarea for multi-line prompts
// import { Bot, Send, Loader2, X, Copy, UploadCloud } from "lucide-react";

// // --- API CONFIGURATION ---
// const GROQ_API_KEY = "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"; // Make sure this is set in your .env file
// const GROQ_MODEL = 'deepseek-r1-distill-llama-70b';
// const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// // --- TYPE DEFINITIONS ---
// interface ProjectData {
//     projectName: string;
//     blocks: any[]; // Using 'any' as we don't need to validate a structure we are generating
//     connections: any[];
// }

// interface ChatbotProps {
//     isOpen: boolean;
//     onClose: () => void;
//     // New prop to send the generated JSON back to the parent
//     onLoadProject: (projectData: ProjectData) => void;
// }

// export default function ChatbotGenerator({ isOpen, onClose, onLoadProject }: ChatbotProps) {
//     const [promptInput, setPromptInput] = useState("");
//     const [generatedJson, setGeneratedJson] = useState<ProjectData | null>(null);
//     const [isAiThinking, setIsAiThinking] = useState(false);
//     const [copySuccess, setCopySuccess] = useState('');

//     const systemPrompt = `You are an AI assistant that generates a complete JSON configuration for a visual smart contract builder for the Aptos blockchain based on a user's description.

// Your task is to generate a single, complete JSON object that represents the entire move smart contract. The JSON object MUST adhere to the following structure:
// {
//   "projectName": "string",
//   "blocks": "Array of block objects",
//   "connections": "Array of connection objects"
// }

// It is a move code smart contract for NFT marketplace:

// Move code for an NFT marketplace smart contract on the Aptos blockchain. The contract should allow users to create, transfer, list, and buy NFTs. It should also handle events for NFT creation, transfer, listing, and sale.

// module NFTMarketplace::nft_marketplace {
//     use std::signer;
//     use std::error;
//     use std::string::String;
//     use aptos_framework::account;
//     use aptos_framework::coin;
//     use aptos_framework::aptos_coin::AptosCoin;
//     use aptos_framework::timestamp;
//     use aptos_std::table::{Self, Table};
//     use aptos_std::event;

//     // Error codes
//     const ENFT_NOT_FOUND: u64 = 1;
//     const ENOT_OWNER: u64 = 2;
//     const ENFT_NOT_FOR_SALE: u64 = 3;
//     const EINSUFFICIENT_FUNDS: u64 = 4;
//     const EMARKETPLACE_NOT_INITIALIZED: u64 = 5;

//     // NFT structure
//     struct NFT has key, store {
//         id: u64,
//         owner: address,
//         metadata: String,
//         for_sale: bool,
//         price: u64,
//         created_at: u64,
//     }

//     // Global marketplace storage
//     struct Marketplace has key {
//         nfts: Table<u64, NFT>,
//         next_nft_id: u64,
//         total_nfts: u64,
//     }

//     // Events
//     struct NFTCreatedEvent has drop, store {
//         nft_id: u64,
//         owner: address,
//         metadata: String,
//         timestamp: u64,
//     }

//     struct NFTTransferredEvent has drop, store {
//         nft_id: u64,
//         from: address,
//         to: address,
//         timestamp: u64,
//     }

//     struct NFTListedEvent has drop, store {
//         nft_id: u64,
//         owner: address,
//         price: u64,
//         timestamp: u64,
//     }

//     struct NFTSoldEvent has drop, store {
//         nft_id: u64,
//         seller: address,
//         buyer: address,
//         price: u64,
//         timestamp: u64,
//     }

//     // Event handles
//     struct MarketplaceEvents has key {
//         nft_created_events: event::EventHandle<NFTCreatedEvent>,
//         nft_transferred_events: event::EventHandle<NFTTransferredEvent>,
//         nft_listed_events: event::EventHandle<NFTListedEvent>,
//         nft_sold_events: event::EventHandle<NFTSoldEvent>,
//     }

//     // Initialize the marketplace (should be called once by the module publisher)
//     public entry fun initialize_marketplace(account: &signer) {
//         let marketplace = Marketplace {
//             nfts: table::new(),
//             next_nft_id: 1,
//             total_nfts: 0,
//         };
        
//         let events = MarketplaceEvents {
//             nft_created_events: account::new_event_handle<NFTCreatedEvent>(account),
//             nft_transferred_events: account::new_event_handle<NFTTransferredEvent>(account),
//             nft_listed_events: account::new_event_handle<NFTListedEvent>(account),
//             nft_sold_events: account::new_event_handle<NFTSoldEvent>(account),
//         };
        
//         move_to(account, marketplace);
//         move_to(account, events);
//     }

//     // Create a new NFT
//     public entry fun create_nft(account: &signer, metadata: String) acquires Marketplace, MarketplaceEvents {
//         let owner = signer::address_of(account);
//         let marketplace = borrow_global_mut<Marketplace>(@NFTMarketplace);
//         let events = borrow_global_mut<MarketplaceEvents>(@NFTMarketplace);
        
//         let nft_id = marketplace.next_nft_id;
//         let nft = NFT {
//             id: nft_id,
//             owner,
//             metadata,
//             for_sale: false,
//             price: 0,
//             created_at: timestamp::now_seconds(),
//         };
        
//         table::add(&mut marketplace.nfts, nft_id, nft);
//         marketplace.next_nft_id = marketplace.next_nft_id + 1;
//         marketplace.total_nfts = marketplace.total_nfts + 1;
        
//         // Emit event
//         event::emit_event(&mut events.nft_created_events, NFTCreatedEvent {
//             nft_id,
//             owner,
//             metadata,
//             timestamp: timestamp::now_seconds(),
//         });
//     }

//     // Transfer NFT ownership
//     public entry fun transfer_nft(account: &signer, nft_id: u64, to: address) acquires Marketplace, MarketplaceEvents {
//         let from = signer::address_of(account);
//         let marketplace = borrow_global_mut<Marketplace>(@NFTMarketplace);
//         let events = borrow_global_mut<MarketplaceEvents>(@NFTMarketplace);
        
//         assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
//         let nft = table::borrow_mut(&mut marketplace.nfts, nft_id);
//         assert!(nft.owner == from, error::permission_denied(ENOT_OWNER));
        
//         nft.owner = to;
//         nft.for_sale = false;
//         nft.price = 0;
        
//         // Emit event
//         event::emit_event(&mut events.nft_transferred_events, NFTTransferredEvent {
//             nft_id,
//             from,
//             to,
//             timestamp: timestamp::now_seconds(),
//         });
//     }

//     // List NFT for sale
//     public entry fun list_nft_for_sale(account: &signer, nft_id: u64, price: u64) acquires Marketplace, MarketplaceEvents {
//         let owner = signer::address_of(account);
//         let marketplace = borrow_global_mut<Marketplace>(@NFTMarketplace);
//         let events = borrow_global_mut<MarketplaceEvents>(@NFTMarketplace);
        
//         assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
//         let nft = table::borrow_mut(&mut marketplace.nfts, nft_id);
//         assert!(nft.owner == owner, error::permission_denied(ENOT_OWNER));
        
//         nft.for_sale = true;
//         nft.price = price;
        
//         // Emit event
//         event::emit_event(&mut events.nft_listed_events, NFTListedEvent {
//             nft_id,
//             owner,
//             price,
//             timestamp: timestamp::now_seconds(),
//         });
//     }

//     // Buy NFT
//     public entry fun buy_nft(account: &signer, nft_id: u64) acquires Marketplace, MarketplaceEvents {
//         let buyer = signer::address_of(account);
//         let marketplace = borrow_global_mut<Marketplace>(@NFTMarketplace);
//         let events = borrow_global_mut<MarketplaceEvents>(@NFTMarketplace);
        
//         assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
//         let nft = table::borrow_mut(&mut marketplace.nfts, nft_id);
//         assert!(nft.for_sale, error::invalid_state(ENFT_NOT_FOR_SALE));
        
//         let seller = nft.owner;
//         let price = nft.price;
        
//         // Transfer payment from buyer to seller
//         coin::transfer<AptosCoin>(account, seller, price);
        
//         // Transfer NFT ownership
//         nft.owner = buyer;
//         nft.for_sale = false;
//         nft.price = 0;
        
//         // Emit event
//         event::emit_event(&mut events.nft_sold_events, NFTSoldEvent {
//             nft_id,
//             seller,
//             buyer,
//             price,
//             timestamp: timestamp::now_seconds(),
//         });
//     }

//     // Remove NFT from sale
//     public entry fun remove_from_sale(account: &signer, nft_id: u64) acquires Marketplace {
//         let owner = signer::address_of(account);
//         let marketplace = borrow_global_mut<Marketplace>(@NFTMarketplace);
        
//         assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
//         let nft = table::borrow_mut(&mut marketplace.nfts, nft_id);
//         assert!(nft.owner == owner, error::permission_denied(ENOT_OWNER));
        
//         nft.for_sale = false;
//         nft.price = 0;
//     }

//     // View functions
//     #[view]
//     public fun get_nft_owner(nft_id: u64): address acquires Marketplace {
//         let marketplace = borrow_global<Marketplace>(@NFTMarketplace);
//         assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
//         let nft = table::borrow(&marketplace.nfts, nft_id);
//         nft.owner
//     }

//     #[view]
//     public fun get_nft_details(nft_id: u64): (u64, address, String, bool, u64, u64) acquires Marketplace {
//         let marketplace = borrow_global<Marketplace>(@NFTMarketplace);
//         assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
//         let nft = table::borrow(&marketplace.nfts, nft_id);
//         (nft.id, nft.owner, nft.metadata, nft.for_sale, nft.price, nft.created_at)
//     }

//     #[view]
//     public fun get_marketplace_stats(): (u64, u64) acquires Marketplace {
//         let marketplace = borrow_global<Marketplace>(@NFTMarketplace);
//         (marketplace.total_nfts, marketplace.next_nft_id - 1)
//     }

//     #[view]
//     public fun is_nft_for_sale(nft_id: u64): bool acquires Marketplace {
//         let marketplace = borrow_global<Marketplace>(@NFTMarketplace);
//         if (!table::contains(&marketplace.nfts, nft_id)) {
//             return false
//         };
        
//         let nft = table::borrow(&marketplace.nfts, nft_id);
//         nft.for_sale
//     }
// }

// A 'block' object must have these keys:
// - id: string (The block's template ID from the list below)
// - name: string (A human-readable name, e.g., "Module", "Public Function")
// - type: string (The block's category from the list below)
// - instanceId: string (A unique ID for this block, e.g., "block_17517...")
// - position: { x: number, y: number } (Infer a reasonable layout, like a flowchart)
// - parameters: object (Specifics for the block, see examples in the list below)

// A 'connection' object must have:
// - from: string (The instanceId of the source block)
// - to: string (The instanceId of the destination block)

// --- AVAILABLE BLOCKS ---

// **Structure Blocks (type: "structure")**
// - **id: "module"**: The root container for the contract.
//   - parameters: { "name": "MyContract", "module_name": "my_contract_file" }
// - **id: "struct"**: A custom data structure.
//   - parameters: { "name": "MyStruct", "fields": "field1: u64,\\nfield2: address" }
// - **id: "resource"**: A struct that can be stored in an account.
//   - parameters: { "name": "MyResource", "fields": "data: vector<u8>" }

// **Function Blocks (type: "function")**
// - **id: "public-function"**: A function callable within the module.
//   - parameters: { "name": "my_public_func", "params": "p1: u64", "return_type": "bool" }
// - **id: "entry-function"**: A function callable as a transaction.
//   - parameters: { "name": "my_entry_func", "params": "amount: u64" }
// - **id: "private-function"**: A function only callable inside the current module.
//   - parameters: { "name": "_my_private_helper", "params": "value: u64" }

// **Variable & State Blocks (type: "variable")**
// - **id: "let-variable"**: Declare a local variable.
//   - parameters: { "name": "my_var", "type": "u64", "value": "0" }
// - **id: "assign"**: Assign a new value to a variable.
//   - parameters: { "variable": "my_var", "value": "100" }
// - **id: "constant"**: A module-level constant.
//   - parameters: { "name": "ADMIN_ADDRESS", "type": "address", "value": "@0x123" }

// **Logic Blocks (type: "logic")**
// - **id: "if-else"**: A conditional branch. Requires two outgoing connections.
//   - parameters: { "condition": "x > 10" }
// - **id: "while-loop"**: A loop that repeats while a condition is true.
//   - parameters: { "condition": "i < 10" }

// **Operation Blocks (type: "operation")**
// - **id: "calculate"**: Perform a mathematical calculation.
//   - parameters: { "left": "a", "operator": "+", "right": "b" }
// - **id: "compare"**: Perform a comparison.
//   - parameters: { "left": "balance", "operator": ">=", "right": "amount" }

// **Blockchain & Resource Management Blocks (type: "blockchain")**
// - **id: "transfer"**: Transfer Aptos Coin.
//   - parameters: { "from": "&signer", "to": "recipient_addr", "amount": "amount" }
// - **id: "mint"**: Create new tokens (conceptual).
//   - parameters: { "recipient": "addr", "amount": "1000" }
// - **id: "burn"**: Destroy tokens (conceptual).
//   - parameters: { "from": "&signer", "amount": "100" }
// - **id: "move-to"**: Store a resource under an account.
//   - parameters: { "signer": "account", "resource_variable": "my_resource_instance" }
// - **id: "move-from"**: Take a resource from an account.
//   - parameters: { "assign_to": "retrieved_resource", "address": "source_addr" }
// - **id: "borrow-global"**: Get a read-only reference to a resource.
//   - parameters: { "assign_to": "resource_ref", "address": "owner_addr" }
// - **id: "borrow-global-mut"**: Get a mutable reference to a resource.
//   - parameters: { "assign_to": "resource_mut_ref", "address": "owner_addr" }

// **Debug Blocks (type: "debug")**
// - **id: "assert"**: Abort the transaction if a condition is false.
//   - parameters: { "condition": "user_is_admin", "error_code": "101" }
// - **id: "log"**: Log a debug message (conceptual).
//   - parameters: { "message": "'Executing transfer...'" }

// --- RULES ---
// 1. Always generate unique 'instanceId's using a 'block_...' prefix.
// 2. Infer a logical 'projectName' from the user's prompt.
// 3. Make sure all logical parts of the contract are connected. Functions and structs must be connected FROM their parent module. Logic inside a function must be connected FROM the function block.
// 4. Your entire response must be ONLY the JSON object, nothing else.

// --- EXAMPLE ---
// User prompt: "Create a simple coin contract. It should have a module called 'MyCoin'. Inside, create a resource struct called 'Coin' with a 'value' of type u64. Also, add an entry function called 'mint' that takes a 'recipient' address and an 'amount' of u64."

// Your generated JSON should look like this:
// {
//   "projectName": "MyCoinContract",
//   "blocks": [
//     {
//       "id": "module",
//       "name": "Module",
//       "type": "structure",
//       "instanceId": "block_1720000000001",
//       "position": { "x": 50, "y": 50 },
//       "parameters": { "name": "MyCoin", "module_name": "my_coin" }
//     },
//     {
//       "id": "resource",
//       "name": "Resource",
//       "type": "structure",
//       "instanceId": "block_1720000000002",
//       "position": { "x": 50, "y": 200 },
//       "parameters": { "name": "Coin", "fields": "value: u64" }
//     },
//     {
//       "id": "entry-function",
//       "name": "Entry Function",
//       "type": "function",
//       "instanceId": "block_1720000000003",
//       "position": { "x": 300, "y": 125 },
//       "parameters": { "name": "mint", "params": "recipient: address, amount: u64", "return_type": "" }
//     }
//   ],
//   "connections": [
//     { "from": "block_1720000000001", "to": "block_1720000000002" },
//     { "from": "block_1720000000001", "to": "block_1720000000003" }
//   ]
// }


// ALWAYS USE VARIABLES AND FUNCTIONS WHERE NEEDED..`;

//     const handleGenerateJson = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!promptInput.trim() || isAiThinking || !GROQ_API_KEY) {
//             if (!GROQ_API_KEY) alert("Groq API key is not set. Please check REACT_APP_GROQ_API_KEY in your .env file.");
//             return;
//         }

//         setIsAiThinking(true);
//         setGeneratedJson(null);
//         setCopySuccess('');

//         try {
//             const response = await fetch(GROQ_API_URL, {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     model: GROQ_MODEL,
//                     messages: [
//                         { role: 'system', content: systemPrompt },
//                         { role: 'user', content: promptInput }
//                     ],
//                     // Force the model to output a valid JSON object
//                     response_format: { "type": "json_object" }
//                 }),
//             });

//             if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
            
//             const responseData = await response.json();
//             const jsonContent = JSON.parse(responseData.choices[0].message.content);
//             setGeneratedJson(jsonContent);

//         } catch (error) {
//             console.error("Error generating JSON:", error);
//             setGeneratedJson({ projectName: "Error", blocks: [], connections: [{ from: "Error generating JSON", to: (error as Error).message }] });
//         } finally {
//             setIsAiThinking(false);
//         }
//     };

//     const handleCopy = () => {
//         if (!generatedJson) return;
//         const jsonString = JSON.stringify(generatedJson, null, 2);
//         navigator.clipboard.writeText(jsonString).then(() => {
//             setCopySuccess('Copied!');
//             setTimeout(() => setCopySuccess(''), 2000);
//         }, () => {
//             setCopySuccess('Failed to copy.');
//         });
//     };

//     const handleLoadToCanvas = () => {
//         if (!generatedJson) return;
//         onLoadProject(generatedJson);
//         onClose();
//     };
    
//     if (!isOpen) return null;

//     return (
//         <Card className="absolute bottom-5 right-5 z-30 w-[450px] max-w-[90vw] h-[70vh] flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-5">
//             <CardHeader className="flex flex-row items-center justify-between">
//                 <CardTitle className="flex items-center"><Bot className="mr-2"/>Contract Generator</CardTitle>
//                 <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
//             </CardHeader>
//             <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto">
//                 <form onSubmit={handleGenerateJson} className="flex flex-col gap-2">
//                     <label htmlFor="prompt-input" className="text-sm font-medium">Describe the smart contract you want to build:</label>
//                     <Textarea
//                         id="prompt-input"
//                         placeholder="e.g., A simple voting contract with proposals and a function to vote..."
//                         value={promptInput}
//                         onChange={e => setPromptInput(e.target.value)}
//                         disabled={isAiThinking}
//                         rows={5}
//                     />
//                     <Button type="submit" disabled={isAiThinking || !promptInput.trim()}>
//                         {isAiThinking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generating...</> : "Generate JSON"}
//                     </Button>
//                 </form>

//                 {generatedJson && (
//                     <div className="flex-1 flex flex-col mt-4 border-t pt-4">
//                         <div className="flex justify-between items-center mb-2">
//                            <h3 className="text-sm font-medium">Generated Project JSON</h3>
//                            <div className="flex items-center gap-2">
//                                <Button variant="outline" size="sm" onClick={handleCopy}>
//                                    <Copy className="mr-2 h-4 w-4"/> {copySuccess || 'Copy'}
//                                </Button>
//                                <Button size="sm" onClick={handleLoadToCanvas}>
//                                    <UploadCloud className="mr-2 h-4 w-4"/> Load to Canvas
//                                </Button>
//                            </div>
//                         </div>
//                         <pre className="flex-1 bg-gray-900 text-white p-3 rounded-md text-xs overflow-auto">
//                             <code>{JSON.stringify(generatedJson, null, 2)}</code>
//                         </pre>
//                     </div>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }









import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea"; // Using Textarea for multi-line prompts
import { Bot, Send, Loader2, X, Copy, UploadCloud } from "lucide-react";

// --- API CONFIGURATION ---
const GROQ_API_KEY = "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"; // Make sure this is set in your .env file
const GROQ_MODEL = 'deepseek-r1-distill-llama-70b';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// --- TYPE DEFINITIONS ---
interface ProjectData {
    projectName: string;
    blocks: any[]; // Using 'any' as we don't need to validate a structure we are generating
    connections: any[];
}

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    // New prop to send the generated JSON back to the parent
    onLoadProject: (projectData: ProjectData) => void;
}

export default function ChatbotGenerator({ isOpen, onClose, onLoadProject }: ChatbotProps) {
    const [promptInput, setPromptInput] = useState("");
    const [generatedJson, setGeneratedJson] = useState<ProjectData | null>(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const systemPrompt = `You are an AI assistant that generates a complete JSON configuration for a visual smart contract builder for the Aptos blockchain based on a user's description.

Your task is to generate a single, complete JSON object that represents the entire move smart contract. The JSON object MUST adhere to the following structure:
{
  "projectName": "string",
  "blocks": "Array of block objects",
  "connections": "Array of connection objects"
}

It is a move code smart contract for NFT marketplace:

Move code for an NFT marketplace smart contract on the Aptos blockchain. The contract should allow users to create, transfer, list, and buy NFTs. It should also handle events for NFT creation, transfer, listing, and sale.

module NFTMarketplace::nft_marketplace {
    use std::signer;
    use std::error;
    use std::string::String;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};
    use aptos_std::event;

    // Error codes
    const ENFT_NOT_FOUND: u64 = 1;
    const ENOT_OWNER: u64 = 2;
    const ENFT_NOT_FOR_SALE: u64 = 3;
    const EINSUFFICIENT_FUNDS: u64 = 4;
    const EMARKETPLACE_NOT_INITIALIZED: u64 = 5;

    // NFT structure
    struct NFT has key, store {
        id: u64,
        owner: address,
        metadata: String,
        for_sale: bool,
        price: u64,
        created_at: u64,
    }

    // Global marketplace storage
    struct Marketplace has key {
        nfts: Table<u64, NFT>,
        next_nft_id: u64,
        total_nfts: u64,
    }

    // Events
    struct NFTCreatedEvent has drop, store {
        nft_id: u64,
        owner: address,
        metadata: String,
        timestamp: u64,
    }

    struct NFTTransferredEvent has drop, store {
        nft_id: u64,
        from: address,
        to: address,
        timestamp: u64,
    }

    struct NFTListedEvent has drop, store {
        nft_id: u64,
        owner: address,
        price: u64,
        timestamp: u64,
    }

    struct NFTSoldEvent has drop, store {
        nft_id: u64,
        seller: address,
        buyer: address,
        price: u64,
        timestamp: u64,
    }

    // Event handles
    struct MarketplaceEvents has key {
        nft_created_events: event::EventHandle<NFTCreatedEvent>,
        nft_transferred_events: event::EventHandle<NFTTransferredEvent>,
        nft_listed_events: event::EventHandle<NFTListedEvent>,
        nft_sold_events: event::EventHandle<NFTSoldEvent>,
    }

    // Initialize the marketplace (should be called once by the module publisher)
    public entry fun initialize_marketplace(account: &signer) {
        let marketplace = Marketplace {
            nfts: table::new(),
            next_nft_id: 1,
            total_nfts: 0,
        };
        
        let events = MarketplaceEvents {
            nft_created_events: account::new_event_handle<NFTCreatedEvent>(account),
            nft_transferred_events: account::new_event_handle<NFTTransferredEvent>(account),
            nft_listed_events: account::new_event_handle<NFTListedEvent>(account),
            nft_sold_events: account::new_event_handle<NFTSoldEvent>(account),
        };
        
        move_to(account, marketplace);
        move_to(account, events);
    }

    // Create a new NFT
    public entry fun create_nft(account: &signer, metadata: String) acquires Marketplace, MarketplaceEvents {
        let owner = signer::address_of(account);
        let marketplace = borrow_global_mut<Marketplace>(@NFTMarketplace);
        let events = borrow_global_mut<MarketplaceEvents>(@NFTMarketplace);
        
        let nft_id = marketplace.next_nft_id;
        let nft = NFT {
            id: nft_id,
            owner,
            metadata,
            for_sale: false,
            price: 0,
            created_at: timestamp::now_seconds(),
        };
        
        table::add(&mut marketplace.nfts, nft_id, nft);
        marketplace.next_nft_id = marketplace.next_nft_id + 1;
        marketplace.total_nfts = marketplace.total_nfts + 1;
        
        // Emit event
        event::emit_event(&mut events.nft_created_events, NFTCreatedEvent {
            nft_id,
            owner,
            metadata,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Transfer NFT ownership
    public entry fun transfer_nft(account: &signer, nft_id: u64, to: address) acquires Marketplace, MarketplaceEvents {
        let from = signer::address_of(account);
        let marketplace = borrow_global_mut<Marketplace>(@NFTMarketplace);
        let events = borrow_global_mut<MarketplaceEvents>(@NFTMarketplace);
        
        assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
        let nft = table::borrow_mut(&mut marketplace.nfts, nft_id);
        assert!(nft.owner == from, error::permission_denied(ENOT_OWNER));
        
        nft.owner = to;
        nft.for_sale = false;
        nft.price = 0;
        
        // Emit event
        event::emit_event(&mut events.nft_transferred_events, NFTTransferredEvent {
            nft_id,
            from,
            to,
            timestamp: timestamp::now_seconds(),
        });
    }

    // List NFT for sale
    public entry fun list_nft_for_sale(account: &signer, nft_id: u64, price: u64) acquires Marketplace, MarketplaceEvents {
        let owner = signer::address_of(account);
        let marketplace = borrow_global_mut<Marketplace>(@NFTMarketplace);
        let events = borrow_global_mut<MarketplaceEvents>(@NFTMarketplace);
        
        assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
        let nft = table::borrow_mut(&mut marketplace.nfts, nft_id);
        assert!(nft.owner == owner, error::permission_denied(ENOT_OWNER));
        
        nft.for_sale = true;
        nft.price = price;
        
        // Emit event
        event::emit_event(&mut events.nft_listed_events, NFTListedEvent {
            nft_id,
            owner,
            price,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Buy NFT
    public entry fun buy_nft(account: &signer, nft_id: u64) acquires Marketplace, MarketplaceEvents {
        let buyer = signer::address_of(account);
        let marketplace = borrow_global_mut<Marketplace>(@NFTMarketplace);
        let events = borrow_global_mut<MarketplaceEvents>(@NFTMarketplace);
        
        assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
        let nft = table::borrow_mut(&mut marketplace.nfts, nft_id);
        assert!(nft.for_sale, error::invalid_state(ENFT_NOT_FOR_SALE));
        
        let seller = nft.owner;
        let price = nft.price;
        
        // Transfer payment from buyer to seller
        coin::transfer<AptosCoin>(account, seller, price);
        
        // Transfer NFT ownership
        nft.owner = buyer;
        nft.for_sale = false;
        nft.price = 0;
        
        // Emit event
        event::emit_event(&mut events.nft_sold_events, NFTSoldEvent {
            nft_id,
            seller,
            buyer,
            price,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Remove NFT from sale
    public entry fun remove_from_sale(account: &signer, nft_id: u64) acquires Marketplace {
        let owner = signer::address_of(account);
        let marketplace = borrow_global_mut<Marketplace>(@NFTMarketplace);
        
        assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
        let nft = table::borrow_mut(&mut marketplace.nfts, nft_id);
        assert!(nft.owner == owner, error::permission_denied(ENOT_OWNER));
        
        nft.for_sale = false;
        nft.price = 0;
    }

    // View functions
    #[view]
    public fun get_nft_owner(nft_id: u64): address acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@NFTMarketplace);
        assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
        let nft = table::borrow(&marketplace.nfts, nft_id);
        nft.owner
    }

    #[view]
    public fun get_nft_details(nft_id: u64): (u64, address, String, bool, u64, u64) acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@NFTMarketplace);
        assert!(table::contains(&marketplace.nfts, nft_id), error::not_found(ENFT_NOT_FOUND));
        
        let nft = table::borrow(&marketplace.nfts, nft_id);
        (nft.id, nft.owner, nft.metadata, nft.for_sale, nft.price, nft.created_at)
    }

    #[view]
    public fun get_marketplace_stats(): (u64, u64) acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@NFTMarketplace);
        (marketplace.total_nfts, marketplace.next_nft_id - 1)
    }

    #[view]
    public fun is_nft_for_sale(nft_id: u64): bool acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@NFTMarketplace);
        if (!table::contains(&marketplace.nfts, nft_id)) {
            return false
        };
        
        let nft = table::borrow(&marketplace.nfts, nft_id);
        nft.for_sale
    }
}

A 'block' object must have these keys:
- id: string (The block's template ID from the list below)
- name: string (A human-readable name, e.g., "Module", "Public Function")
- type: string (The block's category from the list below)
- instanceId: string (A unique ID for this block, e.g., "block_17517...")
- position: { x: number, y: number } (Infer a reasonable layout, like a flowchart)
- parameters: object (Specifics for the block, see examples in the list below)

A 'connection' object must have:
- from: string (The instanceId of the source block)
- to: string (The instanceId of the destination block)

--- AVAILABLE BLOCKS ---

**Structure Blocks (type: "structure")**
- **id: "module"**: The root container for the contract.
  - parameters: { "name": "MyContract", "module_name": "my_contract_file" }
- **id: "struct"**: A custom data structure.
  - parameters: { "name": "MyStruct", "fields": "field1: u64,\\nfield2: address" }
- **id: "resource"**: A struct that can be stored in an account.
  - parameters: { "name": "MyResource", "fields": "data: vector<u8>" }

**Function Blocks (type: "function")**
- **id: "public-function"**: A function callable within the module.
  - parameters: { "name": "my_public_func", "params": "p1: u64", "return_type": "bool" }
- **id: "entry-function"**: A function callable as a transaction.
  - parameters: { "name": "my_entry_func", "params": "amount: u64" }
- **id: "private-function"**: A function only callable inside the current module.
  - parameters: { "name": "_my_private_helper", "params": "value: u64" }

**Variable & State Blocks (type: "variable")**
- **id: "let-variable"**: Declare a local variable.
  - parameters: { "name": "my_var", "type": "u64", "value": "0" }
- **id: "assign"**: Assign a new value to a variable.
  - parameters: { "variable": "my_var", "value": "100" }
- **id: "constant"**: A module-level constant.
  - parameters: { "name": "ADMIN_ADDRESS", "type": "address", "value": "@0x123" }

**Logic Blocks (type: "logic")**
- **id: "if-else"**: A conditional branch. Requires two outgoing connections.
  - parameters: { "condition": "x > 10" }
- **id: "while-loop"**: A loop that repeats while a condition is true.
  - parameters: { "condition": "i < 10" }

**Operation Blocks (type: "operation")**
- **id: "calculate"**: Perform a mathematical calculation.
  - parameters: { "left": "a", "operator": "+", "right": "b" }
- **id: "compare"**: Perform a comparison.
  - parameters: { "left": "balance", "operator": ">=", "right": "amount" }

**Blockchain & Resource Management Blocks (type: "blockchain")**
- **id: "transfer"**: Transfer Aptos Coin.
  - parameters: { "from": "&signer", "to": "recipient_addr", "amount": "amount" }
- **id: "mint"**: Create new tokens (conceptual).
  - parameters: { "recipient": "addr", "amount": "1000" }
- **id: "burn"**: Destroy tokens (conceptual).
  - parameters: { "from": "&signer", "amount": "100" }
- **id: "move-to"**: Store a resource under an account.
  - parameters: { "signer": "account", "resource_variable": "my_resource_instance" }
- **id: "move-from"**: Take a resource from an account.
  - parameters: { "assign_to": "retrieved_resource", "address": "source_addr" }
- **id: "borrow-global"**: Get a read-only reference to a resource.
  - parameters: { "assign_to": "resource_ref", "address": "owner_addr" }
- **id: "borrow-global-mut"**: Get a mutable reference to a resource.
  - parameters: { "assign_to": "resource_mut_ref", "address": "owner_addr" }

**Debug Blocks (type: "debug")**
- **id: "assert"**: Abort the transaction if a condition is false.
  - parameters: { "condition": "user_is_admin", "error_code": "101" }
- **id: "log"**: Log a debug message (conceptual).
  - parameters: { "message": "'Executing transfer...'" }

--- RULES ---
1. Always generate unique 'instanceId's using a 'block_...' prefix.
2. Infer a logical 'projectName' from the user's prompt.
3. Make sure all logical parts of the contract are connected. Functions and structs must be connected FROM their parent module. Logic inside a function must be connected FROM the function block.
4. Your entire response must be ONLY the JSON object, nothing else.

--- EXAMPLE ---
User prompt: "Create a simple coin contract. It should have a module called 'MyCoin'. Inside, create a resource struct called 'Coin' with a 'value' of type u64. Also, add an entry function called 'mint' that takes a 'recipient' address and an 'amount' of u64."

Your generated JSON should look like this:
{
  "projectName": "MyCoinContract",
  "blocks": [
    {
      "id": "module",
      "name": "Module",
      "type": "structure",
      "instanceId": "block_1720000000001",
      "position": { "x": 50, "y": 50 },
      "parameters": { "name": "MyCoin", "module_name": "my_coin" }
    },
    {
      "id": "resource",
      "name": "Resource",
      "type": "structure",
      "instanceId": "block_1720000000002",
      "position": { "x": 50, "y": 200 },
      "parameters": { "name": "Coin", "fields": "value: u64" }
    },
    {
      "id": "entry-function",
      "name": "Entry Function",
      "type": "function",
      "instanceId": "block_1720000000003",
      "position": { "x": 300, "y": 125 },
      "parameters": { "name": "mint", "params": "recipient: address, amount: u64", "return_type": "" }
    }
  ],
  "connections": [
    { "from": "block_1720000000001", "to": "block_1720000000002" },
    { "from": "block_1720000000001", "to": "block_1720000000003" }
  ]
}


ALWAYS USE VARIABLES AND FUNCTIONS WHERE NEEDED..`;

    const handleGenerateJson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!promptInput.trim() || isAiThinking || !GROQ_API_KEY) {
            if (!GROQ_API_KEY) alert("Groq API key is not set. Please check REACT_APP_GROQ_API_KEY in your .env file.");
            return;
        }

        setIsAiThinking(true);
        setGeneratedJson(null);
        setCopySuccess('');

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: promptInput }
                    ],
                    // Force the model to output a valid JSON object
                    response_format: { "type": "json_object" }
                }),
            });

            if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
            
            const responseData = await response.json();
            const jsonContent = JSON.parse(responseData.choices[0].message.content);
            setGeneratedJson(jsonContent);

        } catch (error) {
            console.error("Error generating JSON:", error);
            setGeneratedJson({ projectName: "Error", blocks: [], connections: [{ from: "Error generating JSON", to: (error as Error).message }] });
        } finally {
            setIsAiThinking(false);
        }
    };

    const handleCopy = () => {
        if (!generatedJson) return;
        const jsonString = JSON.stringify(generatedJson, null, 2);
        navigator.clipboard.writeText(jsonString).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy.');
        });
    };

    const handleLoadToCanvas = () => {
        if (!generatedJson) return;
        onLoadProject(generatedJson);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <Card className="absolute bottom-5 right-5 z-30 w-[450px] max-w-[90vw] h-[70vh] flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-5">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center"><Bot className="mr-2"/>Contract Generator</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto">
                <form onSubmit={handleGenerateJson} className="flex flex-col gap-2">
                    <label htmlFor="prompt-input" className="text-sm font-medium">Describe the smart contract you want to build:</label>
                    <Textarea
                        id="prompt-input"
                        placeholder="e.g., A simple voting contract with proposals and a function to vote..."
                        value={promptInput}
                        onChange={e => setPromptInput(e.target.value)}
                        disabled={isAiThinking}
                        rows={5}
                    />
                    <Button type="submit" disabled={isAiThinking || !promptInput.trim()}>
                        {isAiThinking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generating...</> : "Generate JSON"}
                    </Button>
                </form>

                {generatedJson && (
                    <div className="flex-1 flex flex-col mt-4 border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                           <h3 className="text-sm font-medium">Generated Project JSON</h3>
                           <div className="flex items-center gap-2">
                               <Button variant="outline" size="sm" onClick={handleCopy}>
                                   <Copy className="mr-2 h-4 w-4"/> {copySuccess || 'Copy'}
                               </Button>
                               <Button size="sm" onClick={handleLoadToCanvas}>
                                   <UploadCloud className="mr-2 h-4 w-4"/> Load to Canvas
                               </Button>
                           </div>
                        </div>
                        <pre className="flex-1 bg-gray-900 text-white p-3 rounded-md text-xs overflow-auto">
                            <code>{JSON.stringify(generatedJson, null, 2)}</code>
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}