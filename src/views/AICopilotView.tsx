import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Cpu,
  Layers,
  Wrench,
  Package,
  FileText,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  suggestions?: {
    failureMode?: string;
    recommendedProcedure?: string;
    spareParts?: string[];
    estimatedHours?: number;
  };
}

export const AICopilotView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'AI',
      text: 'Olá! Sou o NEXUS AI Copilot, seu assistente industrial especializado em manutenção preditiva, confiabilidade e diagnóstico de falhas segundo os 872 critérios do catálogo CMMS/EAM. Como posso auxiliá-lo agora?',
      timestamp: '15:20'
    },
    {
      sender: 'USER',
      text: 'O Compressor Atlas Copco COMP-04 apresentou elevação repentina de vibração para 7.2 mm/s RMS e ruído característico no rolamento dianteiro. Qual o procedimento e peças necessárias?',
      timestamp: '15:22'
    },
    {
      sender: 'AI',
      text: 'Analisei a assinatura do sensor IoT em conjunto com a FMEA da família GA-160 VSD+. A frequência indica defeito na pista externa do rolamento dianteiro (BPFI). Recomendo parada preventiva programada para evitar danos secundários ao eixo rotor.',
      timestamp: '15:22',
      suggestions: {
        failureMode: 'Fadiga acelerada por micropartículas ou desbalanceamento residual',
        recommendedProcedure: 'POP-MEC-COMP-08: Desmontagem com sacador hidráulico, aquecimento por indução térmica do novo rolamento (máx 110°C) e alinhamento a laser com tolerância < 0.05 mm.',
        spareParts: ['ROL-SKF-6314-2Z (Estoque: 8 UN no Corredor M02)', 'SELO-JC-5610-65 (Estoque: 2 UN)', 'OLEO-ISO-68-SINT (40L para purga)'],
        estimatedHours: 5.5
      }
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    const userText = inputPrompt;
    const newMsg: ChatMessage = {
      sender: 'USER',
      text: userText,
      timestamp: new Date().toLocaleTimeString().slice(0, 5)
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputPrompt('');
    setIsThinking(true);

    setTimeout(() => {
      let aiResponseText = '';
      let suggestionsData: any = undefined;

      const lower = userText.toLowerCase();
      if (lower.includes('turb') || lower.includes('vapor')) {
        aiResponseText =
          'Localizei a ficha técnica do Turbogerador TURB-01 (Siemens SST-300). A última análise físico-química de óleo registrou teor de água em 45 ppm e viscosidade cinemática 46.2 cSt a 40°C, tudo dentro da faixa nominal ISO VG 46.';
        suggestionsData = {
          recommendedProcedure: 'POP-TURB-02: Rota preditiva de termografia e coleta semestral de óleo.',
          spareParts: ['OLEO-ISO-46 (Mobil DTE 746)', 'FILT-DPX-01 Elemento Duplex'],
          estimatedHours: 4.0
        };
      } else if (lower.includes('prensa') || lower.includes('hidraul')) {
        aiResponseText =
          'Para a Prensa Hidráulica PREN-02 (Schuler 600t), os registros indicam pressão estável em 278 bar. Caso ocorra queda de pressão repentina, verifique a válvula de alívio proporcional e saturação do filtro de retorno.';
        suggestionsData = {
          failureMode: 'Cavitação ou desgaste de vedação da haste principal',
          recommendedProcedure: 'POP-HIDR-44: Teste estático de estanqueidade e aferição com manômetro classe 0.1',
          spareParts: ['Kit Reparo Gaxeta Poliuretano 600t', 'Filtro Retorno 10µm'],
          estimatedHours: 3.5
        };
      } else {
        aiResponseText = `Processe a solicitação com base nos 872 requisitos do CMMS. O ativo indicado possui histórico de alta confiabilidade (MTBF > 400h). Posso abrir uma solicitação de manutenção automática ou consultar procedimentos operacionais padrão no repositório.`;
        suggestionsData = {
          recommendedProcedure: 'POP-GEN-01: Inspeção sensitiva inicial e medição de vibração global.',
          estimatedHours: 2.0
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          suggestions: suggestionsData
        }
      ]);
      setIsThinking(false);
    }, 900);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bot size={28} color="var(--accent-cyan)" />
            NEXUS AI Copilot Industrial (Assistente Generativo)
          </h1>
          <p className="page-subtitle">
            Consultas em linguagem natural sobre histórico de ativos, diagnóstico preditivo de falhas, sugestão de procedimentos POP e estimativa de peças.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '680px',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Chat Messages Log */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                alignSelf: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {msg.sender === 'AI' && (
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={20} color="#ffffff" />
                </div>
              )}

              <div
                style={{
                  background: msg.sender === 'USER' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'var(--bg-surface)',
                  border: msg.sender === 'USER' ? 'none' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '20px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: msg.sender === 'USER' ? '#e0f2fe' : 'var(--accent-cyan)' }}>
                    {msg.sender === 'USER' ? 'Você (Eng. de Manutenção)' : 'NEXUS Copilot IA Industrial'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: msg.sender === 'USER' ? '#bae6fd' : 'var(--text-muted)' }}>
                    {msg.timestamp}
                  </span>
                </div>

                <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: '#ffffff' }}>
                  {msg.text}
                </p>

                {/* AI Structured Recommendations Box */}
                {msg.suggestions && (
                  <div
                    style={{
                      marginTop: '16px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      fontSize: '0.84rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {msg.suggestions.failureMode && (
                      <div>
                        <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>Modo de Falha Provável: </span>
                        <span>{msg.suggestions.failureMode}</span>
                      </div>
                    )}
                    {msg.suggestions.recommendedProcedure && (
                      <div>
                        <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>Procedimento POP Recomendado: </span>
                        <span>{msg.suggestions.recommendedProcedure}</span>
                      </div>
                    )}
                    {msg.suggestions.spareParts && (
                      <div>
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Peças Sobressalentes no Almoxarifado: </span>
                        <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                          {msg.suggestions.spareParts.map((part, pIdx) => (
                            <li key={pIdx}>{part}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {msg.suggestions.estimatedHours && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Tempo estimado de intervenção técnica: <strong>{msg.suggestions.estimatedHours} horas</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
              <Sparkles size={18} className="pulse-indicator" />
              <span>NEXUS AI consultando históricos de falhas e base FMEA...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '16px 24px',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Pergunte sobre falhas, manuais, procedimentos ou digite o sintoma de uma máquina..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, padding: '10px 20px' }}>
            <Send size={16} /> Enviar
          </button>
        </form>
      </div>
    </div>
  );
};
