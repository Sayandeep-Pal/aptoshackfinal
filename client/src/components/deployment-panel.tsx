import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Upload, Settings, Zap, ExternalLink } from "lucide-react";

interface DeploymentPanelProps {
  generatedCode?: string;
  // blocks prop is not used for conditional rendering of the main deployment form
  // to ensure the form is always visible, similar to the App component.
  blocks?: any[]; 
}

export default function DeploymentPanel({ generatedCode }: DeploymentPanelProps) {
    // State variables adapted from the App component and existing DeploymentPanel
    const [moveCode, setMoveCode] = useState(generatedCode || 'module 0x1::Message {\n    struct Message has key, store {\n        message: vector<u8>,\n    }\n\n    public fun get_message(addr: address): vector<u8> acquires Message {\n        borrow_global<Message>(addr).message\n    }\n}');
    const [response, setResponse] = useState('Ready to deploy. Click any button to start the respective operation.');
    const [loading, setLoading] = useState(false); // Combines isLoading and isDeploying from App

    // Existing DeploymentPanel specific states
    const [moduleName, setModuleName] = useState('None');
    const [packageName, setPackageName] = useState('None');
    const [contractAddress, setContractAddress] = useState('None');

    const [initStatus, setInitStatus] = useState<'pending' | 'processing' | 'complete'>('pending');
    const [compileStatus, setCompileStatus] = useState<'pending' | 'processing' | 'complete'>('pending');
    const [deployStatus, setDeployStatus] = useState<'pending' | 'processing' | 'complete'>('pending');

    const [compileButtonDisabled, setCompileButtonDisabled] = useState(true);
    const [deployButtonDisabled, setDeployButtonDisabled] = useState(true);

    const [infoContainerClass, setInfoContainerClass] = useState('info-container'); // For visual feedback on response

    const [networkType, setNetworkType] = useState('testnet');
    const [privateKeyInput, setPrivateKeyInput] = useState(''); // Renamed from privateKey1 to avoid confusion with internal usage
    const [faucetUrl, setFaucetUrl] = useState('');
    const [integrationFunctions, setIntegrationFunctions] = useState<string[]>([]);
    const [showIntegrationFunctions, setShowIntegrationFunctions] = useState(false);

    // Effect to update moveCode if generatedCode prop changes
    useEffect(() => {
      if (generatedCode) {
        setMoveCode(generatedCode);
      }
    }, [generatedCode]);

    /**
     * Updates the status icon for a specific operation.
     * @param statusType 'init', 'compile', or 'deploy'
     * @param status 'pending', 'processing', or 'complete'
     */
    const updateStatusIcon = (statusType: 'init' | 'compile' | 'deploy', status: 'pending' | 'processing' | 'complete') => {
        if (statusType === 'init') setInitStatus(status);
        if (statusType === 'compile') setCompileStatus(status);
        if (statusType === 'deploy') setDeployStatus(status);
    };

    /**
     * Updates module, package, and contract address information.
     */
    const updateInfo = (moduleName: string, packageName: string, address: string) => {
        setModuleName(moduleName || 'Unknown');
        setPackageName(packageName || 'Unknown');
        setContractAddress(address || 'Unknown');
    };

    /**
     * Handles the initialization of the Aptos project.
     * Corresponds to handleInit and submitInit from the App component.
     */
    const initializeProject = async () => {
        if (!moveCode.trim()) {
            setResponse('Error: Please enter Move code before initializing.');
            setInfoContainerClass('info-container error');
            return;
        }

        setLoading(true);
        updateStatusIcon('init', 'processing');
        setResponse('⏳ Initializing...');
        setInfoContainerClass('info-container'); // Reset class for new operation

        try {
            const res = await fetch('http://localhost:3000/init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ moveCode, networkType, privateKey: privateKeyInput.trim() }),
            });

            const data = await res.json();
            console.log(data); // Debugging output from App component
            
            let addressLink = '';
            if (data.address) {
                const generatedFaucetUrl = `https://aptos.dev/network/faucet?address=${data.address}`;
                addressLink = `\nAddress: ${data.address}\nFaucet: ${generatedFaucetUrl}`;
                setFaucetUrl(generatedFaucetUrl);
            } else {
                setFaucetUrl(''); // Clear faucet URL if address is not returned
            }

            setResponse(
                data.success
                    ? `✅ Initialized\n\n${data.log || ''}${addressLink}`
                    : `❌ Init Failed\n\n${data.error || ''}\n${data.log || ''}`
            );
            setInfoContainerClass(data.success ? 'info-container success' : 'info-container error');
            updateInfo(data.moduleName, data.packageName, data.address);

            if (data.success) {
                updateStatusIcon('init', 'complete');
                setCompileButtonDisabled(false); // Enable compile after successful init
            } else {
                updateStatusIcon('init', 'pending');
                setCompileButtonDisabled(true);
                setDeployButtonDisabled(true);
            }

        } catch (error: any) {
            setResponse(`❌ Request Error:\n${error.message}`);
            console.error(error); // Detailed error logging
            updateStatusIcon('init', 'pending');
            setInfoContainerClass('info-container error');
            setCompileButtonDisabled(true);
            setDeployButtonDisabled(true);
            setFaucetUrl(''); // Clear faucet URL on error
        } finally {
            setLoading(false);
            setPrivateKeyInput(''); // Reset private key input after operation, as per App's behavior
        }
    };

    /**
     * Handles the compilation of the Move package.
     * Corresponds to handleCompile from the App component.
     */
    const compilePackage = async () => {
        if (!moveCode.trim()) {
            setResponse('Error: Please enter Move code before compiling.');
            setInfoContainerClass('info-container error');
            return;
        }

        setLoading(true);
        updateStatusIcon('compile', 'processing');
        setResponse('⏳ Compiling...');
        setInfoContainerClass('info-container'); // Reset class

        try {
            const res = await fetch('http://localhost:3000/compile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ moveCode }),
            });

            const data = await res.json();
            console.log(data); // Debugging output from App component
            console.log(data.error); // Debugging output from App component
            setResponse(
                data.success
                    ? `✅ Compiled Successfully\n\n${data.log}`
                    : `❌ Compilation Failed\n\n${data.error}`
            );
            setInfoContainerClass(data.success ? 'info-container success' : 'info-container error');
            updateInfo(data.moduleName, data.packageName, data.address); // Update info potentially

            if (data.success) {
                updateStatusIcon('compile', 'complete');
                setDeployButtonDisabled(false); // Enable deploy after successful compile
            } else {
                updateStatusIcon('compile', 'pending');
                setDeployButtonDisabled(true);
            }

        } catch (error: any) {
            setResponse(`❌ Request Error:\n${error.message}`);
            console.error(error);
            updateStatusIcon('compile', 'pending');
            setInfoContainerClass('info-container error');
            setDeployButtonDisabled(true);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles the deployment of the Move package.
     * Corresponds to handleDeploy from the App component.
     */
    const deployPackage = async () => {
        if (!moveCode.trim()) {
            setResponse('Error: Please enter Move code before deploying.');
            setInfoContainerClass('info-container error');
            return;
        }

        setLoading(true);
        updateStatusIcon('deploy', 'processing');
        setResponse('⏳ Deploying...');
        setInfoContainerClass('info-container'); // Reset class

        try {
            const res = await fetch('http://localhost:3000/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ moveCode }),
            });

            const data = await res.json();
            setResponse(
                data.success
                    ? `✅ Deployed Successfully\n\n${data.log}`
                    : `❌ Deployment Failed\n\n${data.error || ''}\n${data.log || ''}`
            );
            setInfoContainerClass(data.success ? 'info-container success' : 'info-container error');
            updateInfo(data.moduleName, data.packageName, data.address);

            if (data.success) {
                updateStatusIcon('deploy', 'complete');
                // If deployment is successful, it implies init and compile were also successful for this flow
                updateStatusIcon('init', 'complete');
                updateStatusIcon('compile', 'complete');
            } else {
                updateStatusIcon('deploy', 'pending');
            }

        } catch (error: any) {
            setResponse(`❌ Request Error:\n${error.message}`);
            console.error(error);
            updateStatusIcon('deploy', 'pending');
            setInfoContainerClass('info-container error');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles the removal of Aptos configurations/files.
     * Corresponds to handleRemoveAptos from the App component.
     */
    const removeAptosFiles = async () => {
        setLoading(true);
        setResponse('⏳ Removing Aptos...');
        setInfoContainerClass('info-container'); // Reset class

        try {
            const res = await fetch('http://localhost:3000/remove-aptos');
            const data = await res.json();
            setResponse(
                data.success
                    ? `✅ Removed Aptos\n\n${data.log || ''}`
                    : `❌ Remove Failed\n\n${data.error || ''}\n${data.log || ''}`
            );
            setInfoContainerClass(data.success ? 'info-container success' : 'info-container error');
            
            // Reset statuses and related info after removing aptos (implies a clean slate)
            updateStatusIcon('init', 'pending');
            updateStatusIcon('compile', 'pending');
            updateStatusIcon('deploy', 'pending');
            setCompileButtonDisabled(true);
            setDeployButtonDisabled(true);
            setFaucetUrl('');
            setContractAddress('None');
            setModuleName('None');
            setPackageName('None');

        } catch (err: any) {
            setResponse(`❌ Request Error:\n${err.message}`);
            console.error(err);
            setInfoContainerClass('info-container error');
        } finally {
            setLoading(false);
        }
    };

    // get frontend integration functions
    /**
     * Handles getting frontend integration functions.
     */
    const getFrontendIntegrationFunctions = async () => {
        setLoading(true);
        setResponse('⏳ Getting Frontend Integration Functions...');
        setInfoContainerClass('info-container');

        try {
            const res = await fetch('http://localhost:3000/integration-functions');
            const data = await res.json();
            
            if (data.success) {
                setIntegrationFunctions(data.integrationFunctions);
                setShowIntegrationFunctions(true);
                setResponse(`✅ Frontend Integration Functions Generated\n\nGenerated ${data.integrationFunctions.length} integration blocks`);
                setInfoContainerClass('info-container success');
            } else {
                setResponse(`❌ Failed to Generate Integration Functions\n\n${data.error || ''}`);
                setInfoContainerClass('info-container error');
                setShowIntegrationFunctions(false);
            }
        } catch (error: any) {
            setResponse(`❌ Request Error:\n${error.message}`);
            console.error(error);
            setInfoContainerClass('info-container error');
            setShowIntegrationFunctions(false);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Returns style object for status icons based on their status.
     */
    const getStatusIconStyle = (status: 'pending' | 'processing' | 'complete') => {
        const baseStyle = {
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            marginRight: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold' as const,
        };

        switch (status) {
            case 'complete':
                return { ...baseStyle, backgroundColor: '#28a745' };
            case 'processing':
                return { ...baseStyle, backgroundColor: '#ffc107', color: '#212529' };
            default: // 'pending'
                return { ...baseStyle, backgroundColor: '#6c757d' };
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Contract Deployment</h3>
                        <p className="text-sm text-gray-600">Deploy your smart contract to the Aptos blockchain</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="deploy" className="h-full flex flex-col">
                    <div className="px-4 py-2 border-b">
                        <TabsList>
                            <TabsTrigger value="deploy">Deploy</TabsTrigger>
                            <TabsTrigger value="manage">Manage</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <TabsContent value="deploy" className="h-full m-0">
                            <div className="h-full p-4">
                                {/* The deployment card is always visible, similar to the App component */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm flex items-center">
                                                <Upload className="w-4 h-4 mr-2" />
                                                Contract Deployment
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                

                                                <Label htmlFor="networkType">Network Type:</Label>
                                                <Select value={networkType} onValueChange={setNetworkType} disabled={loading}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="testnet">Testnet</SelectItem>
                                                        <SelectItem value="devnet">Devnet</SelectItem>
                                                        <SelectItem value="mainnet">Mainnet</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Label htmlFor="privateKeyInput">Private Key (Optional):</Label>
                                                <Input
                                                    type="text"
                                                    id="privateKeyInput"
                                                    placeholder="Leave blank to generate a new key"
                                                    value={privateKeyInput}
                                                    onChange={(e) => setPrivateKeyInput(e.target.value)}
                                                    disabled={loading}
                                                />

                                                {faucetUrl && (
                                                    <div style={{
                                                        marginTop: '10px', backgroundColor: '#e2f7de', padding: '10px',
                                                        borderRadius: '4px', border: '1px solid #baf0b0'
                                                    }}>
                                                        <p>Faucet URL: <a
                                                            href={faucetUrl}
                                                            target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{faucetUrl}</a>
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex items-center">
                                                        <div style={getStatusIconStyle(initStatus)} id="initStatus"></div>
                                                        <span>Initialize Project</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div style={getStatusIconStyle(compileStatus)} id="compileStatus"></div>
                                                        <span>Compile Package</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div style={getStatusIconStyle(deployStatus)} id="deployStatus"></div>
                                                        <span>Deploy to Aptos</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2"> {/* Use flex-wrap for buttons */}
                                                    <Button id="initBtn" onClick={initializeProject} disabled={loading}>
                                                        Initialize
                                                    </Button>
                                                    <Button
                                                        id="compileBtn"
                                                        onClick={compilePackage}
                                                        disabled={compileButtonDisabled || loading}
                                                    >
                                                        Compile
                                                    </Button>
                                                    <Button
                                                        id="deployBtn"
                                                        onClick={deployPackage}
                                                        disabled={deployButtonDisabled || loading}
                                                    >
                                                        Deploy
                                                    </Button>
                                                    <Button
                                                        id="removeAptosBtn"
                                                        onClick={removeAptosFiles}
                                                        disabled={loading}
                                                    >
                                                        Remove Aptos
                                                    </Button>
                                                    <Button
                                                        id="getFrontendIntegrationFunctionsBtn"
                                                        onClick={getFrontendIntegrationFunctions}
                                                        disabled={loading}
                                                    >
                                                        Get Frontend Integration Functions
                                                    </Button>
                                                </div>
                                                <Label>Response:</Label>
                                                <pre
                                                    className={infoContainerClass.includes('error') ? 'text-red-500' : ''}
                                                    style={{
                                                        backgroundColor: '#f8f9fa',
                                                        padding: '1em',
                                                        whiteSpace: 'pre-wrap',
                                                        border: '1px solid #dee2e6',
                                                        borderRadius: '4px',
                                                        fontFamily: 'monospace',
                                                        fontSize: '14px',
                                                        maxHeight: '200px',
                                                        overflowY: 'auto'
                                                    }}
                                                >{response}</pre>

                                                {showIntegrationFunctions && integrationFunctions.length > 0 && (
                                                    <div className="space-y-4">
                                                        <Label>Frontend Integration Functions:</Label>
                                                        {integrationFunctions.map((func, index) => (
                                                            <div key={index} className="space-y-2">
                                                                <Label className="text-sm font-medium">
                                                                    {index === 0 ? 'Imports & Setup' : 
                                                                     index === 1 ? 'Module Address' : 
                                                                     `Function Integration ${index - 1}`}
                                                                </Label>
                                                                <pre
                                                                    style={{
                                                                        backgroundColor: '#f1f3f4',
                                                                        padding: '1em',
                                                                        whiteSpace: 'pre-wrap',
                                                                        border: '1px solid #d1d5db',
                                                                        borderRadius: '6px',
                                                                        fontFamily: 'monospace',
                                                                        fontSize: '13px',
                                                                        maxHeight: '300px',
                                                                        overflowY: 'auto',
                                                                        position: 'relative'
                                                                    }}
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="absolute top-2 right-2 h-6 px-2"
                                                                        onClick={() => navigator.clipboard.writeText(func)}
                                                                    >
                                                                        Copy
                                                                    </Button>
                                                                    {func}
                                                                </pre>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="manage" className="h-full m-0">
                            <div className="h-full p-4">
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Contract Management
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <h4 className="font-medium text-blue-900 mb-2">Deployed Contracts</h4>
                                                <p className="text-sm text-blue-700">Manage and interact with your deployed
                                                    smart contracts.</p>
                                            </div>

                                            {contractAddress && contractAddress !== 'None' ? (
                                                <div className="space-y-3">
                                                    <div className="p-3 border rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-sm">Smart Contract</span>
                                                            <Badge variant="outline">Active</Badge>
                                                        </div>
                                                        <div className="text-xs text-gray-600 mb-2">{contractAddress}</div>
                                                        <div className="flex space-x-2">
                                                            <Button variant="outline" size="sm" asChild>
                                                                <a href={`https://explorer.aptoslabs.com/account/${contractAddress}?network=${networkType}`} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                                    View
                                                                </a>
                                                            </Button>
                                                            <Button variant="outline" size="sm">
                                                                <Settings className="w-3 h-3 mr-1" />
                                                                Manage
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No active contracts to manage. Deploy one first!</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="h-full m-0">
                            <div className="h-full p-4">
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Deployment History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-64">
                                            <div className="space-y-3">
                                                {deployStatus === "complete" && contractAddress && contractAddress !== 'None' ? (
                                                    <div className="p-3 border rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-sm">Smart Contract</span>
                                                            <Badge variant="outline">Success</Badge>
                                                        </div>
                                                        <div className="text-xs text-gray-600 mb-1">
                                                            Deployed to {networkType} • {new Date().toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-gray-600">{contractAddress}</div>
                                                        <Button variant="outline" size="sm" className="mt-2" asChild>
                                                            <a href={`https://explorer.aptoslabs.com/account/${contractAddress}?network=${networkType}`} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                                View on Explorer
                                                            </a>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">No deployment history yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}