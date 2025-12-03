
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, StopCircle, User, Bot, Volume2 } from 'lucide-react';
import { createSpeakingSession } from '../services/aiService';
import { ChatMessage, IChatSession } from '../types';

const SpeakingSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const sessionRef = useRef<IChatSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize Chat
  useEffect(() => {
    const startSession = async () => {
      setIsProcessing(true);
      setError(null);
      try {
        sessionRef.current = await createSpeakingSession();
        // Trigger the AI to speak first
        const intro = await sessionRef.current.sendMessage("Start the IELTS Speaking exam now. Introduce yourself.");
        if (intro) {
          setMessages([{ role: 'model', text: intro, timestamp: new Date() }]);
          speakText(intro);
        }
      } catch (e: any) {
        console.error("Failed to start chat", e);
        setError("无法连接到 AI 服务。请在侧边栏“设置”中检查 API Key。");
      } finally {
        setIsProcessing(false);
      }
    };

    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionRef.current) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    setError(null);

    try {
      const responseText = await sessionRef.current.sendMessage(userMsg.text);
      if (responseText) {
        const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
        setMessages((prev) => [...prev, botMsg]);
        
        // Simple TTS invocation if browser supports it
        speakText(responseText);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError("发送失败: " + (error.message || "未知错误"));
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.lang = 'en-GB'; // British accent for IELTS
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mock recording for visual effect (Actual speech-to-text requires more complex setup in browser without libraries)
  // In a real production app, we would use window.SpeechRecognition
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simulate speech to text after 2 seconds for demo purposes if web speech api is not easy to access
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
         // Use native speech recognition
         const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
         const recognition = new SpeechRecognition();
         recognition.continuous = false;
         recognition.lang = 'en-US';
         recognition.interimResults = false;
         recognition.maxAlternatives = 1;

         recognition.onresult = (event: any) => {
           const text = event.results[0][0].transcript;
           setInput(text);
           setIsRecording(false);
         };
         
         recognition.onerror = () => setIsRecording(false);
         recognition.onend = () => setIsRecording(false);

         recognition.start();
      } else {
        alert("当前浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器。");
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-4 flex-none">
        <h1 className="text-3xl font-bold text-slate-900">口语模拟</h1>
        <p className="text-slate-500">与 AI 考官互动。请尽量清楚地口述或输入你的答案（全程英语）。</p>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto p-4 space-y-4 mb-4 relative"
      >
        {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
                {error}
            </div>
        )}

        {messages.length === 0 && !isProcessing && !error && (
           <div className="text-center text-slate-400 mt-20">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>AI 考官正在准备...</p>
           </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-2 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-red-100'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-blue-600" /> : <Bot className="w-5 h-5 text-red-600" />}
              </div>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}
              >
                {msg.text}
                {msg.role === 'model' && (
                   <button onClick={() => speakText(msg.text)} className="block mt-2 text-slate-400 hover:text-slate-600">
                      <Volume2 className="w-4 h-4" />
                   </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex justify-start">
             <div className="flex flex-row">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mx-2">
                 <Bot className="w-5 h-5 text-red-600" />
               </div>
               <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex space-x-2 items-center">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-none bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleRecording}
            className={`p-3 rounded-full transition-all ${
              isRecording 
                ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的回答..."
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isRecording || isProcessing}
          />

          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing || isRecording}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2 text-xs text-slate-400">
          点击麦克风说话，或直接输入文字。AI 将会自动朗读回复。
        </div>
      </div>
    </div>
  );
};

export default SpeakingSection;
