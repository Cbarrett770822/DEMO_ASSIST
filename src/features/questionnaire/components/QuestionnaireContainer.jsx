import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// Calculate icon import removed
import { 
  selectActiveCompanyId, 
  selectActiveSection, 
  selectIsCreatingNewCompany,
  selectCompletionStatus,
  selectError,
  selectActiveCompany,
  selectStatus,
  setActiveSection,
  clearError,
  questionnaireSections,
  setActiveCompany,
  fetchCompanies,
  fetchCompanyResponses
} from '../questionnaireSlice';

// Import company management components
import CompanySelector from './common/CompanySelector';
import CreateCompanyForm from './common/CreateCompanyForm';
import QuestionnaireNavigation from './QuestionnaireNavigation';
import SummaryView from './common/SummaryView';
// ROI Calculator import removed

// Import section components
import CompanyProfile from './sections/CompanyProfile';
import WarehouseInfrastructure from './sections/WarehouseInfrastructure';
import InventoryManagement from './sections/InventoryManagement';
import OrderProfile from './sections/OrderProfile';
import InboundOperations from './sections/InboundOperations';
import OutboundOperations from './sections/OutboundOperations';
import SystemsTechnology from './sections/SystemsTechnology';
import PersonnelOrganization from './sections/PersonnelOrganization';
import ContinuousImprovement from './sections/ContinuousImprovement';

const QuestionnaireContainer = () => {
  const dispatch = useDispatch();
  // ROI Calculator state removed
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const activeCompanyId = useSelector(selectActiveCompanyId);
  const activeSection = useSelector(selectActiveSection);
  const isCreatingNewCompany = useSelector(selectIsCreatingNewCompany);
  const completionStatus = useSelector(selectCompletionStatus);
  const error = useSelector(selectError);
  const activeCompany = useSelector(selectActiveCompany);
  const status = useSelector(selectStatus);
  
  // Clear any errors when component mounts and fetch companies
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
    
    // Fetch companies from the server when component mounts
    setIsLoading(true);
    dispatch(fetchCompanies())
      .unwrap()
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching companies:', error);
        setIsLoading(false);
      });
  }, [dispatch, error]);
  
  // Fetch company responses when active company changes
  useEffect(() => {
    if (activeCompanyId) {
      dispatch(fetchCompanyResponses(activeCompanyId))
        .unwrap()
        .catch((error) => {
          console.error('Error fetching company responses:', error);
        });
    }
  }, [dispatch, activeCompanyId]);
  
  // ROI Calculator toggle function removed
  
  const handleBackToCompanies = () => {
    // First set the section back to company profile
    dispatch(setActiveSection('companyProfile'));
    // Then clear the active company
    dispatch(setActiveCompany(null));
  };
  
  const handleSectionChange = (sectionId) => {
    setIsTransitioning(true);
    
    // Short delay for transition effect
    setTimeout(() => {
      dispatch(setActiveSection(sectionId));
      setIsTransitioning(false);
    }, 300);
  };
  
  // Map section IDs to components
  const sectionComponents = {
    companyProfile: CompanyProfile,
    warehouseInfrastructure: WarehouseInfrastructure,
    inventoryManagement: InventoryManagement,
    orderProfile: OrderProfile,
    inboundOperations: InboundOperations,
    outboundOperations: OutboundOperations,
    systemsTechnology: SystemsTechnology,
    personnelOrganization: PersonnelOrganization,
    continuousImprovement: ContinuousImprovement
  };
  
  // Render the main content based on current state
  const renderMainContent = () => {
    // Show error if there is one
    if (error) {
      return (
        <Alert 
          severity="error" 
          onClose={() => dispatch(clearError())}
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      );
    }
    
    // ROI calculator section removed
    
    // Show loading indicator while fetching companies
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading companies...
          </Typography>
        </Box>
      );
    }
    
    // Show company selector if no active company and not creating new one
    if (!activeCompanyId && !isCreatingNewCompany) {
      return <CompanySelector />;
    }
    
    // Show create company form if creating new company
    if (isCreatingNewCompany) {
      return <CreateCompanyForm />;
    }
    
    // Show summary view if on summary section
    if (activeSection === 'summary') {
      return (
        <Box>
          <SummaryView />
          {/* ROI Calculator button removed */}
        </Box>
      );
    }
    
    // Show the appropriate section component with transition effect
    const SectionComponent = sectionComponents[activeSection];
    if (isTransitioning) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return SectionComponent ? <SectionComponent /> : null;
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {status === 'loading' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Saving data...  
              </Typography>
            </Box>
          )}
          <Typography variant="h4" component="h1" gutterBottom>
            Supply Chain Assessment
          </Typography>
          
          {/* Company info and section navigation - moved to the top */}
          {activeCompanyId && !isCreatingNewCompany && !showRoiCalculator && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleBackToCompanies}
                  startIcon={<ArrowBackIcon />}
                >
                  Back to Companies
                </Button>
                
                {/* ROI Calculator button removed */}
                
                <Typography variant="subtitle1" color="text.secondary">
                  Company: <strong>{activeCompany?.companyInfo?.name || 'Unnamed Company'}</strong>
                </Typography>
              </Box>
              
              <Stepper 
                activeStep={questionnaireSections.findIndex(s => s.id === activeSection)} 
                alternativeLabel
                sx={{ mb: 4, overflowX: 'auto', py: 2 }}
              >
                {questionnaireSections.map((section) => (
                  <Step key={section.id} completed={completionStatus[section.id] === 'complete'}>
                    <StepLabel
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSectionChange(section.id)}
                    >
                      {section.title}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </>
          )}
          
          <Typography variant="body1" paragraph>
            This questionnaire will help you assess your current supply chain operations and
            identify potential areas for improvement and optimization.
          </Typography>
          
          {/* Main content area - only one component will be rendered */}
          {renderMainContent()}
          
          {/* Bottom navigation with Next/Previous buttons */}
          {activeCompanyId && !isCreatingNewCompany && !showRoiCalculator && (
            <QuestionnaireNavigation 
              onNext={() => {
                const currentIndex = questionnaireSections.findIndex(s => s.id === activeSection);
                if (currentIndex < questionnaireSections.length - 1) {
                  handleSectionChange(questionnaireSections[currentIndex + 1].id);
                } else {
                  handleSectionChange('summary');
                }
              }}
              onPrevious={() => {
                const currentIndex = questionnaireSections.findIndex(s => s.id === activeSection);
                if (currentIndex > 0) {
                  handleSectionChange(questionnaireSections[currentIndex - 1].id);
                }
              }}
              onSummary={() => handleSectionChange('summary')}
              isFirstSection={questionnaireSections.findIndex(s => s.id === activeSection) === 0}
              isLastSection={questionnaireSections.findIndex(s => s.id === activeSection) === questionnaireSections.length - 1}
              completionStatus={completionStatus}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default QuestionnaireContainer;
