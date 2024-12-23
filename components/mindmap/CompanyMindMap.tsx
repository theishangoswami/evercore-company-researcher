import React, { useCallback } from 'react';
import Tree from 'react-d3-tree';
import { motion } from 'framer-motion';

interface MindMapNode {
  title: string;
  description?: string;
  children?: MindMapNode[];
}

interface CompanyMapData {
  companyName: string;
  rootNode: {
    title: string;
    children: MindMapNode[];
  };
}

interface CompanyMindMapProps {
  data: CompanyMapData;
}

interface TreeNode {
  name: string;
  description?: string;
  children: TreeNode[];
}

const CustomNode = ({ nodeDatum }: any) => (
  <foreignObject width={280} height={100} x={-140} y={-50}>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--secondary-faint)] p-4 rounded-xl border border-[var(--secondary-darkest)] 
                 hover:shadow-md hover:border-[var(--secondary-accent)] transition-all duration-300 
                 backdrop-blur-sm"
    >
      <div className="font-semibold text-sm text-gray-800 mb-1.5 line-clamp-1">
        {nodeDatum.name}
      </div>
      {nodeDatum.description && (
        <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {nodeDatum.description}
        </div>
      )}
    </motion.div>
  </foreignObject>
);

const CompanyMindMap: React.FC<CompanyMindMapProps> = ({ data }) => {
  const transformData = (node: MindMapNode): TreeNode => {
    return {
      name: node.title,
      description: node.description,
      children: node.children ? node.children.map(transformData) : [],
    };
  };

  const treeData: TreeNode = {
    name: data.companyName,
    description: data.rootNode.title,
    children: data.rootNode.children.map(transformData),
  };

  const handleNodeClick = useCallback((nodeData: any) => {
    // Add click animation or interaction logic here if needed
  }, []);

  return (
    <div className="w-full h-[700px] bg-[var(--white)] rounded-md shadow-inner relative 
                    border border-[var(--secondary-darker)]">
      <Tree
        data={treeData}
        orientation="horizontal"
        nodeSize={{ x: 600, y: 60 }}
        separation={{ siblings: 1.7, nonSiblings: 2.2 }}
        translate={{ x: 150, y: 350 }}
        renderCustomNodeElement={CustomNode}
        pathClassFunc={() => 'stroke-[var(--secondary-accent)] stroke-[1.5px] transition-all duration-300'}
        zoom={0.5}
        onNodeClick={handleNodeClick}
        enableLegacyTransitions={true}
        transitionDuration={800}
      />
    </div>
  );
};

export default CompanyMindMap; 