"use client";

import React, { forwardRef } from "react";
import { RenewalNotice } from "@/hooks/useRenewals";

interface RenewalPdfTemplateProps {
  renewal: RenewalNotice;
  singlePageMode?: boolean;
}

export const RenewalPdfTemplate = forwardRef<HTMLDivElement, RenewalPdfTemplateProps>(
  ({ renewal, singlePageMode = true }, ref) => {
    const formattedSubtotal = Number(renewal.subtotal || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedTax = Number(renewal.taxAmount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedTotal = Number(renewal.totalAmount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return (
      <div
        ref={ref}
        id={`renewal-print-${renewal.id}`}
        style={{
          width: "794px",
          minHeight: singlePageMode ? "1123px" : "auto",
          height: singlePageMode ? "1123px" : "auto",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <div>
          {/* Top Navy Header Banner */}
          <div
            style={{
              backgroundColor: "#0c192c",
              padding: "26px 36px 20px 36px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "4px solid #c59b27",
            }}
          >
            {/* Left Header: Agency Info */}
            <div>
              <h1
                style={{
                  color: "#ffffff",
                  fontSize: "26px",
                  fontWeight: "800",
                  margin: 0,
                  letterSpacing: "-0.5px",
                  lineHeight: "1.2",
                }}
              >
                Digital Dictionary
              </h1>
              <div
                style={{
                  color: "#d4a34b",
                  fontSize: "10.5px",
                  fontWeight: "700",
                  letterSpacing: "1.4px",
                  textTransform: "uppercase",
                  marginTop: "5px",
                }}
              >
                DIGITAL MARKETING & WEB DESIGN AGENCY
              </div>
              <div
                style={{
                  color: "#cbd5e1",
                  fontSize: "11px",
                  marginTop: "9px",
                  lineHeight: "1.4",
                }}
              >
                Email: admin07digitaldictionary@gmail.com
              </div>
              <div
                style={{
                  color: "#cbd5e1",
                  fontSize: "11px",
                  lineHeight: "1.4",
                }}
              >
                Siliguri, West Bengal, India
              </div>
            </div>

            {/* Right Header: Logo & Notice Meta */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <div style={{ marginBottom: "6px" }}>
                <img
                  src="/logo.png"
                  alt="Digital Dictionary"
                  style={{
                    height: "52px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div
                style={{
                  color: "#d4a34b",
                  fontSize: "20px",
                  fontWeight: "800",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  lineHeight: "1.2",
                }}
              >
                RENEWAL NOTICE
              </div>
              <div
                style={{
                  color: "#cbd5e1",
                  fontSize: "11.5px",
                  marginTop: "5px",
                }}
              >
                Notice Date: {renewal.noticeDate}
              </div>
              <div
                style={{
                  color: "#cbd5e1",
                  fontSize: "11.5px",
                  marginTop: "2px",
                }}
              >
                Status: {renewal.status}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ padding: "30px 36px 0 36px" }}>
            {/* Meta Row: Prepared For vs Account Summary */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "22px",
              }}
            >
              {/* Prepared For */}
              <div>
                <div
                  style={{
                    color: "#8492a6",
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                  }}
                >
                  PREPARED FOR
                </div>
                <div
                  style={{
                    color: "#0f172a",
                    fontSize: "16px",
                    fontWeight: "700",
                    lineHeight: "1.3",
                  }}
                >
                  {renewal.clientName || "Valued Client"}
                </div>
                {renewal.companyName && (
                  <div
                    style={{
                      color: "#334155",
                      fontSize: "13.5px",
                      fontWeight: "500",
                      marginTop: "2px",
                    }}
                  >
                    {renewal.companyName}
                  </div>
                )}
                {renewal.addressLine1 && (
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "12.5px",
                      marginTop: "2px",
                    }}
                  >
                    {renewal.addressLine1}
                  </div>
                )}
                {renewal.addressLine2 && (
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "12.5px",
                      marginTop: "2px",
                    }}
                  >
                    {renewal.addressLine2}
                  </div>
                )}
              </div>

              {/* Account Summary */}
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    color: "#8492a6",
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                  }}
                >
                  ACCOUNT SUMMARY
                </div>
                <div
                  style={{
                    color: "#1e293b",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Service Cycle: {renewal.serviceCycle}
                </div>
                <div
                  style={{
                    color: "#1e293b",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginTop: "3px",
                  }}
                >
                  Renewal Due: {renewal.renewalDue}
                </div>
              </div>
            </div>

            {/* Salutation & Friendly Reminder Body */}
            <div style={{ marginBottom: "22px" }}>
              <div
                style={{
                  color: "#0f172a",
                  fontSize: "14px",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                {renewal.salutation || `Dear ${renewal.clientName},`}
              </div>
              <p
                style={{
                  color: "#334155",
                  fontSize: "12px",
                  lineHeight: "1.65",
                  margin: 0,
                  textAlign: "justify",
                }}
              >
                {renewal.messageText}
              </p>
            </div>

            {/* Table of Services */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "14px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#0c192c" }}>
                  <th
                    style={{
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      padding: "10px 16px",
                      textAlign: "left",
                      textTransform: "uppercase",
                    }}
                  >
                    SERVICE DESCRIPTION
                  </th>
                  <th
                    style={{
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      padding: "10px 16px",
                      textAlign: "right",
                      textTransform: "uppercase",
                      width: "140px",
                    }}
                  >
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                {renewal.items && renewal.items.length > 0 ? (
                  renewal.items.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        <div
                          style={{
                            color: "#0f172a",
                            fontSize: "13px",
                            fontWeight: "700",
                            lineHeight: "1.3",
                          }}
                        >
                          {item.title}
                        </div>
                        {item.description && (
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: "11.5px",
                              lineHeight: "1.45",
                              marginTop: "4px",
                            }}
                          >
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          verticalAlign: "top",
                          color: "#0f172a",
                          fontSize: "13px",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ₹
                        {Number(item.amount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          color: "#0f172a",
                          fontSize: "13px",
                          fontWeight: "700",
                        }}
                      >
                        Annual Digital Marketing & Web Services
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        color: "#0f172a",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      ₹{formattedTotal}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals Block */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "20px",
              }}
            >
              <div style={{ width: "270px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    color: "#64748b",
                    fontSize: "12.5px",
                  }}
                >
                  <span>Subtotal</span>
                  <span style={{ color: "#1e293b", fontWeight: "600" }}>
                    ₹{formattedSubtotal}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    color: "#64748b",
                    fontSize: "12.5px",
                  }}
                >
                  <span>Tax / GST</span>
                  <span style={{ color: "#1e293b", fontWeight: "600" }}>
                    ₹{formattedTax}
                  </span>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #e2e8f0",
                    margin: "6px 0",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#0f172a",
                      fontSize: "14.5px",
                      fontWeight: "700",
                    }}
                  >
                    Total Amount Due
                  </span>
                  <span
                    style={{
                      color: "#c59b27",
                      fontSize: "16.5px",
                      fontWeight: "800",
                    }}
                  >
                    ₹{formattedTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Terms & Support Callout */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderLeft: "4px solid #0c192c",
                padding: "12px 16px",
                borderRadius: "2px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  color: "#475569",
                  fontSize: "11px",
                  lineHeight: "1.55",
                }}
              >
                <strong style={{ color: "#0f172a" }}>Payment Terms & Support:</strong>{" "}
                {renewal.paymentTerms}
              </div>
            </div>

            {/* Sign-off */}
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  color: "#334155",
                  fontSize: "13px",
                  marginBottom: "6px",
                }}
              >
                Sincerely,
              </div>
              <div
                style={{
                  color: "#0f172a",
                  fontSize: "14px",
                  fontWeight: "700",
                }}
              >
                {renewal.signatoryName || "Arick Biswas"}
              </div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: "11.5px",
                  marginTop: "2px",
                }}
              >
                {renewal.signatoryDesignation || "Founder & CEO, Digital Dictionary"}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div
          style={{
            padding: "16px 36px 24px 36px",
            borderTop: "1px solid #f1f5f9",
            textAlign: "center",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              color: "#94a3b8",
              fontSize: "11px",
              lineHeight: "1.4",
            }}
          >
            {renewal.footerNote ||
              "Thank you for choosing Digital Dictionary to scale your digital presence. We value your partnership."}
          </div>
        </div>
      </div>
    );
  }
);

RenewalPdfTemplate.displayName = "RenewalPdfTemplate";
