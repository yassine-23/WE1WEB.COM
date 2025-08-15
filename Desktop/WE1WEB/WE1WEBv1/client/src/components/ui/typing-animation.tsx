import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  phrases: string[];
  baseText: string;
  className?: string;
  typingSpeed?: number;
  pauseDuration?: number;
}

export default function TypingAnimation({ 
  phrases, 
  baseText, 
  className = "",
  typingSpeed = 100,
  pauseDuration = 2000 
}: TypingAnimationProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    const timeout = setTimeout(() => {
      if (isTyping && !isDeleting) {
        // Typing forward
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        } else {
          // Finished typing, pause then start deleting
          setIsTyping(false);
          setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      } else if (isDeleting) {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          // Finished deleting, move to next phrase
          setIsDeleting(false);
          setIsTyping(true);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? typingSpeed * 0.5 : typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, currentPhraseIndex, isTyping, isDeleting, phrases, typingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {baseText}{' '}
      <span className="text-cyan-300 font-bold inline-block min-w-[200px] text-left">
        {currentText}
        <span className="animate-pulse text-cyan-400">|</span>
      </span>
    </span>
  );
}