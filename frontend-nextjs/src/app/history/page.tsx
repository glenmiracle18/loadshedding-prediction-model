"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  History,
  MapPin,
  Calendar,
  Zap,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { predictionsApi } from "@/lib/api";
import type { PredictionResponse } from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPrediction, setSelectedPrediction] =
    useState<PredictionResponse | null>(null);
  const pageSize = 10;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadPredictions();
  }, [currentPage, isAuthenticated]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const response = await predictionsApi.getUserPredictions(
        pageSize,
        currentPage * pageSize,
      );
      if (response.success && response.data) {
        setPredictions(response.data);
        setHasMore(response.data.length === pageSize);
      }
    } catch (error) {
      console.error("Failed to load predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePrediction = async (id: number) => {
    setDeleting(id);
    try {
      const response = await predictionsApi.deletePrediction(id);
      if (response.success) {
        setPredictions(predictions.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete prediction:", error);
    } finally {
      setDeleting(null);
    }
  };

  const getStageInfo = (stage: number) => {
    const stages = {
      0: {
        label: "No Load Shedding",
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        border: "border-green-400/50",
      },
      1: {
        label: "Stage 1",
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
        border: "border-yellow-400/50",
      },
      2: {
        label: "Stage 2",
        color: "text-orange-400",
        bgColor: "bg-orange-400/10",
        border: "border-orange-400/50",
      },
      3: {
        label: "Stage 3",
        color: "text-red-400",
        bgColor: "bg-red-400/10",
        border: "border-red-400/50",
      },
      4: {
        label: "Stage 4",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        border: "border-red-500/50",
      },
      5: {
        label: "Stage 5",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        border: "border-red-500/50",
      },
      6: {
        label: "Stage 6",
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
      <div className="max-w-6xl mx-auto pt-24 pb-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-display text-4xl font-bold text-white">
              Prediction History
            </h1>
          </div>
          <p className="text-lg text-white/70">
            View and manage your load shedding prediction history
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-white/70 text-lg">Loading your predictions...</p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded flex items-center justify-center mx-auto mb-4">
                <History size={24} className="text-white/60" />
              </div>
              <h3 className="text-display text-2xl font-bold text-white mb-2">
                No predictions yet
              </h3>
              <p className="text-white/70 text-lg mb-4">
                Start making predictions to see your history here
              </p>
              <button
                onClick={() => router.push("/predict")}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded transition-colors"
              >
                Make Your First Prediction
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Date/Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {predictions.map((prediction) => {
                      const stageInfo = getStageInfo(
                        prediction.predicted_stage,
                      );
                      return (
                        <tr key={prediction.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${stageInfo.bgColor} ${stageInfo.color} border ${stageInfo.border}`}
                            >
                              Stage {prediction.predicted_stage}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin
                                size={16}
                                className="text-white/60 mr-2"
                              />
                              <span className="text-sm text-white">
                                {prediction.location}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar
                                size={16}
                                className="text-white/60 mr-2"
                              />
                              <span className="text-sm text-white">
                                {new Date(
                                  prediction.datetime,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {(prediction.confidence_score * 100).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white capitalize">
                            {prediction.model_used.replace("_", " ")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setSelectedPrediction(prediction)
                                }
                                className="text-amber-400 hover:text-amber-300 p-1 rounded transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => deletePrediction(prediction.id)}
                                disabled={deleting === prediction.id}
                                className="text-red-400 hover:text-red-300 p-1 rounded disabled:opacity-50 transition-colors"
                              >
                                {deleting === prediction.id ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 flex items-center justify-between border-t border-white/20 sm:px-6">
                <div className="flex justify-between items-center w-full">
                  <p className="text-sm text-white/70">
                    Showing page {currentPage + 1}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(0, currentPage - 1))
                      }
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-2 py-2 border border-white/20 bg-white/10 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!hasMore}
                      className="relative inline-flex items-center px-2 py-2 border border-white/20 bg-white/10 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {selectedPrediction && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPrediction(null)}
          >
            <div
              className="bg-slate-800 border border-white/20 rounded p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-display text-xl font-bold text-white">
                  Prediction Details
                </h3>
                <button
                  onClick={() => setSelectedPrediction(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <History size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div
                  className={`p-4 rounded border ${getStageInfo(selectedPrediction.predicted_stage).bgColor} ${getStageInfo(selectedPrediction.predicted_stage).border}`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">
                      <span
                        className={
                          getStageInfo(selectedPrediction.predicted_stage).color
                        }
                      >
                        Stage {selectedPrediction.predicted_stage}
                      </span>
                    </div>
                    <h4
                      className={`text-lg font-semibold ${getStageInfo(selectedPrediction.predicted_stage).color}`}
                    >
                      {getStageInfo(selectedPrediction.predicted_stage).label}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/5 border border-white/10 rounded">
                    <p className="text-sm text-white/60">Confidence</p>
                    <p className="text-lg font-semibold text-white">
                      {(selectedPrediction.confidence_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/5 border border-white/10 rounded">
                    <p className="text-sm text-white/60">Model</p>
                    <p className="text-sm font-medium text-white capitalize">
                      {selectedPrediction.model_used.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-white/80">
                  <p>
                    <span className="text-white/50">Location:</span>{" "}
                    {selectedPrediction.location}
                  </p>
                  <p>
                    <span className="text-white/50">Date/Time:</span>{" "}
                    {new Date(selectedPrediction.datetime).toLocaleString()}
                  </p>
                  <p>
                    <span className="text-white/50">Generated:</span>{" "}
                    {new Date(selectedPrediction.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      router.push(
                        `/costs?stage=${selectedPrediction.predicted_stage}&location=${selectedPrediction.location}`,
                      );
                      setSelectedPrediction(null);
                    }}
                    className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition-colors text-sm"
                  >
                    Calculate Costs
                  </button>
                  <button
                    onClick={() => setSelectedPrediction(null)}
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
