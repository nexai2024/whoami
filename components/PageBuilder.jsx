import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiMove, FiEdit3, FiTrash2, FiSave, FiEye, FiImage, FiLink, FiShoppingBag, FiMail, FiMusic, FiVideo, FiCalendar } = FiIcons;

const PageBuilder = () => {
  const [blocks, setBlocks] = useState([
    { id: 1, type: 'link', title: 'Latest YouTube Video', url: 'https://youtube.com', icon: FiVideo },
    { id: 2, type: 'product', title: 'Digital Photography Course', price: '$49', icon: FiShoppingBag },
    { id: 3, type: 'email', title: 'Join My Newsletter', description: 'Get weekly tips', icon: FiMail }
  ]);

  const [selectedBlock, setSelectedBlock] = useState(null);

  const blockTypes = [
    { type: 'link', label: 'Link', icon: FiLink, color: 'blue' },
    { type: 'product', label: 'Product', icon: FiShoppingBag, color: 'green' },
    { type: 'email', label: 'Email Capture', icon: FiMail, color: 'purple' },
    { type: 'image', label: 'Image Gallery', icon: FiImage, color: 'pink' },
    { type: 'music', label: 'Music Player', icon: FiMusic, color: 'orange' },
    { type: 'video', label: 'Video Embed', icon: FiVideo, color: 'red' },
    { type: 'booking', label: 'Booking', icon: FiCalendar, color: 'indigo' }
  ];

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      title: `New ${type}`,
      ...(type === 'product' && { price: '$0' }),
      ...(type === 'email' && { description: 'Subscribe for updates' })
    };
    setBlocks([...blocks, newBlock]);
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSelectedBlock(null);
  };

  const BlockPreview = ({ block }) => {
    const getBlockIcon = (type) => {
      const iconMap = {
        link: FiLink,
        product: FiShoppingBag,
        email: FiMail,
        image: FiImage,
        music: FiMusic,
        video: FiVideo,
        booking: FiCalendar
      };
      return iconMap[type] || FiLink;
    };

    return (
      <motion.div
        className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${
          selectedBlock?.id === block.id ? 'border-indigo-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setSelectedBlock(block)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <SafeIcon icon={getBlockIcon(block.type)} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{block.title}</h3>
            {block.price && <p className="text-sm text-green-600 font-medium">{block.price}</p>}
            {block.description && <p className="text-sm text-gray-600">{block.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <SafeIcon icon={FiMove} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteBlock(block.id);
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <SafeIcon icon={FiTrash2} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <SafeIcon icon={FiEye} />
                Preview
              </button>
              <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                <SafeIcon icon={FiSave} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Block Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Blocks</h2>
              <div className="space-y-3">
                {blockTypes.map((blockType, index) => (
                  <button
                    key={index}
                    onClick={() => addBlock(blockType.type)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-${blockType.color}-300 hover:bg-${blockType.color}-50 transition-colors group`}
                  >
                    <SafeIcon icon={blockType.icon} className={`text-${blockType.color}-600`} />
                    <span className="text-gray-700 group-hover:text-gray-900">{blockType.label}</span>
                    <SafeIcon icon={FiPlus} className="ml-auto text-gray-400 group-hover:text-gray-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Page Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Page Preview</h2>
                <p className="text-gray-600">Drag and drop blocks to rearrange them</p>
              </div>
              
              {/* Profile Header */}
              <div className="text-center mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">SC</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sarah Creates</h3>
                <p className="text-gray-600">Content Creator & Digital Artist</p>
              </div>

              {/* Blocks */}
              <div className="space-y-4">
                {blocks.map((block) => (
                  <BlockPreview key={block.id} block={block} />
                ))}
                
                {blocks.length === 0 && (
                  <div className="text-center py-12">
                    <SafeIcon icon={FiPlus} className="text-gray-400 text-4xl mx-auto mb-4" />
                    <p className="text-gray-600">Add your first block to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Block Editor */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-8">
              {selectedBlock ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Block</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={selectedBlock.title}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => {
                          const updatedBlocks = blocks.map(block =>
                            block.id === selectedBlock.id ? { ...block, title: e.target.value } : block
                          );
                          setBlocks(updatedBlocks);
                          setSelectedBlock({ ...selectedBlock, title: e.target.value });
                        }}
                      />
                    </div>
                    
                    {selectedBlock.type === 'link' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    )}
                    
                    {selectedBlock.type === 'product' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                        <input
                          type="text"
                          value={selectedBlock.price}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          onChange={(e) => {
                            const updatedBlocks = blocks.map(block =>
                              block.id === selectedBlock.id ? { ...block, price: e.target.value } : block
                            );
                            setBlocks(updatedBlocks);
                            setSelectedBlock({ ...selectedBlock, price: e.target.value });
                          }}
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option>Default</option>
                        <option>Gradient</option>
                        <option>Outlined</option>
                        <option>Minimal</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiEdit3} className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">Select a block to edit its properties</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;