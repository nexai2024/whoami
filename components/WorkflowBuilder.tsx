'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  FiZap, FiMail, FiTag, FiBook, FiClock, FiGitBranch,
  FiSave, FiPlay, FiSettings, FiTrash2, FiGlobe, FiCode,
  FiFile
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface WorkflowBuilderProps {
  workflowId?: string;
  onSave?: (workflow: any) => void;
}

export default function WorkflowBuilder({ workflowId, onSave }: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<any>({
    name: '',
    description: '',
    enabled: true,
    status: 'DRAFT'
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    } else {
      // Initialize with trigger node
      initializeEmptyWorkflow();
    }
  }, [workflowId]);

  const initializeEmptyWorkflow = () => {
    const triggerNode: Node = {
      id: 'trigger',
      type: 'default',
      data: {
        label: '⚡ Workflow Trigger',
        type: 'TRIGGER',
        config: {
          triggerType: 'MANUAL',
          filters: {}
        }
      },
      position: { x: 250, y: 50 },
      draggable: false
    };
    setNodes([triggerNode]);
  };

  const loadWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkflow(data);

        // Convert workflow steps to nodes
        const flowNodes: Node[] = [
          {
            id: 'trigger',
            type: 'default',
            data: {
              label: '⚡ Workflow Trigger',
              type: 'TRIGGER',
              config: data.trigger || {}
            },
            position: { x: 250, y: 50 },
            draggable: false
          }
        ];

        const flowEdges: Edge[] = [];

        if (data.steps) {
          data.steps.forEach((step: any, index: number) => {
            const node: Node = {
              id: step.id,
              type: 'default',
              data: {
                label: getStepLabel(step.type),
                type: step.type,
                config: step.config || {},
                delayAmount: step.delayAmount,
                delayUnit: step.delayUnit
              },
              position: step.position || { x: 250, y: 150 + (index * 100) }
            };
            flowNodes.push(node);

            // Create edge from previous node
            const sourceId = index === 0 ? 'trigger' : data.steps[index - 1].id;
            flowEdges.push({
              id: `e-${sourceId}-${step.id}`,
              source: sourceId,
              target: step.id,
              markerEnd: { type: MarkerType.ArrowClosed }
            });
          });
        }

        setNodes(flowNodes);
        setEdges(flowEdges);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error('Failed to load workflow');
    }
  };

  const getStepLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'SEND_EMAIL': '📧 Send Email',
      'ADD_TAG': '🏷️ Add Tag',
      'REMOVE_TAG': '🔖 Remove Tag',
      'ENROLL_IN_COURSE': '📚 Enroll in Course',
      'WAIT': '⏰ Wait/Delay',
      'CONDITION': '🔀 Condition',
      'HTTP_REQUEST': '🌐 HTTP Request',
      'DATA_TRANSFORM': '🔧 Data Transform',
      'EXTERNAL_API': '⚡ External API',
      'FILE_CREATE': '📄 Create File'
    };
    return labels[type] || type;
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const addStep = (stepType: string) => {
    const newId = `step-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'default',
      data: {
        label: getStepLabel(stepType),
        type: stepType,
        config: {}
      },
      position: { x: 250, y: nodes.length * 100 + 50 }
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Convert nodes and edges to workflow data
      const steps = nodes
        .filter(n => n.id !== 'trigger')
        .map((node, index) => ({
          id: node.id,
          type: node.data.type,
          order: index,
          config: node.data.config || {},
          delayAmount: node.data.delayAmount,
          delayUnit: node.data.delayUnit,
          position: node.position
        }));

      const triggerNode = nodes.find(n => n.id === 'trigger');
      const trigger = triggerNode?.data.config || { triggerType: 'MANUAL', filters: {} };

      const workflowData = {
        ...workflow,
        trigger,
        steps
      };

      const url = workflowId ? `/api/workflows/${workflowId}` : '/api/workflows';
      const method = workflowId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Workflow saved successfully!');
        if (onSave) onSave(data);
      } else {
        toast.error('Failed to save workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === 'trigger') {
      toast.error('Cannot delete trigger node');
      return;
    }
    setNodes((nds) => nds.filter(n => n.id !== nodeId));
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Workflow Name"
            value={workflow.name}
            onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
            className="text-2xl font-bold border-none outline-none focus:ring-0 w-full"
          />
          <input
            type="text"
            placeholder="Description"
            value={workflow.description}
            onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
            className="text-sm text-gray-600 border-none outline-none focus:ring-0 w-full mt-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !workflow.name}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <FiSave />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Node Palette */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Add Steps</h3>

          <div className="space-y-2">
            <button
              onClick={() => addStep('SEND_EMAIL')}
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-3"
            >
              <FiMail className="text-blue-600" />
              <div>
                <div className="font-medium text-sm">Send Email</div>
                <div className="text-xs text-gray-600">Send automated email</div>
              </div>
            </button>

            <button
              onClick={() => addStep('ADD_TAG')}
              className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-3"
            >
              <FiTag className="text-green-600" />
              <div>
                <div className="font-medium text-sm">Add Tag</div>
                <div className="text-xs text-gray-600">Tag contacts</div>
              </div>
            </button>

            <button
              onClick={() => addStep('REMOVE_TAG')}
              className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors flex items-center gap-3"
            >
              <FiTag className="text-yellow-600" />
              <div>
                <div className="font-medium text-sm">Remove Tag</div>
                <div className="text-xs text-gray-600">Remove tags</div>
              </div>
            </button>

            <button
              onClick={() => addStep('ENROLL_IN_COURSE')}
              className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-3"
            >
              <FiBook className="text-purple-600" />
              <div>
                <div className="font-medium text-sm">Enroll in Course</div>
                <div className="text-xs text-gray-600">Auto-enroll students</div>
              </div>
            </button>

            <button
              onClick={() => addStep('WAIT')}
              className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-3"
            >
              <FiClock className="text-orange-600" />
              <div>
                <div className="font-medium text-sm">Wait/Delay</div>
                <div className="text-xs text-gray-600">Add time delay</div>
              </div>
            </button>

            <button
              onClick={() => addStep('CONDITION')}
              className="w-full text-left p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors flex items-center gap-3"
            >
              <FiGitBranch className="text-pink-600" />
              <div>
                <div className="font-medium text-sm">Condition</div>
                <div className="text-xs text-gray-600">Conditional logic</div>
              </div>
            </button>

            <button
              onClick={() => addStep('HTTP_REQUEST')}
              className="w-full text-left p-3 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-3"
            >
              <FiGlobe className="text-cyan-600" />
              <div>
                <div className="font-medium text-sm">HTTP Request</div>
                <div className="text-xs text-gray-600">Call external APIs</div>
              </div>
            </button>

            <button
              onClick={() => addStep('DATA_TRANSFORM')}
              className="w-full text-left p-3 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-3"
            >
              <FiCode className="text-teal-600" />
              <div>
                <div className="font-medium text-sm">Data Transform</div>
                <div className="text-xs text-gray-600">Transform data</div>
              </div>
            </button>

            <button
              onClick={() => addStep('EXTERNAL_API')}
              className="w-full text-left p-3 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors flex items-center gap-3"
            >
              <FiZap className="text-violet-600" />
              <div>
                <div className="font-medium text-sm">External API</div>
                <div className="text-xs text-gray-600">Slack, Discord, etc</div>
              </div>
            </button>

            <button
              onClick={() => addStep('FILE_CREATE')}
              className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-3"
            >
              <FiFile className="text-amber-600" />
              <div>
                <div className="font-medium text-sm">Create File</div>
                <div className="text-xs text-gray-600">Generate files</div>
              </div>
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {/* Configuration Panel */}
        {selectedNode && (
          <div className="w-96 bg-white border-l p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Configure Step</h3>
              {selectedNode.id !== 'trigger' && (
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Type
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  {selectedNode.data.label}
                </div>
              </div>

              {selectedNode.data.type === 'SEND_EMAIL' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email To
                    </label>
                    <input
                      type="text"
                      placeholder="{'{'}{'{'}email{'}'}{'}'}"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.config?.emailTo || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, emailTo: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.config?.subject || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, subject: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.config?.body || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, body: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    />
                  </div>
                </>
              )}

              {selectedNode.data.type === 'WAIT' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay Amount
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.delayAmount || 1}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: { ...selectedNode.data, delayAmount: parseInt(e.target.value) }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay Unit
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.delayUnit || 'days'}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: { ...selectedNode.data, delayUnit: e.target.value }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                    </select>
                  </div>
                </>
              )}

              {(selectedNode.data.type === 'ADD_TAG' || selectedNode.data.type === 'REMOVE_TAG') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={selectedNode.data.config?.tagName || ''}
                    onChange={(e) => {
                      const updatedNode = {
                        ...selectedNode,
                        data: {
                          ...selectedNode.data,
                          config: { ...selectedNode.data.config, tagName: e.target.value }
                        }
                      };
                      setSelectedNode(updatedNode);
                      setNodes((nds) =>
                        nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                      );
                    }}
                  />
                </div>
              )}

              {selectedNode.data.type === 'HTTP_REQUEST' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="https://api.example.com/endpoint"
                      value={selectedNode.data.config?.url || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, url: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Use {'{{'} variable {'}}'} for interpolation</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Method
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.config?.method || 'POST'}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, method: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  {['POST', 'PUT', 'PATCH'].includes(selectedNode.data.config?.method || 'POST') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Body (JSON)
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                        rows={6}
                        placeholder='{"{"}key": "value"}'
                        value={selectedNode.data.config?.body || ''}
                        onChange={(e) => {
                          const updatedNode = {
                            ...selectedNode,
                            data: {
                              ...selectedNode.data,
                              config: { ...selectedNode.data.config, body: e.target.value }
                            }
                          };
                          setSelectedNode(updatedNode);
                          setNodes((nds) =>
                            nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                          );
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Response As
                    </label>
                    <input
                      type="text"
                      placeholder="response"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.config?.responseVariable || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, responseVariable: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    />
                  </div>
                </>
              )}

              {selectedNode.data.type === 'DATA_TRANSFORM' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Input Variable
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="variableName"
                      value={selectedNode.data.config?.inputVariable || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, inputVariable: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transform Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.config?.transformType || 'EXTRACT_FIELD'}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, transformType: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    >
                      <option value="EXTRACT_FIELD">Extract Field</option>
                      <option value="MAP_OBJECT">Map Object</option>
                      <option value="FILTER_ARRAY">Filter Array</option>
                      <option value="MERGE_OBJECTS">Merge Objects</option>
                    </select>
                  </div>
                  {selectedNode.data.config?.transformType === 'EXTRACT_FIELD' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Path
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="user.email"
                        value={selectedNode.data.config?.fieldPath || ''}
                        onChange={(e) => {
                          const updatedNode = {
                            ...selectedNode,
                            data: {
                              ...selectedNode.data,
                              config: { ...selectedNode.data.config, fieldPath: e.target.value }
                            }
                          };
                          setSelectedNode(updatedNode);
                          setNodes((nds) =>
                            nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                          );
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Use dot notation for nested fields</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Variable
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="transformedData"
                      value={selectedNode.data.config?.outputVariable || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, outputVariable: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    />
                  </div>
                </>
              )}

              {selectedNode.data.type === 'EXTERNAL_API' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.config?.service || 'SLACK'}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, service: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    >
                      <option value="SLACK">Slack</option>
                      <option value="DISCORD">Discord</option>
                      <option value="TELEGRAM">Telegram</option>
                      <option value="MAILCHIMP">Mailchimp</option>
                    </select>
                  </div>
                  {selectedNode.data.config?.service === 'SLACK' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="https://hooks.slack.com/services/..."
                          value={selectedNode.data.config?.webhookUrl || ''}
                          onChange={(e) => {
                            const updatedNode = {
                              ...selectedNode,
                              data: {
                                ...selectedNode.data,
                                config: { ...selectedNode.data.config, webhookUrl: e.target.value }
                              }
                            };
                            setSelectedNode(updatedNode);
                            setNodes((nds) =>
                              nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                            );
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border rounded-lg"
                          rows={4}
                          placeholder="Hello {'{'}{'{'} user.name {'}'}{'}'"
                          value={selectedNode.data.config?.message || ''}
                          onChange={(e) => {
                            const updatedNode = {
                              ...selectedNode,
                              data: {
                                ...selectedNode.data,
                                config: { ...selectedNode.data.config, message: e.target.value }
                              }
                            };
                            setSelectedNode(updatedNode);
                            setNodes((nds) =>
                              nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                            );
                          }}
                        />
                      </div>
                    </>
                  )}
                  {selectedNode.data.config?.service === 'DISCORD' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="https://discord.com/api/webhooks/..."
                          value={selectedNode.data.config?.webhookUrl || ''}
                          onChange={(e) => {
                            const updatedNode = {
                              ...selectedNode,
                              data: {
                                ...selectedNode.data,
                                config: { ...selectedNode.data.config, webhookUrl: e.target.value }
                              }
                            };
                            setSelectedNode(updatedNode);
                            setNodes((nds) =>
                              nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                            );
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message Content
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border rounded-lg"
                          rows={4}
                          value={selectedNode.data.config?.content || ''}
                          onChange={(e) => {
                            const updatedNode = {
                              ...selectedNode,
                              data: {
                                ...selectedNode.data,
                                config: { ...selectedNode.data.config, content: e.target.value }
                              }
                            };
                            setSelectedNode(updatedNode);
                            setNodes((nds) =>
                              nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                            );
                          }}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {selectedNode.data.type === 'FILE_CREATE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.config?.fileType || 'JSON'}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, fileType: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    >
                      <option value="JSON">JSON</option>
                      <option value="CSV">CSV</option>
                      <option value="TXT">Plain Text</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filename
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="report.json"
                      value={selectedNode.data.config?.filename || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, filename: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Source
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedNode.data.config?.contentSource || 'VARIABLE'}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, contentSource: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    >
                      <option value="VARIABLE">From Variable</option>
                      <option value="CUSTOM">Custom Content</option>
                    </select>
                  </div>
                  {selectedNode.data.config?.contentSource === 'VARIABLE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variable Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="data"
                        value={selectedNode.data.config?.variable || ''}
                        onChange={(e) => {
                          const updatedNode = {
                            ...selectedNode,
                            data: {
                              ...selectedNode.data,
                              config: { ...selectedNode.data.config, variable: e.target.value }
                            }
                          };
                          setSelectedNode(updatedNode);
                          setNodes((nds) =>
                            nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                          );
                        }}
                      />
                    </div>
                  )}
                  {selectedNode.data.config?.contentSource === 'CUSTOM' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                        rows={6}
                        value={selectedNode.data.config?.content || ''}
                        onChange={(e) => {
                          const updatedNode = {
                            ...selectedNode,
                            data: {
                              ...selectedNode.data,
                              config: { ...selectedNode.data.config, content: e.target.value }
                            }
                          };
                          setSelectedNode(updatedNode);
                          setNodes((nds) =>
                            nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                          );
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store URL In
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="fileUrl"
                      value={selectedNode.data.config?.outputVariable || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            config: { ...selectedNode.data.config, outputVariable: e.target.value }
                          }
                        };
                        setSelectedNode(updatedNode);
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? updatedNode : n))
                        );
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
