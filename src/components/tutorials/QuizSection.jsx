import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { selectSelectedProcess } from '../../features/processes/processesSlice';

// Quiz data for each process
const quizData = {
  receiving: [
    {
      question: "What is a key benefit of using a WMS for the receiving process?",
      options: [
        "Increased warehouse space",
        "Reduced receiving errors by up to 80%",
        "Elimination of all manual tasks",
        "Lower quality standards"
      ],
      correctAnswer: 1
    },
    {
      question: "Which of the following is NOT a step in the WMS-enabled receiving process?",
      options: [
        "Appointment Scheduling",
        "Barcode scanning for verification",
        "Manual data entry into spreadsheets",
        "Exception handling"
      ],
      correctAnswer: 2
    },
    {
      question: "What KPI is most directly improved by implementing a WMS in the receiving process?",
      options: [
        "Employee satisfaction",
        "Warehouse temperature",
        "Receiving accuracy",
        "Delivery time"
      ],
      correctAnswer: 2
    }
  ],
  putaway: [
    {
      question: "How does a WMS optimize the putaway process?",
      options: [
        "By eliminating the need for storage locations",
        "By suggesting optimal storage locations based on item characteristics",
        "By requiring more staff for putaway operations",
        "By slowing down the process for better accuracy"
      ],
      correctAnswer: 1
    },
    {
      question: "What is a key metric for measuring putaway efficiency?",
      options: [
        "Number of employees",
        "Warehouse square footage",
        "Putaway time",
        "Number of forklifts"
      ],
      correctAnswer: 2
    },
    {
      question: "Which of the following is a best practice for WMS-enabled putaway?",
      options: [
        "Storing items randomly to confuse competitors",
        "Scanning location barcodes to verify correct putaway destination",
        "Putting away items only once per week",
        "Avoiding the use of mobile devices"
      ],
      correctAnswer: 1
    }
  ],
  "inventory-management": [
    {
      question: "What is cycle counting in inventory management?",
      options: [
        "Counting inventory in circles",
        "Performing regular partial inventory counts",
        "Counting inventory only at the end of the year",
        "Counting how many cycles a product goes through"
      ],
      correctAnswer: 1
    },
    {
      question: "How does a WMS improve inventory accuracy?",
      options: [
        "By eliminating the need to track inventory",
        "Through real-time digital inventory records and verification",
        "By requiring more manual counts",
        "By storing less inventory"
      ],
      correctAnswer: 1
    },
    {
      question: "What is a target inventory accuracy rate with a WMS?",
      options: [
        "Above 90%",
        "Above 95%",
        "Above 99%",
        "100% is the only acceptable rate"
      ],
      correctAnswer: 2
    }
  ],
  picking: [
    {
      question: "What picking strategy can a WMS enable that is difficult to implement manually?",
      options: [
        "Single-order picking",
        "Random picking",
        "Batch picking of multiple orders simultaneously",
        "Picking only fast-moving items"
      ],
      correctAnswer: 2
    },
    {
      question: "How does a WMS verify picking accuracy?",
      options: [
        "Visual inspection only",
        "Barcode/RFID verification",
        "Weighing each item",
        "Picking is not verified"
      ],
      correctAnswer: 1
    },
    {
      question: "What is a key benefit of WMS-enabled picking?",
      options: [
        "Elimination of all picking errors",
        "Reduced travel time by up to 40%",
        "No need for picking staff",
        "Unlimited picking capacity"
      ],
      correctAnswer: 1
    }
  ],
  packing: [
    {
      question: "How does a WMS improve the packing process?",
      options: [
        "By eliminating the need for packaging materials",
        "By suggesting optimal packaging based on item characteristics",
        "By requiring more staff for packing operations",
        "By making packages heavier"
      ],
      correctAnswer: 1
    },
    {
      question: "What is a key metric for measuring packing efficiency?",
      options: [
        "Number of colors used in packaging",
        "Packing material cost",
        "Package weight",
        "Number of tape rolls used"
      ],
      correctAnswer: 1
    },
    {
      question: "Which of the following is NOT a benefit of WMS-enabled packing?",
      options: [
        "Reduced packing errors",
        "Decreased packaging material costs",
        "Elimination of all shipping carriers",
        "Enhanced customer experience"
      ],
      correctAnswer: 2
    }
  ],
  shipping: [
    {
      question: "How does a WMS optimize carrier selection?",
      options: [
        "By always choosing the most expensive carrier",
        "By suggesting optimal carrier and service level based on requirements",
        "By eliminating the need for carriers",
        "By requiring manual carrier research"
      ],
      correctAnswer: 1
    },
    {
      question: "What is a key benefit of WMS-enabled shipping?",
      options: [
        "Elimination of all shipping costs",
        "Reduced shipping errors by up to 95%",
        "No need for shipping documentation",
        "Unlimited shipping capacity"
      ],
      correctAnswer: 1
    },
    {
      question: "Which of the following is NOT a step in the WMS-enabled shipping process?",
      options: [
        "Manifest creation",
        "Load planning",
        "Manual address entry for each package",
        "Shipment confirmation"
      ],
      correctAnswer: 2
    }
  ],
  returns: [
    {
      question: "How does a WMS improve the returns process?",
      options: [
        "By eliminating all returns",
        "By accelerating returns processing by up to 70%",
        "By automatically rejecting all returns",
        "By making returns more complicated for customers"
      ],
      correctAnswer: 1
    },
    {
      question: "What is a key step in WMS-enabled returns processing?",
      options: [
        "Discarding all returned items",
        "Inspection and grading according to condition",
        "Returning items to the wrong location",
        "Ignoring return authorization"
      ],
      correctAnswer: 1
    },
    {
      question: "Which metric is important to track for returns processing?",
      options: [
        "Customer hair color",
        "Return disposition accuracy",
        "Number of returns rejected",
        "Customer age"
      ],
      correctAnswer: 1
    }
  ]
};

