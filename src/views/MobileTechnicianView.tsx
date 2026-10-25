import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Play,
  Pause,
  CheckCircle,
  Camera,
  PenTool,
  Clock,
  Layers,
  Wrench,
  CheckSquare,
  Package,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { WorkOrder } from '../types';
import { INITIAL_WORK_ORDERS } from '../services/mockData';

export const MobileTechnicianView: React.FC = () => {
  const [activeOrder, setActiveOrder] = useState<WorkOrder>(INITIAL_WORK_ORDERS[0]);
  const [isOffline, setIsOffline] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(12600); // 3.5 hrs in seconds
  const [photosAttached, setPhotosAttached] = useState<string[]>([
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'
  ]);
  const [signatureDone, setSignatureDone] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'SYNCED' | 'PENDING_OFFLINE'>('SYNCED');

  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const handleAddPhoto = () => {
    setPhotosAttached([
      ...photosAttached,
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80'
    ]);
  };

  const handleToggleOffline = () => {
    const next = !isOffline;
    setIsOffline(next);
    setSyncStatus(next ? 'PENDING_OFFLINE' : 'SYNCED');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Smartphone size={28} color="var(--accent-cyan)" />
            Execução Móvel dos Serviços & Aplicativo do Técnico (PWA)
          </h1>
          <p className="page-subtitle">
            Simulador da interface móvel utilizada pelos técnicos de campo em tablets e smartphones industriais. Suporte offline total.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleToggleOffline}
            className={`btn btn-sm ${isOffline ? 'btn-danger' : 'btn-secondary'}`}
          >
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} color="var(--accent-emerald)" />}
            {isOffline ? 'Simulador: Modo Offline (Sem Internet)' : 'Simulador: Conectado (4G/Wi-Fi)'}
          </button>
        </div>
      </div>

      {/* Center Phone Container */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 32px 0' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '430px',
            background: '#0a0f1d',
            borderRadius: '44px',
            border: '10px solid #1e293b',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 20px rgba(6, 182, 212, 0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {/* Mobile Top Notch & Status */}
          <div
            style={{
              background: '#0f172a',
              padding: '12px 20px 8px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>15:30</span>
            <div
              style={{
                width: '100px',
                height: '18px',
                background: '#020617',
                borderRadius: '10px',
                position: 'absolute',
                top: '8px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isOffline ? (
                <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>OFFLINE</span>
              ) : (
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>ONLINE</span>
              )}
              <Wifi size={13} color={isOffline ? 'var(--accent-rose)' : 'var(--accent-emerald)'} />
            </div>
          </div>

          {/* App Header Inside Phone */}
          <div style={{ padding: '16px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="tag-mono" style={{ fontSize: '0.8rem' }}>{activeOrder.code}</span>
                <h3 style={{ fontSize: '0.98rem', marginTop: '4px' }}>{activeOrder.title}</h3>
              </div>
              <span className="badge badge-rose">{activeOrder.priority}</span>
            </div>
          </div>

          {/* Phone Scrollable Body */}
          <div style={{ padding: '16px', overflowY: 'auto', maxHeight: '560px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Live Work Timer */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                textAlign: 'center',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Cronômetro de Execução (Apontamento)
              </div>
              <div style={{ fontSize: '2.4rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-cyan)', margin: '6px 0' }}>
                {formatTimer(elapsedSeconds)}
              </div>
              <button
                onClick={handleToggleTimer}
                className={`btn btn-sm ${timerRunning ? 'btn-danger' : 'btn-primary'}`}
                style={{ width: '100%', gap: '8px' }}
              >
                {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                {timerRunning ? 'Pausar Atividade' : 'Iniciar Intervenção'}
              </button>
            </div>

            {/* Machine Specs & Location */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                {activeOrder.assetTag} - {activeOrder.assetName}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Local: Unidade Industrial 01 &bull; Central de Ar Comprimido
              </div>
            </div>

            {/* Checklist Step by Step */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                ETAPAS DO PROCEDIMENTO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeOrder.checklists.map((chk, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <input type="checkbox" defaultChecked={chk.done} style={{ width: '16px', height: '16px' }} />
                    <span style={{ textDecoration: chk.done ? 'line-through' : 'none' }}>{chk.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Evidence (Before/After) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  EVIDÊNCIAS FOTOGRÁFICAS
                </span>
                <button onClick={handleAddPhoto} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                  <Camera size={13} /> Tirar Foto
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                {photosAttached.map((imgUrl, i) => (
                  <div key={i} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                    <img src={imgUrl} alt="Evidência" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Electronic Touch Signature Pad */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                ASSINATURA ELETRÔNICA DO TÉCNICO
              </div>
              <div
                onClick={() => setSignatureDone(true)}
                style={{
                  height: '64px',
                  background: 'var(--bg-canvas)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-prominent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {signatureDone ? (
                  <span style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>
                    Carlos E. Mendes
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Toque aqui para assinar com o dedo
                  </span>
                )}
              </div>
            </div>

            {/* Final Action Button */}
            <button
              onClick={() => alert(isOffline ? 'Salvo localmente no IndexedDB! Será sincronizado automaticamente assim que voltar o sinal Wi-Fi.' : 'Ordem de serviço finalizada e transmitida ao servidor master com sucesso!')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <CheckCircle size={18} /> Encerrar Serviço no Campo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
