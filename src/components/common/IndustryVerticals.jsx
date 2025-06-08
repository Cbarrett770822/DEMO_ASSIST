import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import FactoryIcon from '@mui/icons-material/Factory';
import RestaurantIcon from '@mui/icons-material/Restaurant';

// Industry vertical data
const industryData = [
  {
    id: 'retail',
    name: 'Retail',
    icon: <StorefrontIcon />,
    color: '#1976d2',
    challenges: [
      'High inventory turnover demands rapid replenishment and accurate stock control',
      'Seasonal peaks and promotional events causing fluctuating inventory levels and labor inefficiencies',
      'Omnichannel fulfillment complexities requiring precision in order accuracy, stock visibility, and order turnaround times',
      'Complex handling requirements for expiry, shelf-life-sensitive products (fresh goods), and serialized high-value items',
      'Increased return rates requiring precise returns management and quick reintegration of goods'
    ],
    warehouseImpact: [
      { challenge: 'High inventory turnover', impact: 'Increased frequency of replenishment, causing congestion and stock inaccuracies' },
      { challenge: 'Seasonal demand fluctuations', impact: 'Poor labor allocation, increased overtime, inefficient use of space' },
      { challenge: 'Omnichannel complexity', impact: 'Picking inefficiencies, delayed shipments, and misallocated inventory' },
      { challenge: 'Expiry/shelf-life management', impact: 'Stock wastage, lost sales, compliance risks' },
      { challenge: 'Returns handling', impact: 'Labor-intensive processing, slow returns-to-stock cycle' }
    ],
    wmsSolutions: [
      {
        title: 'Real-Time Inventory Visibility',
        description: 'Ensures accurate stock status to quickly manage replenishments, reducing downtime and inventory discrepancies.'
      },
      {
        title: 'Advanced Slotting & Task Management',
        description: 'Dynamically adjusts pick locations and prioritizes replenishments to support high turnover items and reduce picking errors.'
      },
      {
        title: 'Labor Planning & Workforce Optimization',
        description: 'Aligns labor with real-time demands, improving workforce efficiency and eliminating unnecessary overtime during peak seasons.'
      },
      {
        title: 'Omnichannel Fulfillment Management',
        description: 'Unified inventory view enabling optimized picking and shipping across channels, improving customer service and reducing errors.'
      },
      {
        title: 'Robust Lot, Batch, and Expiry Control',
        description: 'Automates FIFO/FEFO inventory rotation, ensuring freshness compliance, minimizing waste, and protecting profitability.'
      },
      {
        title: 'Efficient Returns Management Module',
        description: 'Streamlines return processing, rapidly returning products to sellable inventory, significantly cutting processing costs and cycle times.'
      }
    ],
    outcomes: [
      '20-30% reduction in labor costs from optimized task assignment and improved pick accuracy',
      'Up to 25% improvement in warehouse throughput during seasonal peaks',
      '30-50% reduction in expired stock losses through improved inventory management practices',
      'Significant increase in customer satisfaction through precise and timely order fulfillment'
    ],
    elevatorPitch: 'Retail businesses today face unprecedented complexity—rapid inventory turns, seasonal spikes, omnichannel demands, and high product sensitivity. These challenges directly translate into warehouse inefficiencies, higher operational costs, and customer dissatisfaction. Infor WMS addresses these retail-specific challenges head-on through advanced inventory visibility, dynamic workforce management, intelligent slotting, robust expiry management, and efficient returns processing. Retailers leveraging Infor WMS typically experience dramatic improvements—up to 30% reduced labor costs, significantly reduced spoilage, and measurable enhancements in customer satisfaction.'
  },
  {
    id: 'distribution',
    name: 'Distribution',
    icon: <LocalShippingIcon />,
    color: '#2e7d32',
    challenges: [
      'Complex multi-channel distribution requirements with varying service level agreements',
      'High-volume order processing with tight delivery windows',
      'Inventory accuracy challenges across multiple locations and transit points',
      'Increasing transportation costs and delivery constraints',
      'Cross-docking and flow-through requirements for efficient handling'
    ],
    warehouseImpact: [
      { challenge: 'Multi-channel distribution', impact: 'Inefficient order allocation and conflicting priorities' },
      { challenge: 'High-volume order processing', impact: 'Bottlenecks, missed deadlines, and increased error rates' },
      { challenge: 'Inventory accuracy', impact: 'Stock discrepancies leading to service failures and excess inventory' },
      { challenge: 'Transportation management', impact: 'Suboptimal load planning and increased shipping costs' },
      { challenge: 'Cross-docking operations', impact: 'Delayed processing and missed consolidation opportunities' }
    ],
    wmsSolutions: [
      {
        title: 'Advanced Order Orchestration',
        description: 'Intelligently prioritizes and allocates orders based on service levels, optimizing fulfillment across channels.'
      },
      {
        title: 'Wave Planning & Batch Processing',
        description: 'Groups orders for efficient picking and shipping, dramatically increasing throughput during peak periods.'
      },
      {
        title: 'Cross-Docking Automation',
        description: 'Streamlines flow-through operations, reducing handling and accelerating inventory movement.'
      },
      {
        title: 'Integrated Transportation Management',
        description: 'Optimizes load planning, carrier selection, and shipping documentation to reduce costs and improve delivery performance.'
      },
      {
        title: 'Business Intelligence & Analytics',
        description: 'Provides real-time visibility into operations, enabling data-driven decisions and continuous improvement.'
      }
    ],
    outcomes: [
      '15-25% increase in order fulfillment capacity without additional resources',
      'Up to 30% reduction in transportation costs through optimized load planning',
      '99.5%+ inventory accuracy across distribution network',
      '20-40% reduction in order cycle times through streamlined processes'
    ],
    elevatorPitch: 'Distribution operations face mounting pressure from all sides—complex multi-channel requirements, tightening delivery windows, rising transportation costs, and demands for perfect order fulfillment. These challenges create significant operational strain, eroding margins and customer satisfaction. Infor WMS transforms distribution operations through intelligent order orchestration, optimized wave planning, automated cross-docking, integrated transportation management, and powerful analytics. Distributors implementing Infor WMS typically achieve remarkable results—up to 25% increased fulfillment capacity, 30% lower transportation costs, near-perfect inventory accuracy, and dramatically faster order cycle times.'
  },
  {
    id: 'fmcg',
    name: 'FMCG',
    icon: <ShoppingBasketIcon />,
    color: '#ed6c02',
    challenges: [
      'Short product lifecycles and strict first-expired-first-out (FEFO) requirements',
      'High SKU proliferation with frequent new product introductions',
      'Promotional activity creating demand volatility and inventory management challenges',
      'Stringent compliance and traceability requirements',
      'Pressure to reduce time-to-market while maintaining quality control'
    ],
    warehouseImpact: [
      { challenge: 'Short product lifecycles', impact: 'Increased risk of obsolescence and write-offs' },
      { challenge: 'SKU proliferation', impact: 'Storage complexity and picking inefficiencies' },
      { challenge: 'Demand volatility', impact: 'Inventory imbalances and service level disruptions' },
      { challenge: 'Compliance requirements', impact: 'Manual documentation and audit preparation burden' },
      { challenge: 'Time-to-market pressure', impact: 'Rushed quality control processes and potential errors' }
    ],
    wmsSolutions: [
      {
        title: 'Advanced Lot Control & Traceability',
        description: 'Ensures complete product history from receipt to shipment, supporting recalls and regulatory compliance.'
      },
      {
        title: 'Expiration Date Management',
        description: 'Automates FEFO picking and provides alerts for at-risk inventory to minimize waste.'
      },
      {
        title: 'Dynamic Slotting Optimization',
        description: 'Continuously adjusts product locations based on velocity, improving picking efficiency for fast-moving items.'
      },
      {
        title: 'Quality Control & Sampling',
        description: 'Integrates quality processes into warehouse workflows, ensuring consistent product quality.'
      },
      {
        title: 'Promotional Planning Support',
        description: 'Provides tools to manage promotional inventory separately, ensuring availability without disrupting regular operations.'
      }
    ],
    outcomes: [
      '50-70% reduction in product obsolescence and waste',
      '15-25% improvement in picking productivity through optimized slotting',
      '99.8%+ traceability compliance with minimal manual effort',
      'Up to 35% faster new product introduction and promotional execution'
    ],
    elevatorPitch: 'FMCG companies operate in an environment of constant change—short product lifecycles, expanding SKU portfolios, promotional volatility, and stringent compliance requirements. These factors create significant warehouse challenges, including obsolescence risk, picking inefficiencies, and documentation burdens. Infor WMS addresses these FMCG-specific challenges through advanced lot control, expiration date management, dynamic slotting, integrated quality processes, and promotional planning support. FMCG manufacturers implementing Infor WMS achieve transformative results—up to 70% less waste, 25% higher picking productivity, near-perfect traceability, and dramatically faster promotional execution.'
  },
  {
    id: 'automotive',
    name: 'Automotive',
    icon: <DirectionsCarIcon />,
    color: '#d32f2f',
    challenges: [
      'Just-in-time and just-in-sequence delivery requirements with minimal margin for error',
      'Complex kitting and assembly operations requiring precise coordination',
      'Extensive parts catalog with varying storage and handling requirements',
      'Strict quality control and compliance documentation',
      'Aftermarket support alongside production operations'
    ],
    warehouseImpact: [
      { challenge: 'JIT/JIS requirements', impact: 'Production line disruptions from delivery errors or delays' },
      { challenge: 'Kitting complexity', impact: 'Labor-intensive preparation and quality verification' },
      { challenge: 'Parts catalog management', impact: 'Storage inefficiencies and picking errors' },
      { challenge: 'Quality documentation', impact: 'Manual processes creating compliance risks' },
      { challenge: 'Dual-purpose operations', impact: 'Conflicting priorities between production and aftermarket support' }
    ],
    wmsSolutions: [
      {
        title: 'Sequencing & Line-Side Delivery',
        description: 'Ensures parts arrive at production lines in precise order and timing to support JIT/JIS operations.'
      },
      {
        title: 'Advanced Kitting & Assembly',
        description: 'Streamlines the creation of kits with verification steps to ensure accuracy and completeness.'
      },
      {
        title: 'Serial Number Tracking',
        description: 'Maintains complete traceability of serialized parts throughout the supply chain.'
      },
      {
        title: 'Quality Integration',
        description: 'Embeds quality checks within warehouse processes, ensuring only conforming parts reach production.'
      },
      {
        title: 'Dual-Mode Operations',
        description: 'Supports both production and aftermarket operations with appropriate prioritization and resource allocation.'
      }
    ],
    outcomes: [
      '99.9%+ on-time, in-sequence delivery to production lines',
      '30-50% reduction in kitting labor through process automation',
      'Complete part traceability from receipt through production',
      '20-35% improvement in aftermarket parts fulfillment speed'
    ],
    elevatorPitch: 'Automotive supply chains operate with razor-thin margins for error—requiring just-in-time delivery, complex kitting operations, extensive parts management, and stringent quality control. These demands create significant warehouse challenges that can directly impact production efficiency and aftermarket service. Infor WMS transforms automotive operations through precise sequencing capabilities, advanced kitting automation, serial tracking, integrated quality processes, and support for dual-mode operations. Automotive companies implementing Infor WMS achieve exceptional results—near-perfect delivery performance, up to 50% less kitting labor, complete part traceability, and significantly faster aftermarket fulfillment.'
  },
  {
    id: 'pharmaceutical',
    name: 'Pharmaceutical',
    icon: <MedicalServicesIcon />,
    color: '#9c27b0',
    challenges: [
      'Stringent regulatory compliance (FDA, GMP, GDP) with complete audit trail requirements',
      'Serialization and track-and-trace mandates for product authentication',
      'Temperature-controlled storage and handling requirements',
      'Strict lot control and recall management capabilities',
      'Expiration date management with high-value inventory'
    ],
    warehouseImpact: [
      { challenge: 'Regulatory compliance', impact: 'Extensive documentation and validation overhead' },
      { challenge: 'Serialization requirements', impact: 'Complex verification processes and data management' },
      { challenge: 'Temperature control', impact: 'Specialized storage and monitoring needs' },
      { challenge: 'Lot control', impact: 'Detailed tracking and potential for quarantine disruptions' },
      { challenge: 'Expiration management', impact: 'Risk of high-value product waste' }
    ],
    wmsSolutions: [
      {
        title: 'Validated System Environment',
        description: 'Provides a fully validated solution meeting FDA and other regulatory requirements with complete audit trails.'
      },
      {
        title: 'Serialization & Authentication',
        description: 'Supports full serialization with verification at every touch point to prevent counterfeiting.'
      },
      {
        title: 'Cold Chain Management',
        description: 'Monitors and documents temperature conditions throughout storage and handling processes.'
      },
      {
        title: 'Comprehensive Lot Control',
        description: 'Enables precise tracking and rapid response for recalls or quality issues.'
      },
      {
        title: 'Expiration Management',
        description: 'Automates FEFO processes and provides alerts for inventory approaching expiration.'
      }
    ],
    outcomes: [
      '100% regulatory compliance with significantly reduced documentation effort',
      'Complete product traceability from manufacturer to patient',
      '60-80% faster recall execution with pinpoint accuracy',
      '40-60% reduction in expired product write-offs'
    ],
    elevatorPitch: 'Pharmaceutical operations face unparalleled regulatory scrutiny—requiring validated systems, serialization capabilities, temperature monitoring, precise lot control, and expiration management. These requirements create significant operational complexity and compliance risk. Infor WMS delivers a purpose-built solution for pharmaceutical environments with validated processes, comprehensive serialization support, cold chain management, advanced lot control, and expiration monitoring. Pharmaceutical companies implementing Infor WMS achieve critical outcomes—100% regulatory compliance, complete product traceability, dramatically faster recall execution, and significant reduction in high-value product waste.'
  },
  {
    id: '3pl',
    name: '3PL',
    icon: <WarehouseIcon />,
    color: '#0288d1',
    challenges: [
      'Multi-client operations with varying requirements and service level agreements',
      'Complex billing and cost allocation across clients and activities',
      'Visibility and reporting needs for both 3PL and end clients',
      'Rapid onboarding of new clients and products',
      'Value-added service management alongside core warehousing'
    ],
    warehouseImpact: [
      { challenge: 'Multi-client operations', impact: 'Process inconsistencies and resource allocation challenges' },
      { challenge: 'Billing complexity', impact: 'Revenue leakage and billing disputes' },
      { challenge: 'Visibility requirements', impact: 'Manual reporting and communication overhead' },
      { challenge: 'Client onboarding', impact: 'Extended implementation timelines and delayed revenue' },
      { challenge: 'Value-added services', impact: 'Inefficient workflow transitions and tracking' }
    ],
    wmsSolutions: [
      {
        title: 'Multi-Client Architecture',
        description: 'Supports multiple clients with distinct processes, rules, and configurations within a single instance.'
      },
      {
        title: 'Activity-Based Billing',
        description: 'Captures all billable activities with client-specific rates for accurate invoicing.'
      },
      {
        title: 'Client Portal & Reporting',
        description: 'Provides real-time visibility and self-service capabilities for both 3PL operators and end clients.'
      },
      {
        title: 'Rapid Implementation Framework',
        description: 'Enables quick onboarding of new clients with templated processes and configurations.'
      },
      {
        title: 'Value-Added Service Management',
        description: 'Integrates special services like kitting, labeling, and quality inspection into standard workflows.'
      }
    ],
    outcomes: [
      '15-25% increase in billable revenue through accurate activity capture',
      '50-70% faster client onboarding through templated implementation',
      '30-40% reduction in client service inquiries through self-service portal',
      '20-35% improvement in labor utilization across multiple clients'
    ],
    elevatorPitch: '3PL providers face unique operational challenges—managing multiple clients with varying requirements, complex billing needs, demanding visibility expectations, continuous onboarding pressure, and diverse value-added services. These challenges can impact profitability, scalability, and client satisfaction. Infor WMS delivers purpose-built 3PL capabilities including multi-client architecture, activity-based billing, client portals, rapid implementation tools, and value-added service management. 3PLs implementing Infor WMS achieve transformative results—up to 25% more billable revenue, 70% faster client onboarding, dramatic reduction in service inquiries, and significantly improved labor utilization across operations.'
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: <FactoryIcon />,
    color: '#424242',
    challenges: [
      'Raw material management with quality inspection requirements',
      'Work-in-process inventory tracking and control',
      'Production line replenishment with minimal disruption',
      'Finished goods management with lot and serial tracking',
      'Integration with production planning and MES systems'
    ],
    warehouseImpact: [
      { challenge: 'Raw material management', impact: 'Production delays from material shortages or quality issues' },
      { challenge: 'WIP inventory', impact: 'Excess buffer stock and poor visibility of in-process items' },
      { challenge: 'Production replenishment', impact: 'Line stoppages and inefficient material movement' },
      { challenge: 'Finished goods control', impact: 'Shipping errors and traceability gaps' },
      { challenge: 'System integration', impact: 'Manual data entry and synchronization issues' }
    ],
    wmsSolutions: [
      {
        title: 'Integrated Quality Management',
        description: 'Embeds inspection processes into receiving workflows to prevent quality issues from reaching production.'
      },
      {
        title: 'WIP Management',
        description: 'Tracks work-in-process inventory throughout production stages with complete visibility.'
      },
      {
        title: 'Kanban & Line Replenishment',
        description: 'Automates production line supply with just-in-time delivery of materials.'
      },
      {
        title: 'Finished Goods Traceability',
        description: 'Maintains complete lot and serial tracking from raw materials through finished product.'
      },
      {
        title: 'ERP & MES Integration',
        description: 'Provides seamless connectivity with production planning and execution systems.'
      }
    ],
    outcomes: [
      '15-30% reduction in production disruptions from material issues',
      '20-40% decrease in WIP inventory levels through improved visibility',
      '99.8%+ production line fill rate with optimized replenishment',
      '50-70% faster response to quality issues with complete traceability'
    ],
    elevatorPitch: 'Manufacturing operations depend on precise material flow—from raw material receipt through production to finished goods shipping. Challenges in material quality, WIP visibility, line replenishment, product traceability, and system integration can significantly impact production efficiency and product quality. Infor WMS transforms manufacturing operations through integrated quality management, comprehensive WIP tracking, automated line replenishment, complete finished goods traceability, and seamless system integration. Manufacturers implementing Infor WMS achieve exceptional results—dramatically fewer production disruptions, significantly lower WIP inventory, near-perfect line fill rates, and much faster response to quality issues.'
  },
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    icon: <RestaurantIcon />,
    color: '#689f38',
    challenges: [
      'Strict food safety compliance and certification requirements',
      'Temperature-controlled storage and handling for multiple zones',
      'First-expired-first-out (FEFO) rotation with short shelf life products',
      'Catch weight management for variable-weight items',
      'Recall readiness with complete lot traceability'
    ],
    warehouseImpact: [
      { challenge: 'Food safety compliance', impact: 'Documentation burden and audit preparation overhead' },
      { challenge: 'Temperature control', impact: 'Product spoilage risk and monitoring requirements' },
      { challenge: 'FEFO management', impact: 'Expired product waste and rotation errors' },
      { challenge: 'Catch weight handling', impact: 'Inventory and billing discrepancies' },
      { challenge: 'Recall management', impact: 'Slow response and excessive scope of recalls' }
    ],
    wmsSolutions: [
      {
        title: 'Food Safety Compliance Tools',
        description: 'Supports FSMA, HACCP, and other food safety requirements with integrated documentation.'
      },
      {
        title: 'Cold Chain Management',
        description: 'Monitors and controls multiple temperature zones with alerting capabilities.'
      },
      {
        title: 'Advanced Expiration Control',
        description: 'Enforces FEFO picking with visibility into approaching expiration dates.'
      },
      {
        title: 'Catch Weight Support',
        description: 'Manages both standard and actual weights for variable items throughout all processes.'
      },
      {
        title: 'Lot Traceability & Recall Management',
        description: 'Provides complete tracking and rapid recall execution with precise scope.'
      }
    ],
    outcomes: [
      '50-75% reduction in food safety compliance effort',
      '60-80% decrease in product losses from spoilage or expiration',
      '99.9%+ inventory accuracy including catch weight items',
      '80-90% faster recall execution with minimal scope'
    ],
    elevatorPitch: 'Food and beverage operations face unique challenges—stringent safety requirements, temperature sensitivity, short shelf lives, variable weights, and recall readiness needs. These factors create significant operational complexity and risk. Infor WMS delivers purpose-built capabilities for food and beverage companies including comprehensive compliance tools, cold chain management, advanced expiration control, catch weight support, and precise lot traceability. Food and beverage companies implementing Infor WMS achieve transformative results—dramatically reduced compliance effort, significantly less product waste, exceptional inventory accuracy, and the ability to execute recalls with unprecedented speed and precision.'
  }
];

