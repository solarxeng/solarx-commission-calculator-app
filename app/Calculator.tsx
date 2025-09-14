// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Currency formatter
function currency(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// Core payout computation (loan mode). Same logic as legacy page.
function computePayout(deals: number, ppw: number, watts: number) {
  const kw = watts / 1000;
  let base = 0;
  if (deals >= 7) base = 2500;
  else if (deals >= 4) base = 2200;
  else if (deals >= 1) base = 1800;
  let ppwBonus = 0;
  if (ppw >= 2.8 && ppw <= 2.99) ppwBonus = 25 * kw;
  else if (ppw >= 3.0 && ppw <= 3.2) ppwBonus = 50 * kw;
  else if (ppw > 3.2 && ppw <= 3.5) ppwBonus = 75 * kw;
  else if (ppw > 3.5 && ppw <= 4.5) ppwBonus = 100 * kw;
  let bigSystemBonus = 0;
  if (kw >= 10) {
    const clamped = Math.min(20, kw);
    bigSystemBonus = Math.round(200 + 50 * (clamped - 10));
  }
  const baseR = Math.round(base);
  const ppwR = Math.round(ppwBonus);
  const total = Math.round(baseR + ppwR + bigSystemBonus);
  return { base: baseR, ppwBonus: ppwR, bigSystemBonus, total };
}

// Helper for confetti threshold
const shouldConfetti = (total: number) => total >= 2500;

// Local Label component
const Label: React.FC<React.HTMLProps<HTMLLabelElement>> = ({ children, ...props }) => (
  <label {...props} className="block text-sm font-medium mb-1">
    {children}
  </label>
);

// Local Slider component (input range)
interface SliderProps {
  value: number[];
  onValueChange: (v: number[]) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
}
const Slider: React.FC<SliderProps> = ({ value, onValueChange, min, max, step = 1, disabled }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      disabled={disabled}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 dark:bg-gray-700"
    />
  );
};

