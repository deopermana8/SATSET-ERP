'use client';

import { useMemo, useState } from "react";
import type { PrintJobProps } from "../../domain/entities/print-job";

const mockPrintJobs: PrintJobProps[] = [
  {
    jobId: "PRN001",
    jobType: "receipt",
    content: "Receipt #INV-2024-001\n\nNasi Goreng x2 : Rp 70,000\nKopi Espresso x1 : Rp 18,000\n\nTotal: Rp 88,000",
    contentData: {
      receiptNo: "INV-2024-001",
      items: ["Nasi Goreng x2", "Kopi Espresso x1"],
      total: 88000,
    },
    status: "completed",
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    completedAt: new Date(Date.now() - 18 * 60 * 1000),
  },
  {
    jobId: "PRN002",
    jobType: "order",
    content: "Kitchen Order #002\n\nTable: T-03\n2× Mie Goreng (pedas sedang)\n1× Iced Tea",
    contentData: {
      orderNo: "002",
      tableNo: "T-03",
      priority: "normal",
    },
    status: "printing",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    jobId: "PRN003",
    jobType: "invoice",
    content: "Invoice #INV-2024-003\n\nSubtotal: Rp 500,000\nDiskon: Rp 50,000\nTotal: Rp 450,000",
    contentData: {
      invoiceNo: "INV-2024-003",
      subtotal: 500000,
      discount: 50000,
    },
    status: "pending",
    createdAt: new Date(Date.now() - 30 * 1000),
  },
  {
    jobId: "PRN004",
    jobType: "report",
    content: "Daily Sales Report\n\nTotal Orders: 45\nTotal Sales: Rp 3,240,000",
    contentData: {
      reportType: "daily-sales",
      orderCount: 45,
      totalSales: 3240000,
    },
    status: "failed",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    errorMessage: "Paper jam in printer",
  },
];

export function ThermalPrintPanel() {
  const [printJobs, setPrintJobs] = useState<PrintJobProps[]>(mockPrintJobs);
  const [selectedJob, setSelectedJob] = useState<PrintJobProps | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredJobs = useMemo(() => {
    if (filterStatus === "all") return printJobs;
    return printJobs.filter((job) => job.status === filterStatus);
  }, [printJobs, filterStatus]);

  const stats = useMemo(() => {
    return {
      pending: printJobs.filter((j) => j.status === "pending").length,
      printing: printJobs.filter((j) => j.status === "printing").length,
      completed: printJobs.filter((j) => j.status === "completed").length,
      failed: printJobs.filter((j) => j.status === "failed").length,
    };
  }, [printJobs]);

  const handlePrint = (jobIndex: number) => {
    const job = printJobs[jobIndex];
    if (job.status === "pending") {
      job.status = "printing";
      setPrintJobs([...printJobs]);

      setTimeout(() => {
        const updatedJob = printJobs[jobIndex];
        if (updatedJob && updatedJob.status === "printing") {
          updatedJob.status = "completed";
          updatedJob.completedAt = new Date();
          setPrintJobs([...printJobs]);
        }
      }, 2000);
    }
  };

  const handleRetry = (jobIndex: number) => {
    const job = printJobs[jobIndex];
    if (job.status === "failed") {
      job.status = "pending";
      job.errorMessage = undefined;
      setPrintJobs([...printJobs]);
    }
  };

  const handleTestPrint = () => {
    const newJob: PrintJobProps = {
      jobId: `PRN-TEST-${Date.now()}`,
      jobType: "receipt",
      content: "Test Receipt\n\nTest Item x1: Rp 10,000\n\nTotal: Rp 10,000",
      contentData: { test: true },
      status: "pending",
      createdAt: new Date(),
    };

    setPrintJobs([newJob, ...printJobs]);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Thermal Printing</p>
        <h2 className="text-2xl font-semibold text-slate-900">Thermal Printer Management</h2>
        <p className="text-sm text-slate-600">Queue management untuk thermal printer, receipt & order printing</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-xs font-semibold uppercase text-orange-600">Pending</p>
          <p className="text-2xl font-bold text-orange-900">{stats.pending}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase text-blue-600">Printing</p>
          <p className="text-2xl font-bold text-blue-900">{stats.printing}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase text-emerald-600">Completed</p>
          <p className="text-2xl font-bold text-emerald-900">{stats.completed}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase text-red-600">Failed</p>
          <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {["all", "pending", "printing", "completed", "failed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              filterStatus === status
                ? "bg-cyan-600 text-white"
                : "border border-slate-300 text-slate-600 hover:border-cyan-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        <button
          onClick={handleTestPrint}
          className="rounded-lg bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-800 transition"
        >
          🖨️ Test Print
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredJobs.length === 0 ? (
            <p className="text-center text-sm text-slate-500">No print jobs in this status</p>
          ) : (
            filteredJobs.map((job, idx) => {
              const jobIndex = printJobs.indexOf(job);
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedJob(job)}
                  className={`rounded-lg border-2 p-3 cursor-pointer transition ${
                    selectedJob === job
                      ? "border-cyan-400 bg-cyan-50"
                      : job.status === "completed"
                        ? "border-emerald-300 bg-emerald-50"
                        : job.status === "printing"
                          ? "border-blue-300 bg-blue-50"
                          : job.status === "failed"
                            ? "border-red-300 bg-red-50"
                            : "border-orange-300 bg-orange-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{job.jobId}</p>
                      <p className="text-xs text-slate-600">{job.jobType.toUpperCase()}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        job.status === "pending"
                          ? "bg-orange-200 text-orange-900"
                          : job.status === "printing"
                            ? "bg-blue-200 text-blue-900"
                            : job.status === "completed"
                              ? "bg-emerald-200 text-emerald-900"
                              : "bg-red-200 text-red-900"
                      }`}
                    >
                      {job.status === "printing" ? "🖨️ PRINTING" : job.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-2">{job.createdAt.toLocaleTimeString("id-ID")}</p>

                  <div className="mb-2 flex gap-2">
                    {job.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrint(jobIndex);
                        }}
                        className="flex-1 rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        Print Now
                      </button>
                    )}
                    {job.status === "failed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetry(jobIndex);
                        }}
                        className="flex-1 rounded bg-orange-600 px-2 py-1 text-xs font-semibold text-white hover:bg-orange-700 transition"
                      >
                        Retry
                      </button>
                    )}
                  </div>

                  {job.errorMessage && (
                    <p className="text-xs text-red-600">⚠️ {job.errorMessage}</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {selectedJob && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-900">Preview</p>
            <div className="mb-4 rounded bg-white p-3 font-mono text-xs leading-relaxed text-slate-900 border border-slate-200 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
              {selectedJob.content}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Job ID:</span>
                <span className="font-semibold text-slate-900">{selectedJob.jobId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Type:</span>
                <span className="font-semibold text-slate-900">{selectedJob.jobType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span
                  className={`font-semibold ${
                    selectedJob.status === "completed"
                      ? "text-emerald-600"
                      : selectedJob.status === "printing"
                        ? "text-blue-600"
                        : selectedJob.status === "failed"
                          ? "text-red-600"
                          : "text-orange-600"
                  }`}
                >
                  {selectedJob.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Wait Time:</span>
                <span className="font-semibold text-slate-900">
                  {Math.floor((Date.now() - selectedJob.createdAt.getTime()) / 1000)}s
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
