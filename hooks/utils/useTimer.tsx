// import { useState, useEffect, useRef, useCallback } from 'react';

// export const useTimer = (
//   initialTime: number,
//   options?: {
//     onExpire?: () => void;
//     autoStart?: boolean;
//   }
// ) => {
//   const [timeLeft, setTimeLeft] = useState(initialTime);
//   const [isActive, setIsActive] = useState(false);
//   const timerRef = useRef<NodeJS.Timeout>();
//   const onExpireRef = useRef(options?.onExpire);
//   const initialTimeRef = useRef(initialTime);

//   useEffect(() => {
//     onExpireRef.current = options?.onExpire;
//   }, [options?.onExpire]);

//   const startTimer = useCallback(() => {
//     setTimeLeft(initialTimeRef.current);
//     setIsActive(true);
//   }, []);

//   useEffect(() => {
//     if (isActive && timeLeft > 0) {
//       timerRef.current = setInterval(() => {
//         setTimeLeft((prev) => prev - 1);
//       }, 1000);
//     } else if (timeLeft === 0) {
//       setIsActive(false);
//       onExpireRef.current?.();
//     }

//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [isActive, timeLeft]);

//   const resetTimer = () => {
//     setTimeLeft(initialTime);
//     setIsActive(false);
//   };

//   return { timeLeft, isActive, startTimer, resetTimer };
// };
