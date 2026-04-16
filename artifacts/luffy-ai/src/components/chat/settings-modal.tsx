import {
  X, Volume2, Mic, Sparkles, Info, Palette,
  MessageSquare, Keyboard, Check, AlignJustify, AlignLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { THEMES, applyTheme, getSavedTheme, type ThemeId } from "@/lib/theme";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "general" | "voice" | "appearance" | "about";

const TABS: { id: Tab; label: string; icon: typeof Info }[] = [
  { id: "general",    label: "General",    icon: MessageSquare },
  { id: "voice",      label: "Voice",      icon: Volume2 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "about",      label: "About",      icon: Info },
];

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab]     = useState<Tab>("general");
  const [voiceEnabled, setVoiceEnabled] = useState(() =>
    localStorage.getItem("luffy-voice") !== "false"
  );
  const [voiceSpeed, setVoiceSpeed]   = useState(() =>
    parseFloat(localStorage.getItem("luffy-voice-speed") || "1.05")
  );
  const [voicePitch, setVoicePitch]   = useState(() =>
    parseFloat(localStorage.getItem("luffy-voice-pitch") || "0.9")
  );
  const [enterToSend, setEnterToSend] = useState(() =>
    localStorage.getItem("luffy-enter-send") !== "false"
  );
  const [language, setLanguage]       = useState(() =>
    localStorage.getItem("luffy-lang") || "en-IN"
  );
  const [activeTheme, setActiveTheme] = useState<ThemeId>(getSavedTheme);
  const [density, setDensity]         = useState<"comfortable" | "compact">(() =>
    (localStorage.getItem("luffy-density") as "comfortable" | "compact") || "comfortable"
  );

  useEffect(() => { localStorage.setItem("luffy-voice",      String(voiceEnabled)); }, [voiceEnabled]);
  useEffect(() => { localStorage.setItem("luffy-voice-speed", String(voiceSpeed));  }, [voiceSpeed]);
  useEffect(() => { localStorage.setItem("luffy-voice-pitch", String(voicePitch));  }, [voicePitch]);
  useEffect(() => { localStorage.setItem("luffy-enter-send",  String(enterToSend)); }, [enterToSend]);
  useEffect(() => { localStorage.setItem("luffy-lang",        language);            }, [language]);

  useEffect(() => {
    localStorage.setItem("luffy-density", density);
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  if (!open) return null;

  const handleTheme = (id: ThemeId) => {
    setActiveTheme(id);
    applyTheme(id);
  };

  const previewVoice = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      "Luffy AI at your service. How can I assist you, Sir?"
    );
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.name === "Google UK English Male") ||
      voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("male")) ||
      voices[0];
    if (preferred) u.voice = preferred;
    u.rate  = voiceSpeed;
    u.pitch = voicePitch;
    window.speechSynthesis.speak(u);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden"
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

        <div className="flex" style={{ minHeight: 380 }}>
          {/* Tab sidebar */}
          <div className="w-40 border-r border-border px-2 py-3 space-y-0.5 shrink-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                data-testid={`settings-tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                  activeTab === id
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="flex-1 px-6 py-5 overflow-y-auto">

            {/* ── General ── */}
            {activeTab === "general" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground">General Settings</h3>

                <SettingRow
                  label="Press Enter to Send"
                  description="Send on Enter. Shift+Enter inserts a new line."
                  icon={<Keyboard className="w-4 h-4" />}
                >
                  <Toggle value={enterToSend} onChange={setEnterToSend} />
                </SettingRow>

                <SettingRow
                  label="Input Language"
                  description="Language for voice input recognition."
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

                <div className="rounded-xl bg-muted/30 border border-border p-4 text-[12px] text-muted-foreground space-y-1.5">
                  <p className="font-medium text-foreground text-xs mb-2">Quick Tips</p>
                  <p>• Click any feature card on the home screen to start a guided prompt</p>
                  <p>• Use the microphone icon to speak your question</p>
                  <p>• Voice output reads Luffy AI's responses aloud</p>
                  <p>• Paste code directly and ask Luffy to debug it</p>
                  <p>• Type "panic" or "exam tomorrow" to activate Panic Mode ⚡</p>
                </div>
              </div>
            )}

            {/* ── Voice ── */}
            {activeTab === "voice" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground">Voice Settings</h3>

                <SettingRow
                  label="Voice Output"
                  description="Luffy AI reads responses aloud."
                  icon={<Volume2 className="w-4 h-4" />}
                >
                  <Toggle value={voiceEnabled} onChange={setVoiceEnabled} />
                </SettingRow>

                <div className={cn("space-y-4 transition-opacity", !voiceEnabled && "opacity-40 pointer-events-none")}>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-foreground">Speech Speed</label>
                      <span className="text-xs text-muted-foreground tabular-nums">{voiceSpeed.toFixed(2)}×</span>
                    </div>
                    <input
                      type="range" min="0.5" max="2" step="0.05"
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 rounded-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Slow</span><span>Normal</span><span>Fast</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-foreground">Voice Pitch</label>
                      <span className="text-xs text-muted-foreground tabular-nums">{voicePitch.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min="0.5" max="2" step="0.05"
                      value={voicePitch}
                      onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 rounded-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Deep</span><span>Normal</span><span>High</span>
                    </div>
                  </div>

                  <button
                    onClick={previewVoice}
                    data-testid="button-preview-voice"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm font-medium hover:bg-primary/20 active:scale-[0.98] transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                    Preview Voice
                  </button>
                </div>
              </div>
            )}

            {/* ── Appearance ── */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-foreground">Appearance</h3>

                {/* Theme picker */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-foreground">Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((theme) => {
                      const isActive = activeTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleTheme(theme.id)}
                          data-testid={`theme-${theme.id}`}
                          className={cn(
                            "relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150",
                            isActive
                              ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30"
                              : "border-border bg-background/50 hover:border-primary/30 hover:bg-accent/40"
                          )}
                        >
                          {/* Colour swatches */}
                          <div className="flex gap-1 shrink-0">
                            {theme.swatches.map((c, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ background: c }}
                              />
                            ))}
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              isActive ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {theme.name}
                          </span>
                          {isActive && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-primary-foreground" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message density */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-foreground">Message Density</label>
                  <div className="flex gap-2">
                    {(
                      [
                        { value: "comfortable", label: "Comfortable", icon: AlignJustify },
                        { value: "compact",     label: "Compact",     icon: AlignLeft },
                      ] as const
                    ).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setDensity(value)}
                        data-testid={`density-${value}`}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                          density === value
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20 hover:bg-accent/40"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Compact reduces padding between messages for more content on screen.
                  </p>
                </div>
              </div>
            )}

            {/* ── About ── */}
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

                <div className="space-y-0 text-xs text-muted-foreground">
                  <InfoRow label="Powered by"       value="Google Gemini 2.5 Flash" />
                  <InfoRow label="Voice Engine"     value="Web Speech API" />
                  <InfoRow label="Designed for"     value="BCA Students" />
                  <InfoRow label="Language Support" value="Java, C++, Python, Web Dev" />
                </div>

                <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 p-4">
                  <p className="text-[11px] text-muted-foreground mb-1">Meticulously engineered by</p>
                  <p className="text-sm font-semibold text-cyan-400">Abhay Sir & Dipanshu Sir</p>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    Built to empower the next generation of BCA students with AI-driven learning.
                  </p>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
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
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      className={cn(
        "relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
  label, description, icon, children,
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
      <span>{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
