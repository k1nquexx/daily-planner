import React, { useEffect, useState } from 'react';
import { Smartphone, X, Globe, Wifi, Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function ConnectPhoneModal({ onClose }) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'local'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getNetworkInfo()
      .then((info) => {
        setNetworkInfo(info);
        if (info.tunnelUrl) {
          setActiveTab('global');
        } else {
          setActiveTab('local');
        }
      })
      .catch((err) => console.error('Failed to get network info:', err));
  }, []);

  const localUrl = networkInfo?.preferredUrl || window.location.origin;
  const globalUrl = networkInfo?.tunnelUrl || 'https://course-its-florence-watershed.trycloudflare.com';

  const currentUrl = activeTab === 'global' ? globalUrl : localUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrImageUrl = currentUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}&color=020617&bgcolor=ffffff`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">DayFlow на Android</h3>
            <p className="text-xs text-slate-400">Синхронизация с ПК из любой точки мира</p>
          </div>
        </div>

        {/* Tab Selector: Global vs Local */}
        <div className="flex items-center gap-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/80 mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('global')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'global'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Вне дома (4G/LTE / Любая сеть)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'local'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="h-3.5 w-3.5" />
            <span>Дома (по Wi-Fi)</span>
          </button>
        </div>

        {/* QR Code */}
        <div className="my-3 flex flex-col items-center justify-center rounded-2xl bg-white p-4 text-center">
          {qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt="QR Code"
              className="h-44 w-44 rounded-lg object-contain"
            />
          ) : (
            <div className="h-44 w-44 flex items-center justify-center text-slate-700">Загрузка QR...</div>
          )}
          <p className="mt-2 text-xs font-semibold text-slate-800">
            Наведите камеру Android на QR-код
          </p>
        </div>

        {/* URL Link with Copy */}
        <div className="mb-4">
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Или введите ссылку в браузере телефона:</label>
          <div className="flex items-center gap-2 rounded-xl bg-slate-800/90 border border-slate-700 p-2.5">
            <span className="text-xs font-mono text-indigo-300 truncate flex-1">{currentUrl}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/20 p-3.5 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Как установить как отдельное приложение:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300/90 leading-relaxed text-[11px]">
            <li>Откройте ссылку в Chrome / Яндекс на Android.</li>
            <li>Нажмите меню (три точки в правом верхнем углу) ➔ <b>«Установить приложение»</b>.</li>
            <li>Android установит полноценное приложение DayFlow с иконкой на рабочий стол телефона.</li>
            <li>Все галочки и заметки будут мгновенно лететь в базу на вашем домашнем ПК из любой сети!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