const SolarXCommissionCalculator: React.FC = () => {
  // Authentication state
  const [authed, setAuthed] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    // read auth from localStorage
    try {
      const saved = localStorage.getItem("sx_authed");
      if (saved === "1") setAuthed(true);
    } catch {}
  }, []);

  const handleLogin = () => {
    if (username === "SolarX4EVER." && password === "20kAmonth!") {
      setAuthed(true);
      try {
        localStorage.setItem("sx_authed", "1");
      } catch {}
    } else {
      alert("Incorrect credentials");
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    try {
      localStorage.removeItem("sx_authed");
    } catch {}
  };

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("sx_dark") === "1";
      } catch {}
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem("sx_dark", darkMode ? "1" : "0");
    } catch {}
  }, [darkMode]);

  // Accent state (sunset or bw)
  type Accent = "sunset" | "bw";
  const [accent, setAccent] = useState<Accent>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sx_accent") as Accent | null;
        if (stored === "sunset" || stored === "bw") return stored;
      } catch {}
    }
    return "sunset";
  });

  useEffect(() => {
    try {
      localStorage.setItem("sx_accent", accent);
    } catch {}
  }, [accent]);

  // Sale kind (loan or tpo)
  type SaleKind = "loan" | "tpo";
  const [saleKind, setSaleKind] = useState<SaleKind>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sx_sale") as SaleKind | null;
        if (stored === "loan" || stored === "tpo") return stored;
      } catch {}
    }
    return "loan";
  });

  useEffect(() => {
    try {
      localStorage.setItem("sx_sale", saleKind);
    } catch {}
  }, [saleKind]);

  // Input states
  const [deals, setDeals] = useState<number>(0);
  const [ppw, setPpw] = useState<number>(2.4);
  const [watts, setWatts] = useState<number>(4000);

  // Computed result
  const [result, setResult] = useState(() => computePayout(deals, ppw, watts));

  useEffect(() => {
    if (saleKind === "loan") {
      setResult(computePayout(deals, ppw, watts));
    } else {
      // TPO/PPA: only base payout, no ppw or system bonus
      const baseOnly = computePayout(deals, ppw, watts);
      setResult({ ...baseOnly, ppwBonus: 0, bigSystemBonus: 0, total: baseOnly.base });
    }
  }, [deals, ppw, watts, saleKind]);

  // Determine accent classes
  const accentColor = accent === "sunset" ? "text-rose-600" : darkMode ? "text-white" : "text-gray-900";
  const accentBg = accent === "sunset" ? "bg-rose-500" : darkMode ? "bg-gray-700" : "bg-gray-200";

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} min-h-screen p-4`}>      
      {/* Top controls */}
      {authed && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex gap-2">
            <Button onClick={() => setDarkMode(false)} className={darkMode ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"}>Light</Button>
            <Button onClick={() => setDarkMode(true)} className={darkMode ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}>Dark</Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAccent("sunset")}
              className={`${accent === "sunset" ? accentBg + " text-white" : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"} hover:opacity-90`}>
              Sunset
            </Button>
            <Button onClick={() => setAccent("bw")}
              className={`${accent === "bw" ? accentBg + " " + (darkMode ? "text-white" : "text-gray-900") : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"} hover:opacity-90`}>
              B&W
            </Button>
          </div>
          <Button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600">Logout</Button>
        </div>
      )}

      {/* Auth gate */}
      {!authed ? (
        <div className="flex justify-center items-center h-[80vh]">
          <Card className="w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle>🔒 Secure Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <Button onClick={handleLogin} className="w-full bg-blue-500 text-white hover:bg-blue-600">Login</Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Main calculator */
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Solar X • Commission Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sale kind toggle */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setSaleKind("loan")}
                  className={`${saleKind === "loan" ? accentBg + " text-white" : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"} px-4 py-2 rounded-md hover:opacity-90`}
                >
                  Loan/Cash
                </Button>
                <Button
                  onClick={() => setSaleKind("tpo")}
                  className={`${saleKind === "tpo" ? accentBg + " text-white" : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"} px-4 py-2 rounded-md hover:opacity-90`}
                >
                  TPO/PPA
                </Button>
              </div>
              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="deals">Deals Closed (this month)</Label>
                  <Input
                    id="deals"
                    type="number"
                    min={0}
                    max={50}
                    value={deals}
                    onChange={(e) => setDeals(Math.max(0, Math.min(50, Number(e.target.value))))}
                  />
                  <Slider value={[deals]} onValueChange={(v) => setDeals(v[0])} min={0} max={30} step={1} />
                </div>
                <div>
                  <Label htmlFor="ppw">Price Per Watt (PPW)</Label>
                  <Input
                    id="ppw"
                    type="number"
                    step={0.01}
                    min={2.4}
                    max={4.5}
                    value={ppw}
                    onChange={(e) => setPpw(Number(e.target.value))}
                    disabled={saleKind === "tpo"}
                  />
                  <Slider
                    value={[ppw]}
                    onValueChange={(v) => setPpw(Number(v[0].toFixed(2)))}
                    min={2.4}
                    max={4.5}
                    step={0.01}
                    disabled={saleKind === "tpo"}
                  />
                </div>
                <div>
                  <Label htmlFor="watts">System Size (Watts)</Label>
                  <Input
                    id="watts"
                    type="number"
                    min={4000}
                    max={30000}
                    step={100}
                    value={watts}
                    onChange={(e) => setWatts(Number(e.target.value))}
                    disabled={saleKind === "tpo"}
                  />
                  <Slider
                    value={[watts]}
                    onValueChange={(v) => setWatts(v[0])}
                    min={4000}
                    max={30000}
                    step={100}
                    disabled={saleKind === "tpo"}
                  />
                </div>
              </div>
              {/* Results */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-md p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Base Payout</p>
                  <p className={`text-2xl font-bold ${accentColor}`}>${currency(result.base)}</p>
                </div>
                <div className="rounded-md p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">PPW Bonus</p>
                  <p className={`text-2xl font-bold ${accentColor}`}>${currency(result.ppwBonus)}</p>
                </div>
                <div className="rounded-md p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">System Bonus</p>
                  <p className={`text-2xl font-bold ${accentColor}`}>${currency(result.bigSystemBonus)}</p>
                </div>
                <div className="rounded-md p-4 border border-gray-200 dark:border-gray-700 ${shouldConfetti(result.total) ? 'ring-2 ring-yellow-400' : ''}">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Payout</p>
                  <p className={`text-3xl font-extrabold ${accentColor}`}>${currency(result.total)}</p>
                </div>
              </div>
              {/* Micro coach tip */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  {saleKind === "tpo"
                    ? "TPO/PPA selected: Only base payout varies with monthly deals."
                    : (() => {
                        const kw = watts / 1000;
                        const nextPpwTier = ppw < 3.0 ? 3.0 : ppw <= 3.2 ? 3.21 : ppw <= 3.5 ? 3.51 : ppw < 4.5 ? 4.51 : null;
                        const nextPpwDelta = nextPpwTier ? nextPpwTier - ppw : null;
                        let nextKw: number | null = null;
                        if (kw < 10) nextKw = 10;
                        else if (kw < 20) nextKw = Math.floor(kw) === kw ? kw + 1 : Math.ceil(kw);
                        else nextKw = null;
                        const nextKwDelta = nextKw ? nextKw - kw : null;
                        if (nextPpwDelta && nextPpwDelta > 0 && nextPpwDelta <= 0.1) {
                          const perKw = nextPpwTier && nextPpwTier >= 3.5 ? 100 : nextPpwTier && nextPpwTier > 3.2 ? 75 : nextPpwTier && nextPpwTier >= 3.0 ? 50 : 25;
                          return `Bump PPW by ${nextPpwDelta.toFixed(2)} to reach tier ${nextPpwTier.toFixed(2)} and unlock ~$${perKw}/kW.`;
                        }
                        if (nextKwDelta && nextKwDelta > 0 && nextKwDelta <= 1.0) {
                          const msg = nextKw === 10 ? "start the $200 system bonus" : "add another $50 system bonus";
                          return `Add ~${Math.ceil(nextKwDelta * 1000)} watts to hit ${nextKw} kW and ${msg}.`;
                        }
                        if (result.total < 2500) {
                          return "Push to $2.5k: raise PPW slightly or add panels to reach the next bonus tier.";
                        }
                        return "Nice! Lock it in. If homeowner is value-focused, anchor on lifetime savings vs. payment.";
                      })()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SolarXCommissionCalculator;
