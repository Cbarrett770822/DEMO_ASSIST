// Process data for the WMS Demo Assist
// This file contains information about warehouse processes, their benefits, metrics, and tutorial content

const processData = [
  {
    id: 'receiving',
    category: 'inbound',
    title: 'Receiving',
    description: 'The process of accepting deliveries from suppliers, verifying quantities and quality.',
    icon: 'inventory',
    benefits: [
      'Reduce receiving errors by up to 80%',
      'Cut receiving time by up to 60%',
      'Improve supplier compliance tracking',
      'Enable real-time inventory visibility',
      'Reduce labor costs through efficient scheduling'
    ],
    metrics: [
      { name: 'Receiving Accuracy', description: 'Percentage of items received correctly', target: '99.5%' },
      { name: 'Receiving Time', description: 'Average time to process a receipt', target: '<30 minutes' },
      { name: 'Dock-to-Stock Time', description: 'Time from receipt to available inventory', target: '<2 hours' },
      { name: 'Receipt Processing Cost', description: 'Labor cost per receipt', target: '<$X.XX per line' }
    ],
    steps: [
      { 
        title: 'Appointment Scheduling', 
        description: 'Schedule delivery appointments through the WMS to optimize dock utilization and labor planning.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Arrival and Check-in', 
        description: 'Register the arrival of the delivery and assign it to a dock door using the WMS.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Unloading and Scanning', 
        description: 'Unload items while scanning barcodes to automatically verify against purchase orders.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Quality Inspection', 
        description: 'Perform and record quality checks directly in the WMS.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Exception Handling', 
        description: 'Process discrepancies and exceptions with guided workflows.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Receipt Confirmation', 
        description: 'Confirm receipt completion, triggering inventory updates and putaway tasks.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    beforeAfterComparison: {
      before: [
        'Manual paper-based receiving',
        'Visual quantity verification',
        'Manual data entry into system',
        'Delayed inventory visibility',
        'Reactive labor allocation'
      ],
      after: [
        'Barcode/RFID scanning verification',
        'Automated quantity validation',
        'Real-time system updates',
        'Immediate inventory visibility',
        'Proactive labor planning'
      ]
    }
  },
  {
    id: 'putaway',
    category: 'inbound',
    title: 'Putaway',
    description: 'The process of moving received items to their designated storage locations.',
    icon: 'local_shipping',
    benefits: [
      'Optimize storage space utilization',
      'Reduce travel time by up to 30%',
      'Minimize product damage',
      'Improve inventory accuracy',
      'Enable FIFO/FEFO inventory management'
    ],
    metrics: [
      { name: 'Putaway Accuracy', description: 'Percentage of items put away in correct location', target: '99.8%' },
      { name: 'Putaway Time', description: 'Average time to putaway an item', target: '<X minutes' },
      { name: 'Space Utilization', description: 'Percentage of available storage space used', target: '>85%' },
      { name: 'Putaway Cost', description: 'Labor cost per putaway', target: '<$X.XX per line' }
    ],
    steps: [
      { 
        title: 'Task Assignment', 
        description: 'WMS automatically assigns putaway tasks to operators based on priority and location.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Location Determination', 
        description: 'System suggests optimal storage locations based on item characteristics and warehouse rules.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Task Execution', 
        description: 'Operator follows WMS-directed putaway instructions on mobile device.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Location Verification', 
        description: 'Scan location barcode to verify correct putaway destination.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Confirmation', 
        description: 'Confirm putaway completion, updating inventory records in real-time.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    videoUrl: 'placeholder-putaway.mp4',
    beforeAfterComparison: {
      before: [
        'Manual location decisions',
        'Paper-based location records',
        'Inefficient travel paths',
        'Limited inventory visibility',
        'Inconsistent storage practices'
      ],
      after: [
        'System-optimized location selection',
        'Digital location tracking',
        'Optimized travel paths',
        'Real-time inventory visibility',
        'Standardized storage practices'
      ]
    }
  },
  {
    id: 'inventory-management',
    category: 'storage',
    title: 'Inventory Management',
    description: 'The process of tracking stock levels, locations, and movements within the warehouse.',
    icon: 'inventory_2',
    benefits: [
      'Increase inventory accuracy to >99%',
      'Reduce stockouts by up to 80%',
      'Decrease excess inventory by up to 30%',
      'Improve traceability for recalls and audits',
      'Enable data-driven inventory decisions'
    ],
    metrics: [
      { name: 'Inventory Accuracy', description: 'Percentage match between system and physical count', target: '>99%' },
      { name: 'Stockout Rate', description: 'Percentage of SKUs with zero inventory', target: '<1%' },
      { name: 'Inventory Turnover', description: 'Number of times inventory is sold/used in a period', target: '>X times' },
      { name: 'Days of Supply', description: 'Average days of inventory on hand', target: 'X-Y days' }
    ],
    steps: [
      { 
        title: 'Cycle Counting', 
        description: 'Perform regular partial inventory counts using WMS-generated count tasks.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Inventory Adjustments', 
        description: 'Process inventory adjustments with approval workflows and audit trails.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Location Transfers', 
        description: 'Move inventory between locations with barcode verification.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Lot/Serial Tracking', 
        description: 'Track and trace lot and serial numbers throughout the warehouse.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Expiration Management', 
        description: 'Monitor and manage inventory expiration dates to minimize waste.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    videoUrl: 'placeholder-inventory.mp4',
    beforeAfterComparison: {
      before: [
        'Annual physical inventory counts',
        'Manual inventory record keeping',
        'Limited visibility into stock levels',
        'Reactive inventory management',
        'High safety stock levels'
      ],
      after: [
        'Perpetual inventory with cycle counting',
        'Real-time digital inventory records',
        'Complete visibility into stock levels',
        'Proactive inventory management',
        'Optimized safety stock levels'
      ]
    }
  },
  {
    id: 'picking',
    category: 'outbound',
    title: 'Order Picking',
    description: 'The process of retrieving items from storage to fulfill customer orders.',
    icon: 'shopping_cart',
    benefits: [
      'Increase picking accuracy to >99.9%',
      'Improve picking productivity by up to 50%',
      'Reduce travel time by up to 40%',
      'Decrease labor costs',
      'Improve order fulfillment speed'
    ],
    metrics: [
      { name: 'Picking Accuracy', description: 'Percentage of items picked correctly', target: '>99.9%' },
      { name: 'Picking Productivity', description: 'Lines picked per labor hour', target: '>X lines/hour' },
      { name: 'Pick Cycle Time', description: 'Average time to complete a pick', target: '<X minutes' },
      { name: 'Pick Cost', description: 'Labor cost per pick', target: '<$X.XX per line' }
    ],
    steps: [
      { 
        title: 'Order Release', 
        description: 'Release orders for picking based on priorities, waves, or batches.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Pick Strategy Selection', 
        description: 'WMS determines optimal picking strategy (discrete, batch, zone, wave).',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Task Assignment', 
        description: 'Assign picking tasks to operators based on location and workload.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Pick Execution', 
        description: 'Follow WMS-directed picking instructions with barcode verification.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Exception Handling', 
        description: 'Process picking exceptions with guided workflows.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Completion Confirmation', 
        description: 'Confirm pick completion and delivery to next process area.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    videoUrl: 'placeholder-picking.mp4',
    beforeAfterComparison: {
      before: [
        'Paper pick lists',
        'Sequential single-order picking',
        'Manual pick verification',
        'Inefficient travel paths',
        'Limited picking metrics'
      ],
      after: [
        'Digital pick instructions',
        'Optimized multi-order picking',
        'Barcode/RFID verification',
        'Optimized travel paths',
        'Comprehensive picking metrics'
      ]
    }
  },
  {
    id: 'packing',
    category: 'outbound',
    title: 'Packing',
    description: 'The process of preparing picked items for shipment with appropriate packaging.',
    icon: 'inventory',
    benefits: [
      'Reduce packing errors by up to 90%',
      'Decrease packaging material costs by up to 20%',
      'Improve packing productivity',
      'Ensure proper package protection',
      'Enhance customer experience'
    ],
    metrics: [
      { name: 'Packing Accuracy', description: 'Percentage of orders packed correctly', target: '>99.9%' },
      { name: 'Packing Productivity', description: 'Orders packed per labor hour', target: '>X orders/hour' },
      { name: 'Packing Material Cost', description: 'Average packaging cost per order', target: '<$X.XX per order' },
      { name: 'Damage Rate', description: 'Percentage of shipments damaged in transit', target: '<0.5%' }
    ],
    steps: [
      { 
        title: 'Order Verification', 
        description: 'Verify all items for the order are present before packing.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Package Selection', 
        description: 'WMS suggests optimal packaging based on item characteristics.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Item Scanning', 
        description: 'Scan each item as it is placed in the package for verification.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Documentation Inclusion', 
        description: 'Include packing slips, invoices, and other required documentation.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Package Sealing', 
        description: 'Seal the package and apply shipping label.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Completion Confirmation', 
        description: 'Confirm packing completion, updating order status in real-time.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    videoUrl: 'placeholder-packing.mp4',
    beforeAfterComparison: {
      before: [
        'Manual package selection',
        'Visual order verification',
        'Paper-based packing lists',
        'Manual shipping label creation',
        'Limited packing metrics'
      ],
      after: [
        'System-suggested packaging',
        'Barcode verification',
        'Digital packing instructions',
        'Automated shipping label generation',
        'Comprehensive packing metrics'
      ]
    }
  },
  {
    id: 'shipping',
    category: 'outbound',
    title: 'Shipping',
    description: 'The process of preparing and dispatching packed orders to customers.',
    icon: 'local_shipping',
    benefits: [
      'Reduce shipping errors by up to 95%',
      'Decrease shipping costs by up to 15%',
      'Improve carrier compliance',
      'Enhance delivery performance',
      'Provide real-time shipment tracking'
    ],
    metrics: [
      { name: 'Shipping Accuracy', description: 'Percentage of orders shipped correctly', target: '>99.9%' },
      { name: 'On-Time Shipping', description: 'Percentage of orders shipped on time', target: '>99%' },
      { name: 'Shipping Cost', description: 'Average shipping cost per order', target: '<$X.XX per order' },
      { name: 'Dock-to-Stock Time', description: 'Time from order completion to carrier pickup', target: '<X hours' }
    ],
    steps: [
      { 
        title: 'Carrier Selection', 
        description: 'WMS suggests optimal carrier and service level based on requirements.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Load Planning', 
        description: 'Plan and organize shipments for efficient loading and transportation.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Staging', 
        description: 'Move packed orders to the appropriate staging area for shipment.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Manifest Creation', 
        description: 'Generate shipping manifests and required documentation.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Loading', 
        description: 'Load shipments onto carrier vehicles with verification.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Shipment Confirmation', 
        description: 'Confirm shipment completion, updating order status and initiating tracking.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    videoUrl: 'placeholder-shipping.mp4',
    beforeAfterComparison: {
      before: [
        'Manual carrier selection',
        'Paper-based shipping documents',
        'Manual load planning',
        'Limited shipment visibility',
        'Manual tracking updates'
      ],
      after: [
        'Automated carrier selection',
        'Digital shipping documentation',
        'Optimized load planning',
        'Real-time shipment visibility',
        'Automated tracking updates'
      ]
    }
  },
  {
    id: 'returns',
    category: 'advanced',
    title: 'Returns Processing',
    description: 'The process of receiving, inspecting, and processing customer returns.',
    icon: 'assignment_return',
    benefits: [
      'Accelerate returns processing by up to 70%',
      'Improve return authorization accuracy',
      'Enhance customer satisfaction',
      'Increase recovery value from returns',
      'Provide better visibility into return reasons'
    ],
    metrics: [
      { name: 'Returns Processing Time', description: 'Average time to process a return', target: '<X hours' },
      { name: 'Return Disposition Accuracy', description: 'Percentage of returns dispositioned correctly', target: '>98%' },
      { name: 'Recovery Rate', description: 'Percentage of value recovered from returns', target: '>X%' },
      { name: 'Return Rate', description: 'Percentage of orders returned', target: '<X%' }
    ],
    steps: [
      { 
        title: 'Return Authorization', 
        description: 'Process return authorization requests through the WMS.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Receipt and Identification', 
        description: 'Receive and identify returned items using barcode scanning.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Inspection and Grading', 
        description: 'Inspect and grade returned items according to condition.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Disposition Decision', 
        description: 'Determine appropriate disposition (restock, refurbish, discard, etc.).',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Processing', 
        description: 'Process the return according to its disposition.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Customer Credit/Refund', 
        description: 'Process customer credit or refund based on return outcome.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    videoUrl: 'placeholder-returns.mp4',
    beforeAfterComparison: {
      before: [
        'Manual return authorization',
        'Paper-based return processing',
        'Visual inspection and grading',
        'Manual disposition decisions',
        'Limited returns analytics'
      ],
      after: [
        'Automated return authorization',
        'Digital return processing',
        'Standardized inspection protocols',
        'Rule-based disposition decisions',
        'Comprehensive returns analytics'
      ]
    }
  }
];

export default processData;