const IndustryVerticals = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const handleIndustryClick = (industry) => {
    setSelectedIndustry(industry);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Industry-Specific WMS Solutions
      </Typography>
      <Typography variant="body1" component="div" align="center" sx={{ mb: 4 }}>
        Select an industry vertical below to see how a Warehouse Management System addresses
        specific challenges and delivers measurable outcomes for each business type.
      </Typography>

      {/* Industry selection grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {industryData.map((industry) => (
          <Box key={industry.id} sx={{ flex: { xs: '0 0 calc(50% - 8px)', sm: '0 0 calc(33.333% - 11px)', md: '0 0 calc(25% - 12px)' }, minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 11px)', md: 'calc(25% - 12px)' } }}>
            <Paper
              elevation={selectedIndustry?.id === industry.id ? 6 : 1}
              sx={{
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderLeft: selectedIndustry?.id === industry.id ? `4px solid ${industry.color}` : 'none',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
              onClick={() => handleIndustryClick(industry)}
            >
              <Box sx={{ color: industry.color, fontSize: 40, mb: 1 }}>
                {industry.icon}
              </Box>
              <Typography variant="h6" component="h3">
                {industry.name}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      {/* Selected industry content */}
      {selectedIndustry && (
        <Box sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderTop: `4px solid ${selectedIndustry.color}` }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ color: selectedIndustry.color, display: 'flex', alignItems: 'center' }}>
              {selectedIndustry.icon}
              <Box component="span" sx={{ ml: 2 }}>{selectedIndustry.name} Industry</Box>
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Step 1: Industry Challenges */}
            <Typography variant="h5" gutterBottom>
              Step 1: {selectedIndustry.name} Business Challenges
            </Typography>
            <List>
              {selectedIndustry.challenges.map((challenge, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon sx={{ color: selectedIndustry.color }} />
                  </ListItemIcon>
                  <ListItemText primary={<Typography component="span">{challenge}</Typography>} />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Step 2: Warehouse Impact */}
            <Typography variant="h5" gutterBottom>
              Step 2: Warehouse Operational Impact
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{selectedIndustry.name} Business Challenge</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Warehouse Operational Impact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedIndustry.warehouseImpact.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.challenge}</TableCell>
                      <TableCell>{item.impact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Step 3: WMS Solutions */}
            <Typography variant="h5" gutterBottom>
              Step 3: How WMS Addresses These Challenges
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              {selectedIndustry.wmsSolutions.map((solution, index) => (
                <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' }, minWidth: { xs: '100%', md: 'calc(50% - 8px)' } }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      borderLeft: `3px solid ${selectedIndustry.color}`
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {solution.title}
                    </Typography>
                    <Typography variant="body2" component="div">
                      {solution.description}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Step 4: Outcomes and Proof Points */}
            <Typography variant="h5" gutterBottom>
              Step 4: Value and Outcomes
            </Typography>
            <Box sx={{ mb: 3 }}>
              {selectedIndustry.outcomes.map((outcome, index) => (
                <Chip 
                  key={index} 
                  label={outcome} 
                  sx={{ 
                    m: 0.5, 
                    bgcolor: `${selectedIndustry.color}20`, 
                    color: 'text.primary',
                    '& .MuiChip-label': { px: 2 }
                  }} 
                />
              ))}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Elevator Pitch */}
            <Typography variant="h5" gutterBottom>
              {selectedIndustry.name} WMS Value Summary
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                bgcolor: `${selectedIndustry.color}10`,
                borderLeft: `4px solid ${selectedIndustry.color}`
              }}
            >
              <Typography variant="body1" component="div" sx={{ fontStyle: 'italic' }}>
                "{selectedIndustry.elevatorPitch}"
              </Typography>
            </Paper>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default IndustryVerticals;
