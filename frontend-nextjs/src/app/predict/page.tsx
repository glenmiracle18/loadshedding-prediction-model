"use client";

import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useState, useEffect } from "react";
import {
  Zap,
  MapPin,
  Calendar,
  Clock,
  Droplets,
  BarChart3,
  Loader2,
  ArrowRight,
  Calculator,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { predictionsApi } from "@/lib/api";
import type { PredictionRequest, PredictionResponse } from "@/lib/api";

export default function PredictPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, router]);

  const form = useForm({
    defaultValues: {
      location: "",
      datetime: "",
      date: "",
      time: "",
      humidity: undefined as number | undefined,
      demand_forecast: undefined as number | undefined,
    },
    onSubmit: async ({ value }: { value: any }) => {
      setLoading(true);
      setError(null);
      setPrediction(null);

      try {
        // Combine date and time into datetime field
        const datetime = `${value.date}T${value.time}`;
        const requestData = {
          ...value,
          datetime,
        };
        delete requestData.date;
        delete requestData.time;

        const response = await predictionsApi.createPrediction(requestData);

        if (response.success && response.data) {
          setPrediction(response.data);
        } else {
          // Check if it's a session expiry error
          if (response.error?.includes("Session expired")) {
            // Don't show error, user will be logged out automatically
            return;
          }
          setError(response.error || "Prediction failed");
        }
      } catch (err) {
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const getStageInfo = (stage: number) => {
    const stages = {
      0: {
        label: "No Load Shedding",
        description: "Power supply is stable with no interruptions",
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        border: "border-green-400/50",
      },
      1: {
        label: "Stage 1",
        description: "2-hour power cuts, typically during peak hours",
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
        border: "border-yellow-400/50",
      },
      2: {
        label: "Stage 2",
        description: "4-hour power cuts scheduled throughout the day",
        color: "text-orange-400",
        bgColor: "bg-orange-400/10",
        border: "border-orange-400/50",
      },
      3: {
        label: "Stage 3",
        description: "6-hour power cuts with increased frequency",
        color: "text-red-400",
        bgColor: "bg-red-400/10",
        border: "border-red-400/50",
      },
      4: {
        label: "Stage 4",
        description: "8-hour power cuts affecting daily routines",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        border: "border-red-500/50",
      },
      5: {
        label: "Stage 5",
        description: "10-hour power cuts with severe disruptions",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        border: "border-red-500/50",
      },
      6: {
        label: "Stage 6",
        description: "12-hour power cuts causing major inconvenience",
        color: "text-red-600",
        bgColor: "bg-red-600/10",
        border: "border-red-600/50",
      },
      7: {
        label: "Stage 7",
        description: "14-hour power cuts with critical supply shortage",
        color: "text-red-600",
        bgColor: "bg-red-600/10",
        border: "border-red-600/50",
      },
      8: {
        label: "Stage 8",
        description: "16-hour power cuts - emergency supply levels",
        color: "text-red-600",
        bgColor: "bg-red-600/10",
        border: "border-red-600/50",
      },
    };
    return stages[stage as keyof typeof stages] || stages[0];
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 px-6">
      <div className="max-w-4xl mx-auto pt-34 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-display text-4xl font-bold text-white mb-4">
            Load Shedding Prediction
          </h1>
          <p className="text-lg text-white/70">
            Get AI-powered predictions for load shedding stages
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prediction Form */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded p-6">
            <h2 className="text-display text-2xl font-bold text-white mb-6">
              Make Prediction
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              {/* Location */}
              <form.Field name="location">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      City
                    </label>
                    <select
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-3 border border-white/20 bg-white/10 text-white rounded focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      required
                    >
                      <option value="">Select your city</option>
                      <option value="Cape Town">Cape Town</option>
                      <option value="Johannesburg">Johannesburg</option>
                      <option value="Durban">Durban</option>
                      <option value="Pretoria">Pretoria</option>
                      <option value="Port Elizabeth">Port Elizabeth</option>
                      <option value="Bloemfontein">Bloemfontein</option>
                    </select>
                  </div>
                )}
              </form.Field>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field name="date">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        <Calendar size={16} className="inline mr-2" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        min={getCurrentDate()}
                        className="w-full px-3 py-3 border border-white/20 bg-white/10 text-white rounded focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        required
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="time">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        <Clock size={16} className="inline mr-2" />
                        Time
                      </label>
                      <input
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-3 py-3 border border-white/20 bg-white/10 text-white rounded focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        required
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Essential Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field name="humidity">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        <Droplets size={16} className="inline mr-2" />
                        Humidity (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                        className="w-full px-3 py-3 border border-white/20 bg-white/10 text-white placeholder:text-white/50 rounded focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        placeholder="e.g., 65"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="demand_forecast">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        <BarChart3 size={16} className="inline mr-2" />
                        Demand Forecast (MW)
                      </label>
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                        className="w-full px-3 py-3 border border-white/20 bg-white/10 text-white placeholder:text-white/50 rounded focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        placeholder="e.g., 32000"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-400/50 rounded">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-white/20 text-white font-semibold rounded transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Getting Prediction...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Get Prediction
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Prediction Result */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded p-6">
            <h2 className="text-display text-2xl font-bold text-white mb-6">
              Prediction Result
            </h2>

            {!prediction && !loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded mb-4">
                  <Zap size={24} className="text-white/60" />
                </div>
                <p className="text-white/70 text-lg">
                  Complete the form to get your prediction
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded mb-4">
                  <Loader2 size={24} className="text-amber-500 animate-spin" />
                </div>
                <p className="text-white/70 text-lg">
                  Processing your prediction...
                </p>
              </div>
            )}

            {prediction && (
              <div className="space-y-6">
                <div
                  className={`p-6 rounded border ${getStageInfo(prediction.predicted_stage).bgColor} ${getStageInfo(prediction.predicted_stage).border}`}
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      <span
                        className={
                          getStageInfo(prediction.predicted_stage).color
                        }
                      >
                        Stage {prediction.predicted_stage}
                      </span>
                    </div>
                    <p className="text-white/80 text-lg">
                      {getStageInfo(prediction.predicted_stage).description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 backdrop-blur border border-white/10 rounded">
                    <h4 className="text-sm text-white/60 mb-1">Confidence</h4>
                    <p className="text-2xl font-semibold text-white">
                      {(prediction.confidence_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 backdrop-blur border border-white/10 rounded">
                    <h4 className="text-sm text-white/60 mb-1">Model Used</h4>
                    <p className="text-lg font-medium text-white capitalize">
                      {prediction.model_used.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 backdrop-blur border border-white/10 rounded">
                  <h4 className="text-sm text-white/60 mb-2">Details</h4>
                  <div className="space-y-1 text-sm text-white/80">
                    <p>
                      <span className="text-white/50">Location:</span>{" "}
                      {prediction.location}
                    </p>
                    <p>
                      <span className="text-white/50">Date/Time:</span>{" "}
                      {new Date(prediction.datetime).toLocaleString()}
                    </p>
                    <p>
                      <span className="text-white/50">Generated:</span>{" "}
                      {new Date(prediction.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() =>
                      router.push(
                        `/costs?stage=${prediction.predicted_stage}&location=${prediction.location}`,
                      )
                    }
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Calculator size={16} />
                    Calculate Costs
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push("/history")}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded transition-colors"
                    >
                      View History
                    </button>
                    <button
                      onClick={() => {
                        setPrediction(null);
                        form.reset();
                      }}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded transition-colors flex items-center justify-center gap-2"
                    >
                      New Prediction
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
