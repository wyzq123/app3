
import React, { useState, useEffect } from 'react';
import { X, Save, Key, Server, Cpu } from 'lucide-react';
import { getSettings, saveSettings, PROVIDERS } from '../services/aiService';
import { AIProviderId, UserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [showKey, setShowKey] = useState(false);

  // Reload settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveSettings(settings);
    onClose();
    window.location.reload(); // Simple way to reset services with new config
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center">
            <Cpu className="w-5 h-5 mr-2" />
            AI 模型设置
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
              <Server className="w-4 h-4 mr-2" />
              AI 服务商
            </label>
            <select
              value={settings.provider}
              onChange={(e) => {
                const newProvider = e.target.value as AIProviderId;
                const config = PROVIDERS[newProvider];
                setSettings({
                  ...settings,
                  provider: newProvider,
                  model: config.models[0], // Reset model to default of new provider
                  customEndpoint: config.endpoint === "" ? undefined : config.endpoint
                });
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(PROVIDERS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              模型名称
            </label>
            <div className="relative">
                <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                {PROVIDERS[settings.provider].models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                ))}
                </select>
                {/* Fallback input for custom models if needed, but select is safer for now */}
            </div>
            <p className="text-xs text-slate-500 mt-1">
                选择 {PROVIDERS[settings.provider].name} 旗下的具体模型。
            </p>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
              <Key className="w-4 h-4 mr-2" />
              API Key (密钥)
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder={`sk-...`}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                {showKey ? "隐藏" : "显示"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              您的 Key 仅存储在本地浏览器中，不会发送到我们的服务器。
            </p>
          </div>

          {/* Custom Endpoint (Optional/Advanced) */}
          {settings.provider !== 'google' && (
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  自定义 API Endpoint (可选)
                </label>
                <input
                  type="text"
                  value={settings.customEndpoint || ''}
                  onChange={(e) => setSettings({ ...settings, customEndpoint: e.target.value })}
                  placeholder={PROVIDERS[settings.provider].endpoint}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 focus:outline-none"
                />
             </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-200"
            >
              <Save className="w-4 h-4 mr-2" />
              保存并重载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
