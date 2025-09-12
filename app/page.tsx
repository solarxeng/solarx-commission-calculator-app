"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type SaleKind = "loan" | "tpo";

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

export default function Page() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saleKind, setSaleKind] = useState<SaleKind>("loan");
  const [deals, setDeals] = useState(0);
  const [ppw, setPpw] = useState(2.4);
  const [watts, setWatts] = useState(0);
  const [result, setResult] = useState(() => computePayout(0, 2.4, 0));

  useEffect(() => {
    const isAuth = typeof window !== "undefined" && localStorage.getItem("sx_authed") === "1";
    setAuthed(isAuth);
  }, []);

  useEffect(() => {
    setResult(compute());
  }, [deals, ppw, watts, saleKind]);

  const compute = () => {
    const base = computePayout(deals, ppw, watts);
    if (saleKind === "tpo") {
      return { ...base, ppwBonus: 0, bigSystemBonus: 0, total: base.base };
    }
    return base;
  };

  const handleLogin = () => {
    if (username === "SolarX4EVER." && password === "20kAmonth!") {
      localStorage.setItem("sx_authed", "1");
      setAuthed(true);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sx_authed");
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Card>
          <CardHeader>
          <CardTitle>🔒 Secure Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername((e.target as HTMLInputElement).value)} />
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} />
              <Button onClick={handleLogin}>Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <Button onClick={() => setSaleKind("loan")} style={{ marginRight: "0.5rem", backgroundColor: saleKind === "loan" ? "#ddd" : "#f5f5f5" }}>
            Loan/Cash
          </Button>
          <Button onClick={() => setSaleKind("tpo")} style={{ backgroundColor: saleKind === "tpo" ? "#ddd" : "#f5f5f5" }}>
            TPO/PPA
          </Button>
        </div>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>SolarX Commission Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <Label>Deals Closed (this month)</Label>
              <Input type="number" min={0} max={50} value={deals} onChange={(e) => setDeals(Math.max(0, Math.min(50, Number((e.target as HTMLInputElement).value))))} />
              <Slider value={[deals]} onValueChange={(v) => setDeals(v[0])} min={0} max={30} step={1} />
            </div>
            <div>
              <Label>Price Per Watt (PPW)</Label>
              <Input type="number" step={0.01} min={2.4} max={4.5} value={ppw} disabled={saleKind === "tpo"} onChange={(e) => setPpw(Math.max(2.4, Math.min(4.5, parseFloat((e.target as HTMLInputElement).value) || 0)))} />
              <Slider value={[ppw]} onValueChange={(v) => setPpw(v[0])} min={2.4} max={4.5} step={0.01} disabled={saleKind === "tpo"} />
            </div>
            <div>
              <Label>System Size (Watts)</Label>
              <Input type="number" min={0} max={30000} step={100} value={watts} disabled={saleKind === "tpo"} onChange={(e) => setWatts(Math.max(0, Math.min(30000, parseInt((e.target as HTMLInputElement).value) || 0)))} />
              <Slider value={[watts]} onValueChange={(v) => setWatts(v[0])} min={4000} max={30000} step={100} disabled={saleKind === "tpo"} />
            </div>
            <div>
              <Button onClick={() => setResult(compute())}>Recompute</Button>
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Card style={{ flex: 1 }}>
                <CardContent>
                  <Label>Base Payout</Label>
                  <div>${result.base}</div>
                </CardContent>
              </Card>
              <Card style={{ flex: 1 }}>
                <CardContent>
                  <Label>PPW Bonus</Label>
                  <div>${result.ppwBonus}</div>
                </CardContent>
              </Card>
              <Card style={{ flex: 1 }}>
                <CardContent>
                  <Label>System Bonus</Label>
                  <div>${result.bigSystemBonus}</div>
                </CardContent>
              </Card>
              <Card style={{ flex: 1 }}>
                <CardContent>
                  <Label>Total Payout</Label>
                  <div>${result.total}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