const QuizSection = () => {
  const process = useSelector(selectSelectedProcess);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!process) {
    return null;
  }

  const processQuiz = quizData[process.id] || [];
  
  if (processQuiz.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Quiz
        </Typography>
        <Alert severity="info">
          No quiz available for this process yet. Check back later!
        </Alert>
      </Box>
    );
  }

  const handleAnswerChange = (event, questionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: parseInt(event.target.value)
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    processQuiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return {
      correct: correctAnswers,
      total: processQuiz.length,
      percentage: Math.round((correctAnswers / processQuiz.length) * 100)
    };
  };

  const score = calculateScore();

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <QuizIcon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h5" component="h2">
          Test Your Knowledge
        </Typography>
      </Box>
      
      <Typography variant="body1" paragraph>
        Take this quick quiz to test your understanding of the {process.title.toLowerCase()} process and how a WMS can optimize it.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        {!showResults ? (
          <Stepper activeStep={activeStep} orientation="vertical">
            {processQuiz.map((question, index) => (
              <Step key={index}>
                <StepLabel>{`Question ${index + 1}`}</StepLabel>
                <StepContent>
                  <Typography variant="h6" gutterBottom>
                    {question.question}
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={selectedAnswers[index] !== undefined ? selectedAnswers[index].toString() : ''}
                      onChange={(e) => handleAnswerChange(e, index)}
                    >
                      {question.options.map((option, optionIndex) => (
                        <FormControlLabel
                          key={optionIndex}
                          value={optionIndex.toString()}
                          control={<Radio />}
                          label={option}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <Box sx={{ mb: 2, mt: 1 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={index === processQuiz.length - 1 ? handleComplete : handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={selectedAnswers[index] === undefined}
                      >
                        {index === processQuiz.length - 1 ? 'Finish' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Quiz Results
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              my: 3,
              p: 3,
              bgcolor: score.percentage >= 70 ? 'success.light' : 'warning.light',
              borderRadius: 2
            }}>
              <Typography variant="h4" gutterBottom>
                {score.percentage}%
              </Typography>
              <Typography variant="body1">
                You answered {score.correct} out of {score.total} questions correctly
              </Typography>
              {score.percentage >= 70 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body1" color="success.main">
                    Great job! You have a good understanding of this process.
                  </Typography>
                </Box>
              )}
              {score.percentage < 70 && (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  You might want to review the Flow again to improve your understanding.
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Answers
              </Typography>
              {processQuiz.map((question, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {index + 1}. {question.question}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: selectedAnswers[index] === question.correctAnswer ? 'success.main' : 'error.main',
                      fontWeight: 'medium',
                      mt: 1
                    }}
                  >
                    Your answer: {question.options[selectedAnswers[index]]}
                    {selectedAnswers[index] !== question.correctAnswer && (
                      <Typography component="span" sx={{ display: 'block', color: 'success.main', mt: 0.5 }}>
                        Correct answer: {question.options[question.correctAnswer]}
                      </Typography>
                    )}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Button 
              variant="contained" 
              onClick={handleReset} 
              sx={{ mt: 2 }}
            >
              Retake Quiz
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default QuizSection;
