
import React, { useState } from 'react';
import { BookOpen, Check, X, RefreshCw, ChevronRight } from 'lucide-react';
import { generateReadingPractice } from '../services/aiService';
import { ReadingPractice } from '../types';

const ReadingSection: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [practice, setPractice] = useState<ReadingPractice | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  // Topics translated to Chinese for the UI
  const topics = ['气候变化 (Climate Change)', '古代历史 (Ancient History)', '太空探索 (Space Exploration)', '心理学 (Psychology)', '城市规划 (Urban Planning)', '科技前沿 (Technology)'];

  const handleGenerate = async (selectedTopic: string) => {
    setLoading(true);
    setTopic(selectedTopic);
    setPractice(null);
    setSelectedAnswers({});
    setShowResults(false);
    
    try {
      const result = await generateReadingPractice(selectedTopic);
      setPractice(result);
    } catch (error) {
      console.error(error);
      alert('生成阅读练习失败，请检查 API 设置并重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    if (!practice) return 0;
    let score = 0;
    practice.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
       <header>
        <h1 className="text-3xl font-bold text-slate-900">阅读练习</h1>
        <p className="text-slate-500 mt-2">生成无限的学术阅读文章和配套问题（英文原文）。</p>
      </header>

      {!practice && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => handleGenerate(t)}
              className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all text-left group"
            >
              <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">{t}</h3>
              <div className="flex items-center text-sm text-slate-400 mt-2">
                开始练习 <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          ))}
          <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center">
             <span className="text-slate-500 text-sm">选择一个主题以生成测试</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">正在生成关于“{topic}”的文章...</p>
        </div>
      )}

      {practice && (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
          {/* Passage Column */}
          <div className="lg:w-1/2 bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">{practice.title}</h2>
            <div className="prose prose-slate max-w-none text-justify leading-relaxed text-slate-700">
               {practice.passage.split('\n').map((para, i) => (
                 <p key={i} className="mb-4">{para}</p>
               ))}
            </div>
          </div>

          {/* Questions Column */}
          <div className="lg:w-1/2 space-y-6">
            <div className="sticky top-4">
              {practice.questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-4">
                  <h3 className="font-medium text-slate-900 mb-4">
                    <span className="text-blue-600 font-bold mr-2">{idx + 1}.</span>
                    {q.question}
                  </h3>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      const isCorrect = q.correctAnswer === optIdx;
                      
                      let containerClass = "border-slate-200 hover:bg-slate-50";
                      if (showResults) {
                        if (isCorrect) containerClass = "bg-green-50 border-green-200 ring-1 ring-green-500";
                        else if (isSelected && !isCorrect) containerClass = "bg-red-50 border-red-200";
                        else containerClass = "opacity-50 border-slate-100";
                      } else if (isSelected) {
                        containerClass = "bg-blue-50 border-blue-500 ring-1 ring-blue-500";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex justify-between items-center ${containerClass}`}
                        >
                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          {showResults && isCorrect && <Check className="w-4 h-4 text-green-600" />}
                          {showResults && isSelected && !isCorrect && <X className="w-4 h-4 text-red-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!showResults ? (
                <button
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(selectedAnswers).length < practice.questions.length}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  提交答案
                </button>
              ) : (
                <div className="bg-slate-900 text-white p-6 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-sm">你的得分</p>
                    <p className="text-3xl font-bold">{calculateScore()} / {practice.questions.length}</p>
                  </div>
                  <button 
                    onClick={() => { setPractice(null); setTopic(''); }}
                    className="px-6 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    再来一篇
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingSection;
