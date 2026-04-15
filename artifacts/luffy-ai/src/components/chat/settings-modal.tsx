import { X, Volume2, VolumeX, Mic, Sparkles, Info, Palette, MessageSquare, Keyboard } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "general" | "voice" | "appearance" | "about";

const TABS: { id: Tab; label: string; icon: typeof Info }[] = [
  { id: "general", label: "General", icon: MessageSquare },
  { id: "voice", label: "Voice", icon: Volume2 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "about", label: "About", icon: Info },
];

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [voiceEnabled, setVoiceEnabled] = useState(() =>
    localStorage.getItem("luffy-voice") !== "false"
  );
  const [voiceSpeed, setVoiceSpeed] = useState(() =>
    parseFloat(localStorage.getItem("luffy-voice-speed") || "1.05")
  );
  const [voicePitch, setVoicePitch] = useState(() =>
    parseFloat(localStorage.getItem("luffy-voice-pitch") || "0.9")
  );
  const [enterToSend, setEnterToSend] = useState(() =>
    localStorage.getItem("luffy-enter-send") !== "false"
  );
  const [language, setLanguage] = useState(() =>
    localStorage.getItem("luffy-lang") || "en-IN"
  );

  useEffect(() => {
    localStorage.setItem("luffy-voice", String(voiceEnabled));
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem("luffy-voice-speed", String(voiceSpeed));
  }, [voiceSpeed]);

  useEffect(() => {
    localStorage.setItem("luffy-voice-pitch", String(voicePitch));
  }, [voicePitch]);

  useEffect(() => {
    localStorage.setItem("luffy-enter-send", String(enterToSend));
  }, [enterToSend]);

  useEffect(() => {
    localStorage.setItem("luffy-lang", language);
  }, [language]);

  if (!open) return null;

  const previewVoice = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance("Luffy AI at your service. How can I assist you, Sir?");
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.name === "Google UK English Male") ||
      voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("male")) ||
      voices[0];
    if (preferred) u.voice = preferred;
    u.rate = voiceSpeed;
    u.pitch = voicePitch;
    window.speechSynthesis.speak(u);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[580px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            data-testid="button-close-settings"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex" style={{ minHeight: 360 }}>
          {/* Sidebar tabs */}
          <div className="w-40 border-r border-border px-2 py-3 space-y-0.5 shrink-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  data-testid={`settings-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                    activeTab === tab.id
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-5 overflow-y-auto">
            {/* General */}
            {activeTab === "general" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground">General Settings</h3>

                <SettingRow
                  label="Press Enter to Send"
                  description="Send message on Enter. Use Shift+Enter for new line."
                  icon={<Keyboard className="w-4 h-4" />}
                >
                  <Toggle value={enterToSend} onChange={setEnterToSend} />
                </SettingRow>

                <SettingRow
                  label="Input Language"
                  description="Language used for voice input recognition."
                  icon={<Mic className="w-4 h-4" />}
                >
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="en-IN">English (India)</option>
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="hi-IN">Hindi</option>
                  </select>
                </SettingRow>

                <div className="rounded-xl bg-muted/30 border border-border p-4 text-[12px] text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground text-xs mb-2">Quick Tips</p>
                  <p>• Click any feature card on home screen to start a guided prompt</p>
                  <p>• Use the microphone icon to speak your question</p>
                  <p>• Voice output reads Luffy AI's responses aloud</p>
                  <p>• Paste code directly and ask Luffy to debug it</p>
                </div>
              </div>
            )}

            {/* Voice */}
            {activeTab === "voice" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground">Voice Settings</h3>

                <SettingRow
                  label="Voice Output"
                  description="Luffy AI reads responses aloud using text-to-speech."
                  icon={<Volume2 className="w-4 h-4" />}
                >
                  <Toggle value={voiceEnabled} onChange={setVoiceEnabled} />
                </SettingRow>

                <div className={cn("space-y-4 transition-opacity", !voiceEnabled && "opacity-40 pointer-events-none")}>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-foreground">Speech Speed</label>
                      <span className="text-xs text-muted-foreground">{voiceSpeed.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.05"
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 rounded-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Slow</span><span>Normal</span><span>Fast</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-foreground">Voice Pitch</label>
                      <span className="text-xs text-muted-foreground">{voicePitch.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.05"
                      value={voicePitch}
                      onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 rounded-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Deep</span><span>Normal</span><span>High</span>
                    </div>
                  </div>

                  <button
                    onClick={previewVoice}
                    data-testid="button-preview-voice"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm hover:bg-primary/20 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    Preview Voice
                  </button>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === "appearance" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground">Appearance</h3>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Default Dark", colors: ["#0f172a", "#1e293b", "#22d3ee"] },
                      { name: "Midnight", colors: ["#09090b", "#18181b", "#a78bfa"] },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50 hover:border-primary/40 transition-colors text-left group"
                      >
                        <div className="flex gap-1">
                          {theme.colors.map((c, i) => (
                            <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">More themes coming soon.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Message Density</label>
                  <div className="flex gap-2">
                    {["Comfortable", "Compact"].map((d) => (
                      <button
                        key={d}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors first:bg-accent first:text-foreground first:border-primary/30"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* About */}
            {activeTab === "about" && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Luffy AI</p>
                    <p className="text-[11px] text-muted-foreground">Version 1.0.0 — BCA Co-Pilot</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-muted-foreground">
                  <InfoRow label="Powered by" value="Google Gemini 2.5 Flash" />
                  <InfoRow label="Voice Engine" value="Web Speech API" />
                  <InfoRow label="Designed for" value="BCA Students" />
                  <InfoRow label="Language Support" value="Java, C++, Python, Web Dev" />
                </div>

                <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Meticulously engineered by</p>
                  <p className="text-sm font-semibold text-cyan-400">Abhay Sir & Dipanshu Sir</p>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    Built to empower the next generation of BCA students with AI-driven learning.
                  </p>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Luffy AI uses Replit AI Integrations for Gemini access. AI responses may not always be accurate — verify critical information.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0",
        value ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
          value ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function SettingRow({
  label,
  description,
  icon,
  children,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0 mt-0.5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
