// import React, { useState } from 'react';
// import { Card, ListGroup, Form, Button, Alert } from 'react-bootstrap';
// import { toast } from 'react-toastify';

// function Quiz({ quiz, userId }) {
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [result, setResult] = useState(null);
//   const [isSubmitted, setIsSubmitted] = useState(false); // Track if quiz is submitted
//   const API_BASE_URL = process.env.REACT_APP_API_URL;
//   const handleSubmit = async () => {
//     if (isSubmitted) return; // Agar quiz already submit ho chuka hai, toh return kare

//     let score = 0;
//     quiz.questions.forEach((question, index) => {
//       if (selectedAnswers[index] === question.correctAnswer) {
//         score += 10; // Har sahi jawab ke liye 10 points
//       }
//     });

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/quizzes/${quiz._id}/submit`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId, score }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setResult(`Quiz submitted! Your score: ${score}`);
//         setIsSubmitted(true); // Quiz submitted mark kare
//         toast.success(`Quiz submitted! Your score: ${score}`); // Display success toast
//       } else {
//         setResult(data.message || 'Failed to submit quiz.');
//         toast.error(data.message || 'Failed to submit quiz.'); // Display error toast
//       }
//     } catch (err) {
//       setResult('An error occurred. Please try again.');
//       toast.error('An error occurred. Please try again.'); // Display error toast
//     }
//   };

//   return (
//     <Card className="mb-4 shadow">
//       <Card.Body>
//         <Card.Title className="text-center mb-4">{quiz.title}</Card.Title>
//         <Card.Text className="text-muted text-center mb-4">{quiz.description}</Card.Text>
//         {quiz.questions.map((question, index) => (
//           <div key={index} className="mb-4">
//             <Card.Subtitle className="mb-3">Question {index + 1}: {question.questionText}</Card.Subtitle>
//             <ListGroup>
//               {question.options.map((option, i) => (
//                 <ListGroup.Item key={i} className="d-flex align-items-center">
//                   <Form.Check
//                     type="radio"
//                     name={`question-${index}`}
//                     label={option}
//                     value={option}
//                     onChange={() => setSelectedAnswers({ ...selectedAnswers, [index]: option })}
//                     disabled={isSubmitted} // Agar quiz submit ho chuka hai, toh options disable kare
//                     className="w-100"
//                   />
//                 </ListGroup.Item>
//               ))}
//             </ListGroup>
//           </div>
//         ))}
//         <div className="text-center mt-4" style={{ marginTop: 'auto' }}>
//           <Button variant="primary" onClick={handleSubmit} disabled={isSubmitted}>
//             {isSubmitted ? 'Quiz Submitted' : 'Submit Quiz'}
//           </Button>
//         </div>
//         {result && <Alert variant="info" className="mt-3">{result}</Alert>}
//       </Card.Body>
//     </Card>
//   );
// }

// export default Quiz;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, ListGroup, Form, Button, Alert, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Quiz({ quiz, userId }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [timeoutId, setTimeoutId] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Use a ref to store handleSubmit
  const handleSubmitRef = useRef();
  // Start 10-second timeout
  const startTimeout = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => {
      const newWarningCount = Math.min(5, warningCount + 1);
      setWarningCount(newWarningCount);
      if (newWarningCount >= 5) {
        handleSubmitRef.current(true); // Use the ref to call handleSubmit
      }
    }, 10000);
    setTimeoutId(id);
  }, [timeoutId, warningCount]);

  // Function to speak a message
  const speakMessage = useCallback((message) => {
    if (!isSubmitted && 'speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(message);
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    }
  }, [isSubmitted]);
  // Handle full-screen change
  const handleFullScreenChange = useCallback(() => {
    if (!isSubmitted && !document.fullscreenElement) {
      const newWarningCount = Math.min(5, warningCount + 1);
      setWarningCount(newWarningCount);

      let message;
      if (newWarningCount === 4) {
        message = 'You have 1 warning left. The quiz will be automatically submitted if you trigger another warning.';
      } else {
        message = `You tried to exit full-screen mode. Please stay in full-screen mode to continue the quiz. You have ${5 - newWarningCount} warnings left.`;
      }

      setWarningMessage(message);
      toast.warning(message);
      speakMessage(message);

      if (newWarningCount >= 5) {
        handleSubmitRef.current(true); // Use the ref to call handleSubmit
      } else {
        setShowWarningModal(true);

        // Attempt to re-enter full-screen mode
        document.documentElement.requestFullscreen()
          .then(() => {
            setIsFullScreen(true);
          })
          .catch((err) => {
            console.error('Error attempting to enable full-screen mode:', err);
            toast.error('Unable to re-enter full-screen mode. Please enable it manually.');
          });

        startTimeout();
      }
    }
  }, [warningCount, isSubmitted, speakMessage, startTimeout]);

  // Handle tab switch
  const handleVisibilityChange = useCallback(() => {
    if (!isSubmitted && document.hidden) {
      const newWarningCount = Math.min(5, warningCount + 1);
      setWarningCount(newWarningCount);

      let message;
      if (newWarningCount === 4) {
        message = 'You have 1 warning left. The quiz will be automatically submitted if you trigger another warning.';
      } else {
        message = `You tried to switch tabs. Please stay on this tab to continue the quiz. You have ${5 - newWarningCount} warnings left.`;
      }

      setWarningMessage(message);
      toast.warning(message);
      speakMessage(message);

      if (newWarningCount >= 5) {
        handleSubmitRef.current(true); // Use the ref to call handleSubmit
      } else {
        setShowWarningModal(true);
        startTimeout();
      }
    }
  }, [warningCount, isSubmitted, speakMessage, startTimeout]);

  // Define handleSubmit
  const handleSubmit = useCallback(async (isAutomaticSubmission = false) => {
    if (isSubmitted) return;
  
    if (!isAutomaticSubmission) {
      const unansweredQuestions = quiz.questions.filter((_, index) => !selectedAnswers.hasOwnProperty(index));
      if (unansweredQuestions.length > 0) {
        toast.error('Please answer all questions before submitting.');
        return;
      }
    }
  
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        score += 10;
      }
    });
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quiz._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, score }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(`Quiz submitted! Your score: ${score}`);
        setIsSubmitted(true);
        toast.success(`Quiz submitted! Your score: ${score}`);
        speakMessage('Quiz submitted!');
  
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
  
        // Remove event listeners
        document.removeEventListener('fullscreenchange', handleFullScreenChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      } else {
        setResult(data.message || 'Failed to submit quiz.');
        toast.error(data.message || 'Failed to submit quiz.');
      }
    } catch (err) {
      setResult('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
    }
  }, [isSubmitted, quiz, selectedAnswers, userId, API_BASE_URL, timeoutId, speakMessage, handleFullScreenChange, handleVisibilityChange]);
  
  // Update the ref with the latest handleSubmit
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);



  // Add event listeners for full-screen and tab switch
  useEffect(() => {
    if (!isSubmitted) {
      document.addEventListener('fullscreenchange', handleFullScreenChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleFullScreenChange, handleVisibilityChange, timeoutId, isSubmitted]);

  // Automatically close warning modal after 5 seconds
  useEffect(() => {
    if (showWarningModal && !isSubmitted) {
      const modalTimeout = setTimeout(() => {
        setShowWarningModal(false);
      }, 5000);
      return () => clearTimeout(modalTimeout);
    }
  }, [showWarningModal, isSubmitted]);

  // Start quiz and enter full-screen mode
  const handleStartQuiz = () => {
    if (!document.documentElement.requestFullscreen) {
      toast.error('Full-screen mode is not supported in this browser.');
      setIsFullScreen(true); // Fallback: Allow quiz to start
      return;
    }

    document.documentElement.requestFullscreen()
      .then(() => {
        setIsFullScreen(true);
      })
      .catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err);
        toast.error('Unable to enter full-screen mode. Please enable it manually.');
        setIsFullScreen(true); // Fallback: Allow quiz to start
      });
  };

  return (
    <Card className="mb-4 shadow">
      <Card.Body>
        <Card.Title className="text-center mb-4">{quiz.title}</Card.Title>
        <Card.Text className="text-muted text-center mb-4">{quiz.description}</Card.Text>
        {!isFullScreen ? (
          <div className="text-center">
            <Button variant="primary" onClick={handleStartQuiz}>
              Start Quiz
            </Button>
          </div>
        ) : (
          <>
            {quiz.questions.map((question, index) => (
              <div key={index} className="mb-4">
                <Card.Subtitle className="mb-3">Question {index + 1}: {question.questionText}</Card.Subtitle>
                <ListGroup>
                  {question.options.map((option, i) => (
                    <ListGroup.Item
                      key={i}
                      className="d-flex align-items-center"
                      onClick={() => setSelectedAnswers({ ...selectedAnswers, [index]: option })}
                      style={{ cursor: 'pointer' }}
                    >
                      <Form.Check
                        type="radio"
                        name={`question-${index}`}
                        label={option}
                        value={option}
                        checked={selectedAnswers[index] === option}
                        onChange={() => {}}
                        disabled={isSubmitted}
                        className="w-100"
                        aria-label={`Option ${i + 1}: ${option}`}
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            ))}
            <div className="text-center mt-4">
              <Button variant="primary" onClick={() => handleSubmit(false)} disabled={isSubmitted}>
                {isSubmitted ? 'Quiz Submitted' : 'Submit Quiz'}
              </Button>
            </div>
          </>
        )}
        {result && <Alert variant="info" className="mt-3">{result}</Alert>}
      </Card.Body>

      {/* Warning Modal */}
      {!isSubmitted && (
        <Modal show={showWarningModal} onHide={() => setShowWarningModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {warningMessage}
            <br />
            {warningCount === 4 ? (
              <strong>You have 1 warning left. The quiz will be automatically submitted if you trigger another warning.</strong>
            ) : (
              `You have ${5 - warningCount} warnings left.`
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowWarningModal(false);
                document.documentElement.requestFullscreen()
                  .then(() => {
                    setIsFullScreen(true);
                  })
                  .catch((err) => {
                    console.error('Error attempting to enable full-screen mode:', err);
                    toast.error('Unable to re-enter full-screen mode. Please enable it manually.');
                  });
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Card>
  );
}

export default Quiz;
