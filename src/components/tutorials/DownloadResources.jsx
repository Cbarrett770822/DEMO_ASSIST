import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import ChecklistIcon from '@mui/icons-material/Checklist';
import InsightsIcon from '@mui/icons-material/Insights';
import { selectSelectedProcess } from '../../features/processes/processesSlice';

// Resource data for each process
const resourceData = {
  receiving: [
    {
      title: "Receiving Process Implementation Guide",
      description: "A comprehensive guide to implementing WMS for the receiving process, including best practices and step-by-step instructions.",
      icon: "pdf",
      fileName: "receiving-implementation-guide.pdf"
    },
    {
      title: "Receiving KPI Tracking Template",
      description: "Excel template for tracking key performance indicators related to the receiving process.",
      icon: "excel",
      fileName: "receiving-kpi-template.xlsx"
    },
    {
      title: "Receiving Process Checklist",
      description: "A checklist to ensure all steps of the receiving process are properly implemented in your WMS.",
      icon: "checklist",
      fileName: "receiving-process-checklist.pdf"
    }
  ],
  putaway: [
    {
      title: "Putaway Process Implementation Guide",
      description: "A comprehensive guide to implementing WMS for the putaway process, including best practices and step-by-step instructions.",
      icon: "pdf",
      fileName: "putaway-implementation-guide.pdf"
    },
    {
      title: "Putaway KPI Tracking Template",
      description: "Excel template for tracking key performance indicators related to the putaway process.",
      icon: "excel",
      fileName: "putaway-kpi-template.xlsx"
    },
    {
      title: "Putaway Process Checklist",
      description: "A checklist to ensure all steps of the putaway process are properly implemented in your WMS.",
      icon: "checklist",
      fileName: "putaway-process-checklist.pdf"
    }
  ],
  "inventory-management": [
    {
      title: "Inventory Management Implementation Guide",
      description: "A comprehensive guide to implementing WMS for inventory management, including best practices and step-by-step instructions.",
      icon: "pdf",
      fileName: "inventory-implementation-guide.pdf"
    },
    {
      title: "Cycle Counting Procedure Template",
      description: "Detailed procedure template for implementing cycle counting in your warehouse.",
      icon: "document",
      fileName: "cycle-counting-procedure.docx"
    },
    {
      title: "Inventory Accuracy Dashboard",
      description: "Excel template for creating an inventory accuracy dashboard to monitor performance.",
      icon: "excel",
      fileName: "inventory-accuracy-dashboard.xlsx"
    }
  ],
  picking: [
    {
      title: "Picking Process Implementation Guide",
      description: "A comprehensive guide to implementing WMS for the picking process, including best practices and step-by-step instructions.",
      icon: "pdf",
      fileName: "picking-implementation-guide.pdf"
    },
    {
      title: "Picking Strategy Comparison Tool",
      description: "Excel tool to compare different picking strategies and determine the best fit for your operation.",
      icon: "excel",
      fileName: "picking-strategy-comparison.xlsx"
    },
    {
      title: "Picking Process Optimization Checklist",
      description: "A checklist to ensure your picking process is fully optimized in your WMS.",
      icon: "checklist",
      fileName: "picking-optimization-checklist.pdf"
    }
  ],
  packing: [
    {
      title: "Packing Process Implementation Guide",
      description: "A comprehensive guide to implementing WMS for the packing process, including best practices and step-by-step instructions.",
      icon: "pdf",
      fileName: "packing-implementation-guide.pdf"
    },
    {
      title: "Packaging Material Optimization Tool",
      description: "Excel tool to optimize packaging material usage and reduce costs.",
      icon: "excel",
      fileName: "packaging-optimization.xlsx"
    },
    {
      title: "Packing Station Design Guide",
      description: "Guide to designing efficient packing stations in your warehouse.",
      icon: "document",
      fileName: "packing-station-design.pdf"
    }
  ],
  shipping: [
    {
      title: "Shipping Process Implementation Guide",
      description: "A comprehensive guide to implementing WMS for the shipping process, including best practices and step-by-step instructions.",
      icon: "pdf",
      fileName: "shipping-implementation-guide.pdf"
    },
    {
      title: "Carrier Selection Optimization Tool",
      description: "Excel tool to optimize carrier selection based on cost, service level, and other factors.",
      icon: "excel",
      fileName: "carrier-selection-tool.xlsx"
    },
    {
      title: "Shipping Compliance Checklist",
      description: "A checklist to ensure your shipping process complies with all relevant regulations and requirements.",
      icon: "checklist",
      fileName: "shipping-compliance-checklist.pdf"
    }
  ],
  returns: [
    {
      title: "Returns Process Implementation Guide",
      description: "A comprehensive guide to implementing WMS for the returns process, including best practices and step-by-step instructions.",
      icon: "pdf",
      fileName: "returns-implementation-guide.pdf"
    },
    {
      title: "Returns Analysis Dashboard",
      description: "Excel dashboard to analyze returns data and identify improvement opportunities.",
      icon: "excel",
      fileName: "returns-analysis-dashboard.xlsx"
    },
    {
      title: "Returns Disposition Decision Tree",
      description: "A decision tree to help determine the appropriate disposition for returned items.",
      icon: "document",
      fileName: "returns-disposition-tree.pdf"
    }
  ]
};

// Icon mapping
const getIcon = (iconType) => {
  switch (iconType) {
    case 'pdf':
      return <PictureAsPdfIcon color="error" />;
    case 'excel':
      return <InsightsIcon color="success" />;
    case 'document':
      return <ArticleIcon color="primary" />;
    case 'checklist':
      return <ChecklistIcon color="warning" />;
    default:
      return <DownloadIcon />;
  }
};

const DownloadResources = () => {
  const process = useSelector(selectSelectedProcess);

  if (!process) {
    return null;
  }

  const processResources = resourceData[process.id] || [];
  
  if (processResources.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Implementation Resources
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="body1">
            No implementation resources available for this process yet. Check back later!
          </Typography>
        </Paper>
      </Box>
    );
  }

  const handleDownload = (fileName) => {
    // In a real application, this would trigger a file download
    // For this demo, we'll just show an alert
    alert(`Downloading ${fileName}. In a production environment, this would download the actual file.`);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <DownloadIcon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h5" component="h2">
          Implementation Resources
        </Typography>
      </Box>
      
      <Typography variant="body1" paragraph>
        Download these resources to help implement and optimize the {process.title.toLowerCase()} process in your warehouse.
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {processResources.map((resource, index) => (
          <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, minWidth: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getIcon(resource.icon)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {resource.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {resource.description}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button 
                  startIcon={<DownloadIcon />} 
                  onClick={() => handleDownload(resource.fileName)}
                  fullWidth
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
        <Typography variant="body2" color="white">
          Note: These resources are provided as templates and guides. You should customize them to fit your specific warehouse operations and requirements.
        </Typography>
      </Box>
    </Box>
  );
};

export default DownloadResources;
