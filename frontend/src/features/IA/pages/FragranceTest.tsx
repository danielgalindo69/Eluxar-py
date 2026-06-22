import { useState } from "react";
import { aiAPI } from "../../../core/api/api";
import { TestState, Phase } from "../components/fragrance-test/types";
import { FragranceTestIdle } from "../components/fragrance-test/FragranceTestIdle";
import { FragranceTestLoading } from "../components/fragrance-test/FragranceTestLoading";
import { FragranceTestQuestion } from "../components/fragrance-test/FragranceTestQuestion";
import { FragranceTestResult } from "../components/fragrance-test/FragranceTestResult";

export const FragranceTest = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [state, setState] = useState<TestState | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* Start the test: call step=0, message="" */
  const handleStart = async () => {
    setPhase("loading");
    setErrorMsg(null);
    try {
      const data = await aiAPI.fragranceTest("", [], 0);
      setState(data as TestState);
      setPhase("question");
      setSelectedOption(null);
    } catch (err: any) {
      console.error("[FragranceTest] Error al iniciar:", err);
      setErrorMsg(err?.message || "Error al conectar con el servidor IA (localhost:5000)");
      setPhase("idle");
    }
  };

  /* User clicks an option — auto-advance */
  const handleOptionClick = async (option: string) => {
    if (!state || isAdvancing) return;

    setSelectedOption(option);
    setIsAdvancing(true);

    // Brief visual feedback before advancing
    await new Promise((r) => setTimeout(r, 320));

    const isFinalQuestion = state.step === state.totalSteps;

    if (isFinalQuestion) {
      // Show loading while AI generates the recommendation
      setPhase("loading");
    }

    const updatedHistory = [
      ...state.history,
      { question: state.question, answer: option }
    ];

    try {
      const data = await aiAPI.fragranceTest(option, updatedHistory, state.step);
      setState(data as TestState);

      if ((data as TestState).finished) {
        setPhase("result");
      } else {
        setPhase("question");
      }
    } catch (err: any) {
      console.error("[FragranceTest] Error al avanzar:", err);
      setErrorMsg(err?.message || "Error al conectar con el servidor IA");
      setPhase("question");
    } finally {
      setSelectedOption(null);
      setIsAdvancing(false);
    }
  };

  /* Reset the entire test */
  const handleReset = () => {
    setPhase("idle");
    setState(null);
    setSelectedOption(null);
    setIsAdvancing(false);
    setErrorMsg(null);
  };

  const progress =
    state && state.totalSteps > 0
      ? ((state.step - 1) / state.totalSteps) * 100
      : 0;

  /* ── ORCHESTRATION ─────────────────────────────────────────────────────── */
  if (phase === "idle") {
    return <FragranceTestIdle onStart={handleStart} errorMsg={errorMsg} />;
  }

  if (phase === "loading") {
    const isAnalyzing = state && state.step > state.totalSteps;
    return <FragranceTestLoading isAnalyzing={!!isAnalyzing} />;
  }

  if (phase === "question" && state) {
    return (
      <FragranceTestQuestion
        state={state}
        selectedOption={selectedOption}
        isAdvancing={isAdvancing}
        errorMsg={errorMsg}
        progress={progress}
        onOptionClick={handleOptionClick}
      />
    );
  }

  if (phase === "result" && state) {
    return <FragranceTestResult state={state} onReset={handleReset} />;
  }

  return null;
};
